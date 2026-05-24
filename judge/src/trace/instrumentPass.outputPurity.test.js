/**
 * Output-purity test for the instrumentation pass (task 5.2).
 *
 * Property 9 (output purity) — Validates: Requirements 7.2.
 *
 * Although this is labeled "Property 9", output purity cannot be exercised by a
 * pure in-memory generator: it is a statement about the *observable runtime
 * behavior* of the instrumented program. We therefore validate it as a
 * unit/integration test that:
 *
 *   1. builds a static block tree for a small C++ and Java fixture,
 *   2. instruments the source via `instrument(...)`,
 *   3. compiles and runs BOTH the original and the instrumented program in
 *      host mode (g++ / javac + java),
 *   4. feeds both the same stdin, capturing the trace channel (fd 3 for C++,
 *      VANTAGE_TRACE_FILE for Java) into a side file so it cannot pollute
 *      stdout, and
 *   5. asserts the instrumented program's stdout is byte-identical to the
 *      original's, and that the instrumented program actually emitted trace
 *      events on its dedicated channel (proving the probes ran without leaking).
 *
 * If a required compiler is unavailable, that language's test skips gracefully
 * with a clear message rather than failing — host machines without a JDK/g++
 * should not break the suite.
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
// Fixtures: small programs that read stdin and produce deterministic stdout,
// exercising loops, conditionals, declarations, assignments and I/O.
// ─────────────────────────────────────────────────────────────────────────────

const CPP_FIXTURE = `#include <iostream>
using namespace std;

int add(int a, int b) {
    int r = a + b;
    return r;
}

int main() {
    int n;
    cin >> n;
    int sum = 0;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        sum = add(sum, x);
    }
    cout << "Sum: " << sum << endl;
    if (sum > 10) {
        cout << "big" << endl;
    } else {
        cout << "small" << endl;
    }
    return 0;
}
`;

const JAVA_FIXTURE = `import java.util.Scanner;

public class Main {
    static int add(int a, int b) {
        int r = a + b;
        return r;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int sum = 0;
        for (int i = 0; i < n; i++) {
            int x = sc.nextInt();
            sum = add(sum, x);
        }
        System.out.println("Sum: " + sum);
        if (sum > 10) {
            System.out.println("big");
        } else {
            System.out.println("small");
        }
    }
}
`;

// Same stdin fed to both the original and the instrumented program.
const STDIN = "3\n4 5 6\n";

// ─────────────────────────────────────────────────────────────────────────────
// Host-mode helpers
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
  return fs.mkdtempSync(path.join(os.tmpdir(), `vtrace-purity-${tag}-`));
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
  const exePath = path.join(dir, `${name}${process.platform === "win32" ? ".exe" : ".out"}`);
  const tracePath = path.join(dir, `${name}.trace`);
  fs.writeFileSync(srcPath, source);

  const compile = spawnSync("g++", ["-O0", "-o", exePath, srcPath], {
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
 * Compile + run a Java program in host mode, capturing stdout and the trace
 * channel (VANTAGE_TRACE_FILE) into a side file.
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

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

test("C++ instrumentation preserves stdout byte-for-byte (output purity)", (t) => {
  if (!toolAvailable("g++", ["--version"])) {
    t.skip("g++ not available on host; skipping C++ output-purity test");
    return;
  }

  const { blockTree } = buildBlockTree("cpp", CPP_FIXTURE);
  const { source: instrumented, probeCount } = instrument("cpp", CPP_FIXTURE, blockTree);
  assert.ok(probeCount > 0, "expected the instrumenter to inject at least one probe");

  const dir = makeTmpDir("cpp");
  try {
    const original = runCpp(dir, "orig", CPP_FIXTURE);
    assert.ok(original.ok, `original program should compile & run: ${original.error || ""}`);

    const traced = runCpp(dir, "inst", instrumented);
    assert.ok(traced.ok, `instrumented program should compile & run: ${traced.error || ""}`);

    // The observable output must be byte-identical.
    assert.deepStrictEqual(
      traced.stdout,
      original.stdout,
      "instrumented stdout must match original stdout exactly"
    );

    // Sanity: stdout reflects the actual computation, and trace went elsewhere.
    assert.match(original.stdout.toString(), /Sum: 15/);
    assert.match(original.stdout.toString(), /big/);

    // Probes actually fired, but only on the dedicated channel (never stdout).
    assert.ok(
      traced.trace && traced.trace.includes('"blockId"'),
      "instrumented program should emit NDJSON trace events on fd 3"
    );
    assert.ok(
      !traced.stdout.toString().includes('"blockId"'),
      "trace events must not leak into stdout"
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("Java instrumentation preserves stdout byte-for-byte (output purity)", (t) => {
  if (!toolAvailable("javac", ["-version"]) || !toolAvailable("java", ["-version"])) {
    t.skip("javac/java not available on host; skipping Java output-purity test");
    return;
  }

  const { blockTree } = buildBlockTree("java", JAVA_FIXTURE);
  const { source: instrumented, probeCount } = instrument("java", JAVA_FIXTURE, blockTree);
  assert.ok(probeCount > 0, "expected the instrumenter to inject at least one probe");

  const origDir = makeTmpDir("java-orig");
  const instDir = makeTmpDir("java-inst");
  try {
    const original = runJava(origDir, JAVA_FIXTURE);
    assert.ok(original.ok, `original program should compile & run: ${original.error || ""}`);

    const traced = runJava(instDir, instrumented);
    assert.ok(traced.ok, `instrumented program should compile & run: ${traced.error || ""}`);

    assert.deepStrictEqual(
      traced.stdout,
      original.stdout,
      "instrumented stdout must match original stdout exactly"
    );

    assert.match(original.stdout.toString(), /Sum: 15/);
    assert.match(original.stdout.toString(), /big/);

    assert.ok(
      traced.trace && traced.trace.includes('"blockId"'),
      "instrumented program should emit NDJSON trace events on its trace channel"
    );
    assert.ok(
      !traced.stdout.toString().includes('"blockId"'),
      "trace events must not leak into stdout"
    );
  } finally {
    fs.rmSync(origDir, { recursive: true, force: true });
    fs.rmSync(instDir, { recursive: true, force: true });
  }
});
