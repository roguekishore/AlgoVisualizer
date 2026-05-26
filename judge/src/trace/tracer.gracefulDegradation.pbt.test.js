/**
 * Property-based test for graceful degradation of the trace orchestrator
 * (task 6.3).
 *
 * Property 10: Graceful degradation — for a program whose source PARSES (and
 * instruments) successfully, if the instrumented build cannot be RUN — either
 * because the executor throws, or because it reports a compilation error — then
 *
 *     parse succeeds ∧ run fails ⟹ status === "StaticOnly" ∧ blockTree !== null
 *
 * The orchestrator must still hand back a usable static block tree (so the UI
 * can render a non-animated block view) with an empty step list, and it must
 * never throw to its caller.
 *
 * **Validates: Requirements 8.2**
 *
 * Strategy: `executeInstrumented` is the dynamic-pass boundary in `tracer.js`.
 * Because the tracer destructures it from `./executor` at module-load time, we
 * install a mutable mock into `require.cache` for the executor module BEFORE
 * requiring the tracer, then vary the run-failure mode per property run:
 *   - "throw"        → executor rejects/throws (e.g. sandbox/infra failure),
 *   - "compileError" → executor resolves `{ compilationError: true, ... }`.
 * Both are the failure categories that Requirement 8.2 maps to `StaticOnly`.
 * The chosen source fixtures are known to parse AND instrument cleanly (so the
 * earlier pipeline stages succeed and the ONLY failing stage is the run).
 *
 * Uses the built-in `node:test` runner (see package.json "test" script) with
 * fast-check as the property engine.
 */

const test = require("node:test");
const assert = require("node:assert");
const fc = require("fast-check");

// ── Install a controllable mock for the executor BEFORE loading the tracer ──
// The tracer captures `executeInstrumented` by destructuring at require time,
// so we seed require.cache with a delegating stub. Mutating `mockRun` between
// property runs lets the same captured reference exercise every failure mode
// without re-requiring the tracer (and without ever loading the real
// executor, which would attempt Docker detection / sandbox setup).
const executorPath = require.resolve("../executor");

/** @type {(language: string, code: string, input: string) => Promise<any>} */
let mockRun = async () => {
  throw new Error("mockRun not configured");
};

require.cache[executorPath] = {
  id: executorPath,
  filename: executorPath,
  loaded: true,
  exports: {
    executeInstrumented: (...args) => mockRun(...args),
  },
};

const { traceProgram } = require("../tracer");

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures: programs that PARSE and INSTRUMENT successfully (so the only stage
// that can fail is the run). Each exercises a mix of loops/conditionals/IO.
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

const CPP_SIMPLE = `int main() {
    int x = 0;
    for (int i = 0; i < 3; i++) {
        x = x + i;
    }
    return x;
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

const JAVA_SIMPLE = `public class Main {
    public static void main(String[] args) {
        int x = 0;
        for (int i = 0; i < 3; i++) {
            x = x + i;
        }
    }
}
`;

/** A program that parses+instruments, paired with its language. */
const fixtureArb = fc.constantFrom(
  { language: "cpp", code: CPP_FIXTURE },
  { language: "cpp", code: CPP_SIMPLE },
  { language: "java", code: JAVA_FIXTURE },
  { language: "java", code: JAVA_SIMPLE }
);

/** Arbitrary stdin forwarded to the (mocked) run. */
const inputArb = fc.oneof(
  fc.constant(""),
  fc.constant("3\n4 5 6\n"),
  fc.string({ maxLength: 30 }),
  fc
    .array(fc.integer({ min: -50, max: 50 }), { maxLength: 6 })
    .map((xs) => xs.join(" ") + "\n")
);

/**
 * A run-failure mode. Each yields a function that, when installed as `mockRun`,
 * makes the dynamic pass fail in a way Requirement 8.2 maps to `StaticOnly`.
 */
const failureModeArb = fc.oneof(
  // Executor throws (sandbox/infrastructure failure). tracer must catch.
  fc.record({ kind: fc.constant("throw"), message: fc.string({ maxLength: 40 }) }),
  // Executor resolves a compilation-error result.
  fc.record({
    kind: fc.constant("compileError"),
    stderr: fc.string({ maxLength: 60 }),
  })
);

/**
 * Build the mock `executeInstrumented` implementation for a failure mode.
 * @param {{kind: string, message?: string, stderr?: string}} mode
 */
function makeFailingRun(mode) {
  if (mode.kind === "throw") {
    return async () => {
      throw new Error(mode.message || "sandbox failure");
    };
  }
  // compileError
  return async () => ({
    stdout: "",
    traceEvents: "",
    stderr: `Compilation Error:\n${mode.stderr || ""}`,
    time: 0,
    exitCode: 1,
    compilationError: true,
  });
}

test("Property 10: parse succeeds ∧ run fails ⟹ StaticOnly with a non-null block tree", async () => {
  await fc.assert(
    fc.asyncProperty(
      fixtureArb,
      inputArb,
      failureModeArb,
      async ({ language, code }, input, mode) => {
        mockRun = makeFailingRun(mode);

        // traceProgram must never throw, regardless of the run failure.
        const result = await traceProgram({ language, code, input });

        // Core of Property 10 (Requirement 8.2).
        assert.strictEqual(
          result.status,
          "StaticOnly",
          `expected StaticOnly for a failing run, got ${result.status}`
        );
        assert.notStrictEqual(
          result.blockTree,
          null,
          "StaticOnly must retain the static block tree"
        );

        // Supporting invariants from the orchestrator contract: a usable but
        // non-animated static view.
        assert.ok(
          result.blockTree && result.blockTree.type === "program",
          "block tree must be rooted at the program node"
        );
        assert.deepStrictEqual(
          result.steps,
          [],
          "StaticOnly must carry an empty step list"
        );
        assert.strictEqual(result.language, language, "language echoed back");
      }
    ),
    { numRuns: 50 }
  );
});

test("Property 10: holds when the executor throws (infra failure) — no exception escapes", async () => {
  await fc.assert(
    fc.asyncProperty(fixtureArb, inputArb, async ({ language, code }, input) => {
      mockRun = async () => {
        throw new Error("boom");
      };

      const result = await traceProgram({ language, code, input });

      assert.strictEqual(result.status, "StaticOnly");
      assert.notStrictEqual(result.blockTree, null);
      assert.deepStrictEqual(result.steps, []);
    }),
    { numRuns: 80 }
  );
});
