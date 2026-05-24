/**
 * Unit tests for `parseTraceEvents` edge cases (task 3.7).
 *
 * Covers Requirements 3.4 and 3.5:
 *   - Well-formed NDJSON events parsed in order with contiguous 0-based indices.
 *   - Blank lines skipped.
 *   - Malformed JSON lines skipped without throwing.
 *   - Events referencing an unknown blockId skipped.
 *   - Exact step-cap boundary: `steps` capped at `stepCap` while `totalSteps`
 *     keeps counting every valid event beyond the cap.
 *
 * Uses the built-in `node:test` runner (see package.json "test" script).
 */

const test = require("node:test");
const assert = require("node:assert");

const { parseTraceEvents } = require("./traceParser");

/**
 * A small block tree with three known block ids: b0 (root), b1, b2.
 */
const blockTree = {
  id: "b0",
  children: [{ id: "b1", children: [] }, { id: "b2", children: [] }],
};

/** Build an NDJSON string from an array of event objects. */
function ndjson(events) {
  return events.map((e) => JSON.stringify(e)).join("\n");
}

test("parses well-formed events in order with contiguous 0-based indices", () => {
  const raw = ndjson([
    { blockId: "b0", line: 1, kind: "enter" },
    { blockId: "b1", line: 2, kind: "iterate" },
    { blockId: "b2", line: 3, kind: "assignment" },
  ]);

  const { steps, totalSteps } = parseTraceEvents(raw, blockTree, 100);

  assert.strictEqual(totalSteps, 3);
  assert.strictEqual(steps.length, 3);
  assert.deepStrictEqual(
    steps.map((s) => s.index),
    [0, 1, 2]
  );
  assert.deepStrictEqual(
    steps.map((s) => s.blockId),
    ["b0", "b1", "b2"]
  );
  assert.deepStrictEqual(
    steps.map((s) => s.kind),
    ["enter", "iterate", "assignment"]
  );
});

test("skips blank lines (including whitespace-only lines)", () => {
  const raw = [
    JSON.stringify({ blockId: "b0", line: 1, kind: "enter" }),
    "",
    "   ",
    "\t",
    JSON.stringify({ blockId: "b1", line: 2, kind: "assignment" }),
    "",
  ].join("\n");

  const { steps, totalSteps } = parseTraceEvents(raw, blockTree, 100);

  assert.strictEqual(totalSteps, 2);
  assert.strictEqual(steps.length, 2);
  assert.deepStrictEqual(
    steps.map((s) => s.index),
    [0, 1]
  );
  assert.deepStrictEqual(
    steps.map((s) => s.blockId),
    ["b0", "b1"]
  );
});

test("skips malformed JSON lines without throwing", () => {
  const raw = [
    JSON.stringify({ blockId: "b0", line: 1, kind: "enter" }),
    "{ not valid json",
    "42", // primitive, not an object event
    "[1,2,3]", // array, not an object event
    "null", // null, not a usable object
    JSON.stringify({ blockId: "b1", line: 2, kind: "assignment" }),
  ].join("\n");

  let result;
  assert.doesNotThrow(() => {
    result = parseTraceEvents(raw, blockTree, 100);
  });

  assert.strictEqual(result.totalSteps, 2);
  assert.strictEqual(result.steps.length, 2);
  assert.deepStrictEqual(
    result.steps.map((s) => s.blockId),
    ["b0", "b1"]
  );
  assert.deepStrictEqual(
    result.steps.map((s) => s.index),
    [0, 1]
  );
});

test("skips events referencing an unknown blockId", () => {
  const raw = ndjson([
    { blockId: "b0", line: 1, kind: "enter" },
    { blockId: "unknown-block", line: 9, kind: "assignment" },
    { blockId: "b2", line: 3, kind: "return" },
    { line: 4, kind: "assignment" }, // missing blockId entirely
  ]);

  const { steps, totalSteps } = parseTraceEvents(raw, blockTree, 100);

  assert.strictEqual(totalSteps, 2);
  assert.strictEqual(steps.length, 2);
  assert.deepStrictEqual(
    steps.map((s) => s.blockId),
    ["b0", "b2"]
  );
  // Indices remain contiguous despite skipped events.
  assert.deepStrictEqual(
    steps.map((s) => s.index),
    [0, 1]
  );
});

test("at exact step-cap boundary stores exactly stepCap steps", () => {
  // Emit exactly `cap` valid events: nothing truncated.
  const cap = 5;
  const events = Array.from({ length: cap }, (_, i) => ({
    blockId: "b0",
    line: i + 1,
    kind: "assignment",
  }));

  const { steps, totalSteps } = parseTraceEvents(ndjson(events), blockTree, cap);

  assert.strictEqual(totalSteps, cap);
  assert.strictEqual(steps.length, cap);
  assert.deepStrictEqual(
    steps.map((s) => s.index),
    [0, 1, 2, 3, 4]
  );
});

test("beyond step-cap, totalSteps counts all valid events but steps is capped", () => {
  const cap = 5;
  const emitted = 8; // 3 beyond the cap
  const events = Array.from({ length: emitted }, (_, i) => ({
    blockId: "b0",
    line: i + 1,
    kind: "assignment",
  }));

  const { steps, totalSteps } = parseTraceEvents(ndjson(events), blockTree, cap);

  assert.strictEqual(totalSteps, emitted);
  assert.strictEqual(steps.length, cap);
  // Stored steps are the first `cap` events, in order.
  assert.deepStrictEqual(
    steps.map((s) => s.line),
    [1, 2, 3, 4, 5]
  );
  // truncated holds iff totalSteps > steps.length.
  assert.ok(totalSteps > steps.length);
});

test("invalid events past the cap do not increment totalSteps", () => {
  const cap = 2;
  const raw = [
    JSON.stringify({ blockId: "b0", line: 1, kind: "enter" }),
    JSON.stringify({ blockId: "b1", line: 2, kind: "assignment" }),
    "", // blank, never counts
    "garbage json", // malformed, never counts
    JSON.stringify({ blockId: "nope", line: 3, kind: "assignment" }), // unknown, never counts
    JSON.stringify({ blockId: "b2", line: 4, kind: "return" }), // valid, beyond cap
  ].join("\n");

  const { steps, totalSteps } = parseTraceEvents(raw, blockTree, cap);

  assert.strictEqual(steps.length, cap);
  // 3 valid events total (b0, b1, b2); blank/malformed/unknown are not counted.
  assert.strictEqual(totalSteps, 3);
});

test("non-positive or non-finite stepCap stores no steps but still counts totals", () => {
  const raw = ndjson([
    { blockId: "b0", line: 1, kind: "enter" },
    { blockId: "b1", line: 2, kind: "assignment" },
  ]);

  for (const badCap of [0, -1, NaN, Infinity]) {
    const { steps, totalSteps } = parseTraceEvents(raw, blockTree, badCap);
    assert.strictEqual(steps.length, 0, `cap=${badCap} should store no steps`);
    assert.strictEqual(totalSteps, 2, `cap=${badCap} should still count totals`);
  }
});

test("empty or non-string rawEvents yields an empty result", () => {
  for (const bad of ["", null, undefined, 123, {}]) {
    const { steps, totalSteps } = parseTraceEvents(bad, blockTree, 10);
    assert.strictEqual(steps.length, 0);
    assert.strictEqual(totalSteps, 0);
  }
});
