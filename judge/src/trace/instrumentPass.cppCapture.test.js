/**
 * C++ variable-capture + output-purity tests for the instrumentation pass
 * (task 18.2).
 *
 * Phase 2 makes each trace event carry the *values* of the variables in scope
 * at that step, serialized on the dedicated fd-3 trace channel by the generated
 * `__vtrace` C++ runtime. This file validates two things for C++:
 *
 *   1. Output purity (Property 9 / Requirements 7.2, R9): an instrumented
 *      fixture still compiles and produces stdout that is byte-for-byte
 *      identical to the un-instrumented program, and trace data never leaks
 *      into stdout.
 *
 *   2. Variable capture (Requirements R9, R10): a stepping fixture (a loop that
 *      fills a `std::vector`) yields `vars` whose `view.kind` and values match
 *      expectations — the vector is captured as `array1d` and grows element by
 *      element across consecutive steps, while scalars are captured as
 *      `scalar`.
 *
 * Capture is a statement about *observable runtime behavior*, so (like the
 * task-5.2 output-purity test) it is exercised as a host-mode integration test:
 * we instrument the source, compile + run both the original and instrumented
 * programs with g++, capture the fd-3 trace channel into a side file, and
 * inspect the emitted NDJSON events.
 *
 * If g++ is unavailable, the test skips gracefully rather than failing, matching
 * the convention in `instrumentPass.outputPurity.test.js`.
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
// Fixture: a loop that fills a vector. The `last = v.back();` assignment probe
// fires *after* each push_back, so the captured `v` reflects the fully-grown
// state at each iteration: [0] → [0,10] → [0,10,20]. The program's stdout is
// deterministic and independent of the trace channel.
// ─────────────────────────────────────────────────────────────────────────────

const CPP_VECTOR_FIXTURE = `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> v;
    int last = -1;
    for (int i = 0; i < n; i++) {
        v.push_back(i * 10);
        last = v.back();
    }
    cout << "last=" << last << "\\n";
    cout << "size=" << v.size() << "\\n";
    return 0;
}
`;

// Same stdin fed to both the original and the instrumented program.
const STDIN = "3\n";

// Expected, trace-independent stdout.
const EXPECTED_STDOUT = "last=20\nsize=3\n";

// ─────────────────────────────────────────────────────────────────────────────
// Host-mode helpers (mirrors instrumentPass.outputPurity.test.js)
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
  return fs.mkdtempSync(path.join(os.tmpdir(), `vtrace-capture-${tag}-`));
}

/**
 * Remove a temp directory, tolerating the brief file lock Windows holds on a
 * just-executed `.exe` (retries, then gives up silently — cleanup must never
 * fail the test).
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
 * Compile + run a C++ program in host mode, capturing stdout and the fd-3 trace
 * channel into a side file.
 *
 * @param {string} dir - Working directory.
 * @param {string} name - Base name (no extension).
 * @param {string} source - C++ source.
 * @returns {{ ok: boolean, stdout?: Buffer, trace?: string, error?: string }}
 */
function runCpp(dir, name, source) {
  const srcPath = path.join(dir, `${name}.cpp`);
  const exePath = path.join(
    dir,
    `${name}${process.platform === "win32" ? ".exe" : ".out"}`
  );
  const tracePath = path.join(dir, `${name}.trace`);
  fs.writeFileSync(srcPath, source);

  const compile = spawnSync("g++", ["-O0", "-std=c++17", "-o", exePath, srcPath], {
    encoding: "utf8",
  });
  if (compile.error || compile.status !== 0) {
    return {
      ok: false,
      error: `g++ failed (status ${compile.status}): ${compile.stderr || compile.error}`,
    };
  }

  const traceFd = fs.openSync(tracePath, "w");
  try {
    const run = spawnSync(exePath, [], {
      input: STDIN,
      // fd 3 → trace file; stdout/stderr piped and captured separately.
      stdio: ["pipe", "pipe", "pipe", traceFd],
    });
    if (run.error) {
      return { ok: false, error: `run failed: ${run.error}` };
    }
    return {
      ok: true,
      stdout: run.stdout,
      trace: fs.readFileSync(tracePath, "utf8"),
    };
  } finally {
    fs.closeSync(traceFd);
  }
}

/**
 * Parse an NDJSON trace blob into an array of event objects, ignoring blank
 * lines. Throws (failing the test) on malformed JSON so capture regressions are
 * visible rather than silently swallowed.
 *
 * @param {string} trace - Raw fd-3 contents.
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

test("instrumented C++ vector fixture preserves stdout byte-for-byte (output purity)", (t) => {
  if (!toolAvailable("g++", ["--version"])) {
    t.skip("g++ not available on host; skipping C++ capture test");
    return;
  }

  const { blockTree } = buildBlockTree("cpp", CPP_VECTOR_FIXTURE);
  const { source: instrumented, probeCount } = instrument(
    "cpp",
    CPP_VECTOR_FIXTURE,
    blockTree
  );
  assert.ok(probeCount > 0, "expected the instrumenter to inject at least one probe");

  const dir = makeTmpDir("purity");
  try {
    const original = runCpp(dir, "orig", CPP_VECTOR_FIXTURE);
    assert.ok(original.ok, `original program should compile & run: ${original.error || ""}`);

    const traced = runCpp(dir, "inst", instrumented);
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
      "instrumented program should emit NDJSON trace events on fd 3"
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
    cleanupDir(dir);
  }
});

test("instrumented C++ captures vars with expected view.kind and growing values", (t) => {
  if (!toolAvailable("g++", ["--version"])) {
    t.skip("g++ not available on host; skipping C++ capture test");
    return;
  }

  const { blockTree } = buildBlockTree("cpp", CPP_VECTOR_FIXTURE);
  const { source: instrumented } = instrument("cpp", CPP_VECTOR_FIXTURE, blockTree);

  const dir = makeTmpDir("vars");
  try {
    const traced = runCpp(dir, "inst", instrumented);
    assert.ok(traced.ok, `instrumented program should compile & run: ${traced.error || ""}`);

    const events = parseTrace(traced.trace);
    assert.ok(events.length > 0, "expected at least one trace event");

    // Every event carries a well-formed vars array.
    for (const ev of events) {
      assert.ok(Array.isArray(ev.vars), "each event must carry a vars array");
    }

    // ── view.kind expectations ──
    // The vector `v` is always captured as array1d; scalars as scalar.
    const vViews = events
      .map((ev) => findVarView(ev, "v"))
      .filter((view) => view !== undefined);
    assert.ok(vViews.length > 0, "expected the vector `v` to be captured in some step");
    for (const view of vViews) {
      assert.strictEqual(view.kind, "array1d", "vector<int> v must be captured as array1d");
      assert.ok(Array.isArray(view.data), "array1d data must be an array");
    }

    const lastViews = events
      .map((ev) => findVarView(ev, "last"))
      .filter((view) => view !== undefined);
    assert.ok(lastViews.length > 0, "expected the scalar `last` to be captured");
    for (const view of lastViews) {
      assert.strictEqual(view.kind, "scalar", "int last must be captured as scalar");
    }

    // ── value expectations ──
    // The `last = v.back();` assignment probe fires *after* each push_back, so
    // the captured `v` reflects the fully-grown vector at each iteration.
    // Across the three iterations we expect: [0] → [0,10] → [0,10,20].
    const assignVStates = events
      .filter((ev) => ev.kind === "assign")
      .map((ev) => findVarView(ev, "v"))
      .filter((view) => view && view.kind === "array1d")
      .map((view) => view.data);

    assert.deepStrictEqual(
      assignVStates,
      [["0"], ["0", "10"], ["0", "10", "20"]],
      "assignment-step captures of v must show element-by-element growth"
    );

    // `last` tracks v.back() after each push: 0 → 10 → 20.
    const assignLastStates = events
      .filter((ev) => ev.kind === "assign")
      .map((ev) => findVarView(ev, "last"))
      .filter((view) => view && view.kind === "scalar")
      .map((view) => view.data);

    assert.deepStrictEqual(
      assignLastStates,
      ["0", "10", "20"],
      "assignment-step captures of last must track v.back()"
    );
  } finally {
    cleanupDir(dir);
  }
});
