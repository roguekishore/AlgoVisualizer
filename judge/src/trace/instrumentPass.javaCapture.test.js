/**
 * Java variable-capture + output-purity tests for the instrumentation pass
 * (task 19.2).
 *
 * Phase 2 makes each trace event carry the *values* of the variables in scope
 * at that step, serialized on the dedicated trace channel by the generated
 * `__VTrace` Java runtime (4-arg `emit`, reflective `repr`, `view.kind`
 * tagging — task 19.1). This file validates two things for Java:
 *
 *   1. Output purity (Property 9 / Requirements 7.2, R9): an instrumented
 *      fixture still compiles (javac) and runs (java) and produces stdout that
 *      is byte-for-byte identical to the un-instrumented program for the same
 *      stdin, and trace data never leaks into stdout.
 *
 *   2. Variable capture (Requirements R9, R10): a stepping fixture (a loop that
 *      fills an `int[]`, alongside a growing `ArrayList`) yields `vars` whose
 *      `view.kind` and values match expectations — the primitive array is
 *      captured as `array1d` and its values grow element-by-element across
 *      consecutive assignment steps, scalars are captured as `scalar`, and the
 *      `ArrayList` is captured as `list` with a non-decreasing size.
 *
 * Capture is a statement about *observable runtime behavior*, so (like the
 * task-5.2 output-purity test and the task-18.2 C++ capture test) it is
 * exercised as a host-mode integration test: we instrument the source, compile
 * + run both the original and instrumented programs with javac/java, capture
 * the trace channel (file named by env var VANTAGE_TRACE_FILE so it works on
 * Windows too, where fd 3 is unavailable) into a side file, and inspect the
 * emitted NDJSON events.
 *
 * If javac/java are unavailable, the test skips gracefully rather than failing,
 * matching the convention in `instrumentPass.outputPurity.test.js`.
 *
 * Uses the built-in `node:test` runner (see package.json "test" script).
 */

const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const { instrument } = require("./instrumentPass");
const { buildBlockTree } = require("./structuralPass");

// ─────────────────────────────────────────────────────────────────────────────
// Fixture: a loop that fills a primitive `int[]` (captured as array1d) while
// mirroring each element into an `ArrayList` (captured as list). The single
// `arr[i] = (i + 1) * 10;` assignment per iteration is the probed assignment
// statement, so the captured `arr` reflects the fully-filled-so-far array at
// each step:  [10,0,0] → [10,20,0] → [10,20,30].  The `list.add(...)` is a
// method call (not an assignment), so it fires *after* the arr-assignment probe
// — the list therefore lags by one element at the captured step, which is why
// we assert monotonic growth rather than exact equality for it.
//
// All values are non-zero multiples of 10 so "filled" entries are visually
// distinct from the array's zero-initialised tail. The program's stdout is
// deterministic and independent of the trace channel.
// ─────────────────────────────────────────────────────────────────────────────

const JAVA_ARRAY_FIXTURE = `import java.util.Scanner;
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        ArrayList<Integer> list = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            arr[i] = (i + 1) * 10;
            list.add(arr[i]);
        }
        System.out.println("first=" + arr[0]);
        System.out.println("last=" + arr[n - 1]);
        System.out.println("size=" + arr.length);
    }
}
`;

// Same stdin fed to both the original and the instrumented program.
const STDIN = "3\n";

// Expected, trace-independent stdout (n = 3 → arr = {10, 20, 30}).
const EXPECTED_STDOUT = "first=10\nlast=30\nsize=3\n";

// ─────────────────────────────────────────────────────────────────────────────
// Host-mode helpers (mirrors instrumentPass.outputPurity.test.js /
// instrumentPass.cppCapture.test.js)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Detect whether a compiler/runtime is on PATH by invoking a version probe.
 * @param {string} cmd
 * @param {string[]} args
 * @returns {boolean}
 */
function toolAvailable(cmd, args) {
  try {
    const r = spawnSync(cmd, args, { encoding: "utf8" });
    return !r.error && (r.status === 0 || typeof r.status === "number");
  } catch {
    return false;
  }
}

/** @returns {string} a fresh temp directory for one fixture run. */
function makeTmpDir(tag) {
  return fs.mkdtempSync(path.join(os.tmpdir(), `vtrace-jcapture-${tag}-`));
}

/**
 * Remove a temp directory, tolerating any brief file lock the JVM may hold
 * (retries, then gives up silently — cleanup must never fail the test).
 * @param {string} dir
 */
function cleanupDir(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  } catch {
    /* best-effort: leftover temp files are harmless */
  }
}

/**
 * Compile + run a Java program in host mode, capturing stdout and the trace
 * channel (named by VANTAGE_TRACE_FILE, so capture works on Windows where fd 3
 * is unavailable) into a side file.
 *
 * @param {string} dir - Working directory.
 * @param {string} source - Java source (public class must be `Main`).
 * @returns {{ ok: boolean, stdout?: Buffer, trace?: string, error?: string }}
 */
function runJava(dir, source) {
  const srcPath = path.join(dir, "Main.java");
  const tracePath = path.join(dir, "Main.trace");
  fs.writeFileSync(srcPath, source);

  const compile = spawnSync("javac", ["-d", dir, srcPath], { encoding: "utf8" });
  if (compile.error || compile.status !== 0) {
    return {
      ok: false,
      error: `javac failed (status ${compile.status}): ${compile.stderr || compile.error}`,
    };
  }

  const run = spawnSync("java", ["-cp", dir, "Main"], {
    input: STDIN,
    stdio: ["pipe", "pipe", "pipe"],
    env: { ...process.env, VANTAGE_TRACE_FILE: tracePath },
  });
  if (run.error) {
    return { ok: false, error: `run failed: ${run.error}` };
  }
  let trace = "";
  if (fs.existsSync(tracePath)) {
    trace = fs.readFileSync(tracePath, "utf8");
  }
  return { ok: true, stdout: run.stdout, trace };
}

/**
 * Parse an NDJSON trace blob into an array of event objects, ignoring blank
 * lines. Throws (failing the test) on malformed JSON so capture regressions are
 * visible rather than silently swallowed.
 *
 * @param {string} trace - Raw trace-channel contents.
 * @returns {Array<Object>}
 */
function parseTrace(trace) {
  return trace
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((l) => JSON.parse(l));
}

/**
 * Pull the `view` of a named variable out of an event's `vars` array.
 * @param {Object} event
 * @param {string} name
 * @returns {(Object|undefined)}
 */
function findVarView(event, name) {
  if (!event || !Array.isArray(event.vars)) return undefined;
  const v = event.vars.find((entry) => entry && entry.name === name);
  return v ? v.view : undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

test("instrumented Java array fixture preserves stdout byte-for-byte (output purity)", (t) => {
  if (!toolAvailable("javac", ["-version"]) || !toolAvailable("java", ["-version"])) {
    t.skip("javac/java not available on host; skipping Java capture test");
    return;
  }

  const { blockTree } = buildBlockTree("java", JAVA_ARRAY_FIXTURE);
  const { source: instrumented, probeCount } = instrument(
    "java",
    JAVA_ARRAY_FIXTURE,
    blockTree
  );
  assert.ok(probeCount > 0, "expected the instrumenter to inject at least one probe");

  const origDir = makeTmpDir("orig");
  const instDir = makeTmpDir("inst");
  try {
    const original = runJava(origDir, JAVA_ARRAY_FIXTURE);
    assert.ok(original.ok, `original program should compile & run: ${original.error || ""}`);

    const traced = runJava(instDir, instrumented);
    assert.ok(traced.ok, `instrumented program should compile & run: ${traced.error || ""}`);

    // Observable output must be byte-identical.
    assert.deepStrictEqual(
      traced.stdout,
      original.stdout,
      "instrumented stdout must match original stdout exactly"
    );

    // And it must be the value we expect (sanity that the program really ran).
    // Normalize line endings so the check is platform-independent (Windows
    // emits CRLF); byte-for-byte equality of the two programs is asserted above.
    assert.strictEqual(
      original.stdout.toString().replace(/\r\n/g, "\n"),
      EXPECTED_STDOUT
    );

    // Probes fired, but only on the dedicated channel — never stdout.
    assert.ok(
      traced.trace && traced.trace.includes('"blockId"'),
      "instrumented program should emit NDJSON trace events on its trace channel"
    );
    assert.ok(
      !traced.stdout.toString().includes('"blockId"'),
      "trace events must not leak into stdout"
    );
    // Captured values likewise stay off stdout.
    assert.ok(
      !traced.stdout.toString().includes('"view"'),
      "captured variable views must not leak into stdout"
    );
  } finally {
    cleanupDir(origDir);
    cleanupDir(instDir);
  }
});

test("instrumented Java captures vars with expected view.kind and growing values", (t) => {
  if (!toolAvailable("javac", ["-version"]) || !toolAvailable("java", ["-version"])) {
    t.skip("javac/java not available on host; skipping Java capture test");
    return;
  }

  const { blockTree } = buildBlockTree("java", JAVA_ARRAY_FIXTURE);
  const { source: instrumented } = instrument("java", JAVA_ARRAY_FIXTURE, blockTree);

  const dir = makeTmpDir("vars");
  try {
    const traced = runJava(dir, instrumented);
    assert.ok(traced.ok, `instrumented program should compile & run: ${traced.error || ""}`);

    const events = parseTrace(traced.trace);
    assert.ok(events.length > 0, "expected at least one trace event");

    // Every event carries a well-formed vars array.
    for (const ev of events) {
      assert.ok(Array.isArray(ev.vars), "each event must carry a vars array");
    }

    // ── view.kind expectations ──
    // The primitive array `arr` is always captured as array1d (length n = 3);
    // the scalar `n` as scalar; the ArrayList `list` as list.
    const arrViews = events
      .map((ev) => findVarView(ev, "arr"))
      .filter((view) => view !== undefined);
    assert.ok(arrViews.length > 0, "expected the array `arr` to be captured in some step");
    for (const view of arrViews) {
      assert.strictEqual(view.kind, "array1d", "int[] arr must be captured as array1d");
      assert.ok(Array.isArray(view.data), "array1d data must be an array");
      assert.strictEqual(view.data.length, 3, "int[] arr has fixed length n = 3");
    }

    const nViews = events
      .map((ev) => findVarView(ev, "n"))
      .filter((view) => view !== undefined);
    assert.ok(nViews.length > 0, "expected the scalar `n` to be captured");
    for (const view of nViews) {
      assert.strictEqual(view.kind, "scalar", "int n must be captured as scalar");
      assert.strictEqual(view.data, "3", "scalar n must hold the stdin value 3");
    }

    const listViews = events
      .map((ev) => findVarView(ev, "list"))
      .filter((view) => view !== undefined);
    assert.ok(listViews.length > 0, "expected the ArrayList `list` to be captured");
    for (const view of listViews) {
      assert.strictEqual(view.kind, "list", "ArrayList<Integer> list must be captured as list");
      assert.ok(Array.isArray(view.data), "list data must be an array");
    }

    // ── value expectations: array1d grows element-by-element ──
    // The probed `arr[i] = (i + 1) * 10;` assignment fires *after* the store,
    // so the captured `arr` reflects the fully-filled-so-far array at each
    // assignment step. Across the three iterations we expect, in order:
    //   [10,0,0] → [10,20,0] → [10,20,30]
    const assignArrStates = events
      .filter((ev) => ev.kind === "assign")
      .map((ev) => findVarView(ev, "arr"))
      .filter((view) => view && view.kind === "array1d")
      .map((view) => view.data);

    assert.deepStrictEqual(
      assignArrStates,
      [
        ["10", "0", "0"],
        ["10", "20", "0"],
        ["10", "20", "30"],
      ],
      "assignment-step captures of arr must show element-by-element fill"
    );

    // ── value expectations: the ArrayList size is non-decreasing ──
    // `list.add(...)` runs after the arr-assignment probe, so at the captured
    // step the list lags by one: [] → [10] → [10,20]. We assert monotonic
    // growth (length never shrinks) rather than exact contents.
    const assignListSizes = events
      .filter((ev) => ev.kind === "assign")
      .map((ev) => findVarView(ev, "list"))
      .filter((view) => view && view.kind === "list")
      .map((view) => view.data.length);

    assert.ok(assignListSizes.length > 0, "expected list captures on assignment steps");
    for (let i = 1; i < assignListSizes.length; i++) {
      assert.ok(
        assignListSizes[i] >= assignListSizes[i - 1],
        `list size must never shrink across steps (saw ${assignListSizes})`
      );
    }
    assert.ok(
      assignListSizes[assignListSizes.length - 1] > assignListSizes[0],
      "list must actually grow across the loop"
    );
  } finally {
    cleanupDir(dir);
  }
});
