/**
 * Unit tests for `traceProgram` status branches (task 6.4).
 *
 * Exercises Algorithm 1's status machine (judge/src/tracer.js) by mocking the
 * three collaborators it orchestrates — `buildBlockTree`, `instrument`, and
 * `executeInstrumented` — so each degradation path can be driven
 * deterministically without a real parser/compiler/sandbox.
 *
 * Coverage:
 *   - Trace Error          : parse fails → blockTree null            (Req 8.1)
 *   - StaticOnly           : instrument fails / compile fails        (Req 8.2)
 *   - Runtime Error        : crash mid-run → steps up to crash + stderr (Req 8.3)
 *   - Time Limit Exceeded  : exceeds limits, steps retained          (Req 8.4)
 *   - Never-throws         : every failure still resolves a TraceResult (Req 8.5)
 *   - OK (baseline)        : happy path assembles contiguous steps   (Req 8.x)
 *
 * Mocking technique: the dependency module objects are mutated to install
 * mutable wrapper functions *before* `tracer.js` is required, so the
 * destructured references inside the orchestrator pick up the wrappers. Each
 * test assigns the desired behavior to the corresponding `*Impl` holder.
 *
 * Uses the built-in `node:test` runner (see package.json "test" script).
 */

const test = require("node:test");
const assert = require("node:assert");

// ── Install mock wrappers BEFORE requiring the orchestrator ────────────────
const structuralPass = require("./trace/structuralPass");
const instrumentPass = require("./trace/instrumentPass");
const executor = require("./executor");
const { STEP_CAP } = require("./trace/constants");

/** Mutable per-test implementations driven by each test case. */
let buildBlockTreeImpl;
let instrumentImpl;
let executeInstrumentedImpl;

structuralPass.buildBlockTree = (...args) => buildBlockTreeImpl(...args);
instrumentPass.instrument = (...args) => instrumentImpl(...args);
executor.executeInstrumented = (...args) => executeInstrumentedImpl(...args);

// Now load the orchestrator; its destructured deps resolve to the wrappers.
const { traceProgram } = require("./tracer");

// ── Fixtures ───────────────────────────────────────────────────────────────

/** A minimal, valid two-level block tree with ids b0 (root) and b1 (loop). */
function makeBlockTree() {
  return {
    id: "b0",
    type: "program",
    parentId: null,
    label: "program",
    sourceRange: { startLine: 1, startCol: 0, endLine: 5, endCol: 1 },
    children: [
      {
        id: "b1",
        type: "loop",
        parentId: "b0",
        label: "for",
        sourceRange: { startLine: 2, startCol: 2, endLine: 4, endCol: 3 },
        children: [],
      },
    ],
  };
}

/**
 * A non-empty `SourceMap` matching `makeBlockTree`'s ranges: the program block
 * (b0) covers lines 1-5, the loop block (b1) is nested inside it on lines 2-4.
 * Each line lists its covering block ids outermost → innermost, mirroring what
 * `buildBlockTree` produces (Requirement 2.4) so the orchestrator's threading
 * of `structural.sourceMap` into the `TraceResult` can be asserted.
 */
function makeSourceMap() {
  return {
    1: ["b0"],
    2: ["b0", "b1"],
    3: ["b0", "b1"],
    4: ["b0", "b1"],
    5: ["b0"],
  };
}

/** Build an NDJSON event stream from event objects. */
function ndjson(events) {
  return events.map((e) => JSON.stringify(e)).join("\n");
}

/** Default healthy behavior; individual tests override what they need. */
function resetMocks() {
  buildBlockTreeImpl = () => ({ blockTree: makeBlockTree(), sourceMap: makeSourceMap() });
  instrumentImpl = () => ({ source: "/* instrumented */", probeCount: 2 });
  executeInstrumentedImpl = async () => ({
    stdout: "",
    traceEvents: "",
    stderr: "",
    time: 1,
    exitCode: 0,
  });
}

test.beforeEach(() => resetMocks());

// ── Trace Error: parse fails → null block tree (Requirement 8.1) ───────────

test("Trace Error: a parse failure yields status 'Trace Error' with a null block tree", async () => {
  buildBlockTreeImpl = () => {
    const err = new Error("Unable to parse source near line 3");
    err.name = "ParseError";
    throw err;
  };

  const result = await traceProgram({ language: "cpp", code: "int main(", input: "1 2" });

  assert.strictEqual(result.status, "Trace Error");
  assert.strictEqual(result.blockTree, null);
  assert.deepStrictEqual(result.steps, []);
  assert.ok(typeof result.error === "string" && result.error.length > 0);
  // Input is still tokenized even on the error path.
  assert.strictEqual(result.inputTokens.length, 2);
});

// ── StaticOnly: instrument fails (Requirement 8.2) ─────────────────────────

test("StaticOnly: an instrumentation failure keeps the block tree and empties steps", async () => {
  instrumentImpl = () => {
    throw new Error("instrumentation rewrite failed");
  };

  const result = await traceProgram({ language: "cpp", code: "int main(){}", input: "" });

  assert.strictEqual(result.status, "StaticOnly");
  assert.notStrictEqual(result.blockTree, null);
  assert.strictEqual(result.blockTree.id, "b0");
  assert.deepStrictEqual(result.steps, []);
  assert.ok(typeof result.error === "string" && result.error.length > 0);
});

// ── StaticOnly: compile fails (Requirement 8.2) ────────────────────────────

test("StaticOnly: a compilation failure keeps the block tree and empties steps", async () => {
  executeInstrumentedImpl = async () => ({
    stdout: "",
    traceEvents: "",
    stderr: "Compilation Error:\nexpected ';'",
    time: 0,
    exitCode: 1,
    compilationError: true,
  });

  const result = await traceProgram({ language: "java", code: "class A {}", input: "" });

  assert.strictEqual(result.status, "StaticOnly");
  assert.notStrictEqual(result.blockTree, null);
  assert.deepStrictEqual(result.steps, []);
  assert.match(result.error, /Compilation Error/);
});

// ── Runtime Error: crash mid-execution (Requirement 8.3) ───────────────────

test("Runtime Error: a non-zero exit captures steps up to the crash and surfaces stderr", async () => {
  const traceEvents = ndjson([
    { blockId: "b0", line: 1, kind: "enter" },
    { blockId: "b1", line: 2, kind: "iterate" },
    { blockId: "b1", line: 3, kind: "assignment" },
  ]);

  executeInstrumentedImpl = async () => ({
    stdout: "partial output",
    traceEvents,
    stderr: "Runtime Error:\nSegmentation fault",
    time: 12,
    exitCode: 139,
  });

  const result = await traceProgram({ language: "cpp", code: "int main(){}", input: "1 2 3" });

  assert.strictEqual(result.status, "Runtime Error");
  assert.notStrictEqual(result.blockTree, null);
  // Steps captured up to the crash, contiguous from 0.
  assert.strictEqual(result.steps.length, 3);
  assert.deepStrictEqual(
    result.steps.map((s) => s.index),
    [0, 1, 2]
  );
  // stderr is surfaced in the error field (Requirement 8.3).
  assert.match(result.error, /Segmentation fault/);
  // stdout produced before the crash is preserved unmodified.
  assert.strictEqual(result.stdout, "partial output");
});

// ── Time Limit Exceeded: exceeds limits, steps retained (Requirement 8.4) ──

test("Time Limit Exceeded: a TLE run retains captured steps and reports stderr", async () => {
  const traceEvents = ndjson([
    { blockId: "b0", line: 1, kind: "enter" },
    { blockId: "b1", line: 2, kind: "iterate" },
  ]);

  executeInstrumentedImpl = async () => ({
    stdout: "",
    traceEvents,
    stderr: "Time Limit Exceeded",
    time: 5000,
    exitCode: -1,
    tle: true,
  });

  const result = await traceProgram({ language: "cpp", code: "for(;;){}", input: "" });

  assert.strictEqual(result.status, "Time Limit Exceeded");
  assert.notStrictEqual(result.blockTree, null);
  // Captured steps are retained despite the TLE (Requirement 8.4).
  assert.strictEqual(result.steps.length, 2);
  assert.deepStrictEqual(
    result.steps.map((s) => s.index),
    [0, 1]
  );
  assert.match(result.error, /Time Limit Exceeded/);
});

test("Time Limit Exceeded takes precedence over a non-zero exit code", async () => {
  // A killed process reports both tle:true and a non-zero exitCode; TLE wins.
  executeInstrumentedImpl = async () => ({
    stdout: "",
    traceEvents: ndjson([{ blockId: "b0", line: 1, kind: "enter" }]),
    stderr: "Time Limit Exceeded",
    time: 5000,
    exitCode: -1,
    tle: true,
  });

  const result = await traceProgram({ language: "cpp", code: "for(;;){}", input: "" });

  assert.strictEqual(result.status, "Time Limit Exceeded");
});

// ── OK baseline: happy path assembles a coherent trace ─────────────────────

test("OK: a successful run yields status 'OK' with contiguous steps and stdout", async () => {
  const traceEvents = ndjson([
    { blockId: "b0", line: 1, kind: "enter" },
    { blockId: "b1", line: 2, kind: "iterate", in: "1" },
    { blockId: "b1", line: 3, kind: "assignment" },
  ]);

  executeInstrumentedImpl = async () => ({
    stdout: "done\n",
    traceEvents,
    stderr: "",
    time: 7,
    exitCode: 0,
  });

  const result = await traceProgram({ language: "cpp", code: "int main(){}", input: "1 2" });

  assert.strictEqual(result.status, "OK");
  assert.notStrictEqual(result.blockTree, null);
  assert.strictEqual(result.steps.length, 3);
  assert.deepStrictEqual(
    result.steps.map((s) => s.index),
    [0, 1, 2]
  );
  assert.strictEqual(result.stdout, "done\n");
  assert.strictEqual(result.meta.stepCap, STEP_CAP);
  assert.strictEqual(result.meta.truncated, false);
  // No error on the happy path.
  assert.strictEqual(result.error, undefined);
  // Token consumed by the reading step is linked.
  assert.strictEqual(result.inputTokens[0].consumedAtStep, 1);
  assert.strictEqual(result.inputTokens[1].consumedAtStep, null);
});

// ── OK threads the structural sourceMap through (Requirement 4.2 / R9) ─────

test("OK: a successful run threads a non-empty sourceMap into the TraceResult", async () => {
  // The structural pass yields a non-empty source map; the orchestrator must
  // surface it on the result so the frontend editor → block highlight works
  // (task 21.1, Requirement 4.2). Previously `trace.sourceMap` was undefined.
  executeInstrumentedImpl = async () => ({
    stdout: "",
    traceEvents: ndjson([{ blockId: "b0", line: 1, kind: "enter" }]),
    stderr: "",
    time: 1,
    exitCode: 0,
  });

  const result = await traceProgram({ language: "cpp", code: "int main(){}", input: "" });

  assert.strictEqual(result.status, "OK");
  // sourceMap is present and non-empty.
  assert.ok(result.sourceMap && typeof result.sourceMap === "object");
  assert.ok(Object.keys(result.sourceMap).length > 0, "expected a non-empty sourceMap");
  // Each line maps to a chain of block ids ordered outermost → innermost: the
  // program root b0 is always first, and the nested loop b1 appears last on the
  // lines it covers (Requirement 2.4).
  assert.deepStrictEqual(result.sourceMap[1], ["b0"]);
  assert.deepStrictEqual(result.sourceMap[3], ["b0", "b1"]);
  for (const chain of Object.values(result.sourceMap)) {
    assert.ok(Array.isArray(chain) && chain.length > 0);
    assert.strictEqual(chain[0], "b0", "every line chain starts at the program root");
  }
});

// ── OK carries populated vars with structured views (R9 / R10) ─────────────

test("OK: a successful run carries steps with non-empty vars of the expected views", async () => {
  // The instrumented build emits structured `vars` on the trace channel; the
  // orchestrator must thread them through the parser into each step so the
  // frontend dry-run window can render them (task 21.1, Requirements R9/R10).
  const traceEvents = ndjson([
    {
      blockId: "b0",
      line: 1,
      kind: "enter",
      vars: [{ name: "n", type: "int", scope: "b0", view: { kind: "scalar", data: "3" } }],
    },
    {
      blockId: "b1",
      line: 2,
      kind: "iterate",
      vars: [
        { name: "n", type: "int", scope: "b0", view: { kind: "scalar", data: "3" } },
        {
          name: "v",
          type: "vector<int>",
          scope: "b1",
          view: { kind: "array1d", data: ["0"] },
        },
      ],
    },
    {
      blockId: "b1",
      line: 3,
      kind: "assign",
      vars: [
        { name: "n", type: "int", scope: "b0", view: { kind: "scalar", data: "3" } },
        {
          name: "v",
          type: "vector<int>",
          scope: "b1",
          view: { kind: "array1d", data: ["0", "10"] },
        },
      ],
    },
  ]);

  executeInstrumentedImpl = async () => ({
    stdout: "",
    traceEvents,
    stderr: "",
    time: 4,
    exitCode: 0,
  });

  const result = await traceProgram({ language: "cpp", code: "int main(){}", input: "3" });

  assert.strictEqual(result.status, "OK");

  // At least one step carries a non-empty vars array.
  const withVars = result.steps.filter((s) => Array.isArray(s.vars) && s.vars.length > 0);
  assert.ok(withVars.length > 0, "expected at least one step with non-empty vars");

  // The scalar `n` is captured with a scalar view across steps.
  const nViews = result.steps
    .flatMap((s) => s.vars)
    .filter((v) => v.name === "n" && v.view)
    .map((v) => v.view);
  assert.ok(nViews.length > 0, "expected the scalar n to be captured");
  for (const view of nViews) {
    assert.strictEqual(view.kind, "scalar");
    assert.strictEqual(view.data, "3");
  }

  // The vector `v` is captured as array1d and grows element-by-element, with
  // element-level changedKeys computed against the previous step (R11).
  const vSnapshots = result.steps
    .flatMap((s) => s.vars)
    .filter((v) => v.name === "v" && v.view);
  assert.ok(vSnapshots.length >= 2, "expected the vector v captured in multiple steps");
  for (const snap of vSnapshots) {
    assert.strictEqual(snap.view.kind, "array1d");
    assert.ok(Array.isArray(snap.view.data));
  }
  // Growing from ["0"] → ["0","10"] marks index 1 as changed.
  const grown = vSnapshots[vSnapshots.length - 1];
  assert.deepStrictEqual(grown.view.data, ["0", "10"]);
  assert.deepStrictEqual(grown.view.changedKeys, ["1"]);
});

// ── Never-throws guarantee (Requirement 8.5) ───────────────────────────────

test("Never-throws: every result is a well-formed TraceResult", async () => {
  resetMocks();
  const result = await traceProgram({ language: "cpp", code: "int main(){}", input: "" });

  // Shape contract shared by all status branches.
  for (const key of ["status", "language", "blockTree", "steps", "inputTokens", "stdout", "meta"]) {
    assert.ok(key in result, `TraceResult missing '${key}'`);
  }
  assert.ok(Array.isArray(result.steps));
  assert.ok(Array.isArray(result.inputTokens));
  assert.ok(result.meta && typeof result.meta === "object");
});

test("Never-throws: an executor rejection degrades to StaticOnly instead of throwing", async () => {
  executeInstrumentedImpl = async () => {
    throw new Error("docker pool exhausted");
  };

  let result;
  await assert.doesNotReject(async () => {
    result = await traceProgram({ language: "cpp", code: "int main(){}", input: "" });
  });

  assert.strictEqual(result.status, "StaticOnly");
  assert.notStrictEqual(result.blockTree, null);
  assert.deepStrictEqual(result.steps, []);
});

test("Never-throws: a non-Error thrown by a collaborator still resolves a TraceResult", async () => {
  // Collaborators that throw non-Error values must not escape the orchestrator.
  buildBlockTreeImpl = () => {
    throw "boom"; // eslint-disable-line no-throw-literal
  };

  let result;
  await assert.doesNotReject(async () => {
    result = await traceProgram({ language: "cpp", code: "x", input: "" });
  });

  assert.strictEqual(result.status, "Trace Error");
  assert.strictEqual(result.blockTree, null);
  assert.ok(typeof result.error === "string" && result.error.length > 0);
});

test("Never-throws: invalid input arguments resolve a Trace Error rather than throwing", async () => {
  // Unsupported language and a non-object request both short-circuit safely.
  const unsupported = await traceProgram({ language: "python", code: "print(1)", input: "" });
  assert.strictEqual(unsupported.status, "Trace Error");
  assert.strictEqual(unsupported.blockTree, null);

  let result;
  await assert.doesNotReject(async () => {
    result = await traceProgram(undefined);
  });
  assert.strictEqual(result.status, "Trace Error");
  assert.strictEqual(result.blockTree, null);
});
