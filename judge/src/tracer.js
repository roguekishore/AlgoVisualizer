/**
 * Trace orchestrator for the Code Flow Visualizer (task 6.2).
 *
 * `traceProgram(req)` implements Algorithm 1 from the design doc: it wires the
 * static structural pass, instrumentation, instrumented execution, and trace
 * parsing into a single `TraceResult` payload consumed by the frontend.
 *
 * Pipeline (each stage degrades gracefully):
 *   1. Validate language + size limits.
 *   2. `buildBlockTree` — static parse. A parse failure yields `Trace Error`
 *      with a `null` block tree (Requirement 8.1).
 *   3. `instrument` — rewrite the source to emit trace events. An
 *      instrumentation failure yields `StaticOnly` with the block tree present
 *      so the UI still renders a (non-animated) block view (Requirement 8.2).
 *   4. `executeInstrumented` — compile + run in the sandbox. A compile failure
 *      yields `StaticOnly` (Requirement 8.2).
 *   5. `parseTraceEvents` + `linkConsumedTokens` — assemble ordered, capped
 *      steps and link consumed input tokens.
 *   6. Assemble the `TraceResult` with status `OK` / `Runtime Error` /
 *      `Time Limit Exceeded` plus `meta` (Requirements 3.1, 8.3, 8.4).
 *
 * Contract (Requirement 8.5 / Algorithm 1 postconditions):
 *   - `traceProgram` NEVER throws to its caller; every failure path returns a
 *     well-formed `TraceResult`.
 *   - `status = "OK"`         ⟹ `blockTree !== null` ∧ contiguous `steps`.
 *   - `status = "StaticOnly"` ⟹ `blockTree !== null` ∧ `steps === []`.
 *   - `status = "Trace Error"` ⟹ `blockTree === null`.
 *   - `steps.length <= STEP_CAP`.
 *
 * @typedef {import('./trace/types').TraceRequest} TraceRequest
 * @typedef {import('./trace/types').TraceResult} TraceResult
 * @typedef {import('./trace/types').TraceStatus} TraceStatus
 * @typedef {import('./trace/types').TraceMeta} TraceMeta
 * @typedef {import('./trace/types').Language} Language
 */

const { buildBlockTree } = require("./trace/structuralPass");
const { instrument } = require("./trace/instrumentPass");
const {
  tokenizeInput,
  parseTraceEvents,
  linkConsumedTokens,
} = require("./trace/traceParser");
const { executeInstrumented } = require("./executor");
const { STEP_CAP, MAX_CODE_SIZE, MAX_INPUT_SIZE } = require("./trace/constants");

/** Supported tracing languages. @type {Set<string>} */
const SUPPORTED_LANGUAGES = new Set(["cpp", "java"]);

/**
 * Build an empty `TraceMeta` for failure paths where no execution metadata is
 * available (parse / instrument failure).
 *
 * @returns {TraceMeta}
 */
function emptyMeta() {
  return { totalSteps: 0, truncated: false, stepCap: STEP_CAP, timeMs: 0 };
}

/**
 * Orchestrate a trace: static parse → instrument → run → parse → assemble.
 *
 * Always resolves with a `TraceResult`; never rejects/throws (Requirement 8.5).
 *
 * @param {TraceRequest} req - `{ language, code, input }`.
 * @returns {Promise<TraceResult>}
 */
async function traceProgram(req) {
  const language = req && req.language;
  const code = req && typeof req.code === "string" ? req.code : "";
  const input = req && typeof req.input === "string" ? req.input : "";

  // ── Validation ──────────────────────────────────────────────────────────
  if (!SUPPORTED_LANGUAGES.has(language)) {
    return {
      status: "Trace Error",
      language,
      blockTree: null,
      steps: [],
      inputTokens: tokenizeInput(input),
      sourceMap: {},
      stdout: "",
      meta: emptyMeta(),
      error: `Unsupported language: ${String(language)}. Use 'cpp' or 'java'.`,
    };
  }
  if (code.length > MAX_CODE_SIZE) {
    return {
      status: "Trace Error",
      language,
      blockTree: null,
      steps: [],
      inputTokens: tokenizeInput(input),
      sourceMap: {},
      stdout: "",
      meta: emptyMeta(),
      error: `Code exceeds maximum size of ${MAX_CODE_SIZE / 1024} KB.`,
    };
  }
  if (input.length > MAX_INPUT_SIZE) {
    return {
      status: "Trace Error",
      language,
      blockTree: null,
      steps: [],
      inputTokens: tokenizeInput(""),
      sourceMap: {},
      stdout: "",
      meta: emptyMeta(),
      error: `Input exceeds maximum size of ${MAX_INPUT_SIZE / 1024} KB.`,
    };
  }

  // ── Static pass (always attempted) ───────────────────────────────────────
  let blockTree;
  let sourceMap = {};
  try {
    const structural = buildBlockTree(language, code);
    blockTree = structural.blockTree;
    sourceMap = structural.sourceMap || {};
  } catch (parseError) {
    return {
      status: "Trace Error",
      language,
      blockTree: null,
      steps: [],
      inputTokens: tokenizeInput(input),
      sourceMap: {},
      stdout: "",
      meta: emptyMeta(),
      error: (parseError && parseError.message) || "Unable to parse source",
    };
  }

  // ── Instrument ────────────────────────────────────────────────────────────
  let instrumented;
  try {
    instrumented = instrument(language, code, blockTree);
  } catch (instrumentError) {
    // Fall back to a non-animated block view (Requirement 8.2).
    return {
      status: "StaticOnly",
      language,
      blockTree,
      steps: [],
      inputTokens: tokenizeInput(input),
      sourceMap,
      stdout: "",
      meta: emptyMeta(),
      error:
        (instrumentError && instrumentError.message) ||
        "Failed to instrument source",
    };
  }

  // ── Dynamic pass (compile + run instrumented build in sandbox) ───────────
  let run;
  try {
    run = await executeInstrumented(language, instrumented.source, input);
  } catch (runError) {
    // Any unexpected executor failure still degrades to a static view rather
    // than throwing to the caller (Requirement 8.5).
    return {
      status: "StaticOnly",
      language,
      blockTree,
      steps: [],
      inputTokens: tokenizeInput(input),
      sourceMap,
      stdout: "",
      meta: emptyMeta(),
      error: (runError && runError.message) || "Failed to execute instrumented build",
    };
  }

  // Compile failure → StaticOnly with the block tree (Requirement 8.2).
  if (run && run.compilationError) {
    return {
      status: "StaticOnly",
      language,
      blockTree,
      steps: [],
      inputTokens: tokenizeInput(input),
      sourceMap,
      stdout: "",
      meta: emptyMeta(),
      error: run.stderr || "Compilation Error",
    };
  }

  // ── Parse emitted events into capped steps ───────────────────────────────
  const parsed = parseTraceEvents(
    run && run.traceEvents ? run.traceEvents : "",
    blockTree,
    STEP_CAP
  );

  // ── Determine status (Requirements 8.3, 8.4) ─────────────────────────────
  /** @type {TraceStatus} */
  let status = "OK";
  if (run && run.tle) {
    status = "Time Limit Exceeded";
  } else if (run && run.exitCode !== 0) {
    status = "Runtime Error";
  }

  const inputTokens = linkConsumedTokens(tokenizeInput(input), parsed.steps);

  /** @type {TraceResult} */
  const result = {
    status,
    language,
    blockTree,
    steps: parsed.steps,
    inputTokens,
    sourceMap,
    stdout: (run && run.stdout) || "",
    meta: {
      totalSteps: parsed.totalSteps,
      truncated: parsed.totalSteps > STEP_CAP,
      stepCap: STEP_CAP,
      timeMs: (run && run.time) || 0,
    },
  };

  if (status === "Runtime Error" || status === "Time Limit Exceeded") {
    result.error = (run && run.stderr) || status;
  }

  return result;
}

module.exports = { traceProgram, emptyMeta };
