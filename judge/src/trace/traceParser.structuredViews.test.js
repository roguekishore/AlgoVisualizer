/**
 * Unit tests for structured-view parsing in `normalizeVars` (task 20.3).
 *
 * These are concrete, example-based tests that drive the public
 * `parseTraceEvents` API with multi-step NDJSON fixtures and assert the
 * structured `view` each `VarSnapshot` carries:
 *   - `view.kind` classification (R10)
 *   - kind-specific `view.data` shape (R10)
 *   - element-level `view.changedKeys` across consecutive steps (R11)
 *   - graceful fallback for malformed / missing `view` without throwing
 *     (Requirement 3.5): the snapshot is left view-less and the back-compat
 *     scalar `value` still works.
 *
 * Companion to the property-based diff-soundness test
 * (`traceParser.diffSoundness.pbt.test.js`); this file pins down concrete
 * shapes and edge cases for each `ViewKind`.
 *
 * Uses the built-in `node:test` runner (see package.json "test" script).
 */

const test = require("node:test");
const assert = require("node:assert");

const { parseTraceEvents } = require("./traceParser");

// Single-block tree; every fixture event references "b0" so the same variable
// (matched by scope + name) is diffed across consecutive steps.
const BLOCK_TREE = {
  id: "b0",
  type: "program",
  label: "program",
  sourceRange: { startLine: 1, startCol: 1, endLine: 100, endCol: 1 },
  parentId: null,
  children: [],
};

const SCOPE = "main";

/** Build an NDJSON string from an array of event objects. */
function ndjson(events) {
  return events.map((e) => JSON.stringify(e)).join("\n");
}

/** Build one event carrying a single variable `v` with the given view. */
function varEvent(view, extra = {}) {
  return {
    blockId: "b0",
    line: 1,
    kind: "assign",
    vars: [{ name: "v", type: view.kind, scope: SCOPE, view, ...extra }],
  };
}

/** Parse a list of views (one per step) and return the resulting steps. */
function stepsForViews(views) {
  const raw = ndjson(views.map((view) => varEvent(view)));
  const { steps } = parseTraceEvents(raw, BLOCK_TREE, 10000);
  return steps;
}

// --------------------------------------------------------------------------
// array1d
// --------------------------------------------------------------------------

test("array1d: kind, string[] data shape, and changedKeys across two steps", () => {
  const steps = stepsForViews([
    { kind: "array1d", data: ["0", "0", "0"] },
    { kind: "array1d", data: ["0", "7", "0"] }, // index 1 changed
  ]);

  assert.strictEqual(steps.length, 2);

  const v0 = steps[0].vars[0].view;
  assert.strictEqual(v0.kind, "array1d");
  assert.deepStrictEqual(v0.data, ["0", "0", "0"]);
  assert.ok(Array.isArray(v0.data) && v0.data.every((x) => typeof x === "string"));
  // First appearance: no comparable previous step, so no element keys.
  assert.deepStrictEqual(v0.changedKeys, []);

  const v1 = steps[1].vars[0].view;
  assert.strictEqual(v1.kind, "array1d");
  assert.deepStrictEqual(v1.data, ["0", "7", "0"]);
  assert.deepStrictEqual(v1.changedKeys, ["1"]);
  // Whole-variable changed flag is also set.
  assert.strictEqual(steps[1].vars[0].changed, true);
});

test("array1d: appended element is reported as a changed index", () => {
  const steps = stepsForViews([
    { kind: "array1d", data: ["1", "2"] },
    { kind: "array1d", data: ["1", "2", "3"] }, // index 2 is new
  ]);

  assert.deepStrictEqual(steps[1].vars[0].view.changedKeys, ["2"]);
});

// --------------------------------------------------------------------------
// array2d
// --------------------------------------------------------------------------

test("array2d: kind, string[][] data shape, and 'r,c' changedKeys", () => {
  const steps = stepsForViews([
    {
      kind: "array2d",
      data: [
        ["0", "0"],
        ["0", "0"],
      ],
    },
    {
      kind: "array2d",
      data: [
        ["0", "0"],
        ["9", "0"],
      ], // cell (1,0) changed
    },
  ]);

  const v0 = steps[0].vars[0].view;
  assert.strictEqual(v0.kind, "array2d");
  assert.deepStrictEqual(v0.data, [
    ["0", "0"],
    ["0", "0"],
  ]);
  assert.ok(
    Array.isArray(v0.data) &&
      v0.data.every((row) => Array.isArray(row) && row.every((x) => typeof x === "string"))
  );

  const v1 = steps[1].vars[0].view;
  assert.strictEqual(v1.kind, "array2d");
  assert.deepStrictEqual(v1.changedKeys, ["1,0"]);
});

// --------------------------------------------------------------------------
// stack
// --------------------------------------------------------------------------

test("stack: kind, { items } shape, and 'top' changedKey on push", () => {
  // Stack items ordered bottom..top.
  const steps = stepsForViews([
    { kind: "stack", data: { items: ["1", "2"] } },
    { kind: "stack", data: { items: ["1", "2", "3"] } }, // push 3 -> top changed
  ]);

  const v0 = steps[0].vars[0].view;
  assert.strictEqual(v0.kind, "stack");
  assert.deepStrictEqual(v0.data.items, ["1", "2"]);

  const v1 = steps[1].vars[0].view;
  assert.deepStrictEqual(v1.changedKeys, ["top"]);
});

test("stack: 'top' changedKey on pop", () => {
  const steps = stepsForViews([
    { kind: "stack", data: { items: ["1", "2", "3"] } },
    { kind: "stack", data: { items: ["1", "2"] } }, // pop -> new top is 2
  ]);

  assert.deepStrictEqual(steps[1].vars[0].view.changedKeys, ["top"]);
});

test("stack: unchanged top yields no changedKeys", () => {
  const steps = stepsForViews([
    { kind: "stack", data: { items: ["1", "2", "9"] } },
    { kind: "stack", data: { items: ["5", "6", "9"] } }, // bottom churned, top same
  ]);

  assert.deepStrictEqual(steps[1].vars[0].view.changedKeys, []);
});

// --------------------------------------------------------------------------
// queue
// --------------------------------------------------------------------------

test("queue: kind, { items } shape, 'back' changedKey on enqueue", () => {
  // Queue items ordered front..back.
  const steps = stepsForViews([
    { kind: "queue", data: { items: ["1", "2"] } },
    { kind: "queue", data: { items: ["1", "2", "3"] } }, // enqueue -> back changed
  ]);

  const v0 = steps[0].vars[0].view;
  assert.strictEqual(v0.kind, "queue");
  assert.deepStrictEqual(v0.data.items, ["1", "2"]);

  assert.deepStrictEqual(steps[1].vars[0].view.changedKeys, ["back"]);
});

test("queue: 'front' changedKey on dequeue", () => {
  const steps = stepsForViews([
    { kind: "queue", data: { items: ["1", "2", "3"] } },
    { kind: "queue", data: { items: ["2", "3"] } }, // dequeue -> front changed, back same
  ]);

  assert.deepStrictEqual(steps[1].vars[0].view.changedKeys, ["front"]);
});

test("queue: both ends change yields 'front' and 'back'", () => {
  const steps = stepsForViews([
    { kind: "queue", data: { items: ["1", "2", "3"] } },
    { kind: "queue", data: { items: ["9", "2", "8"] } }, // front and back both changed
  ]);

  assert.deepStrictEqual(new Set(steps[1].vars[0].view.changedKeys), new Set(["front", "back"]));
});

// --------------------------------------------------------------------------
// map
// --------------------------------------------------------------------------

test("map: kind, {key,value}[] data shape, and changed map keys", () => {
  const steps = stepsForViews([
    {
      kind: "map",
      data: [
        { key: "a", value: "1" },
        { key: "b", value: "2" },
      ],
    },
    {
      kind: "map",
      data: [
        { key: "a", value: "1" }, // unchanged
        { key: "b", value: "5" }, // value changed
        { key: "c", value: "7" }, // new key
      ],
    },
  ]);

  const v0 = steps[0].vars[0].view;
  assert.strictEqual(v0.kind, "map");
  assert.deepStrictEqual(v0.data, [
    { key: "a", value: "1" },
    { key: "b", value: "2" },
  ]);

  const changed = new Set(steps[1].vars[0].view.changedKeys);
  assert.ok(changed.has("b"), "changed value key 'b' should be reported");
  assert.ok(changed.has("c"), "new key 'c' should be reported");
  assert.ok(!changed.has("a"), "unchanged key 'a' should not be reported");
});

// --------------------------------------------------------------------------
// malformed / missing view -> scalar fallback, never throws
// --------------------------------------------------------------------------

test("malformed view (no kind) is dropped, scalar value still works, no throw", () => {
  let result;
  assert.doesNotThrow(() => {
    const raw = ndjson([
      { blockId: "b0", line: 1, kind: "assign", vars: [{ name: "v", scope: SCOPE, value: "42", view: { data: [1, 2] } }] },
    ]);
    result = parseTraceEvents(raw, BLOCK_TREE, 10000);
  });

  const snap = result.steps[0].vars[0];
  assert.strictEqual(snap.view, undefined, "view without kind should be dropped");
  assert.strictEqual(snap.value, "42", "back-compat scalar value is preserved");
});

test("malformed view (unknown kind) is dropped without throwing", () => {
  let result;
  assert.doesNotThrow(() => {
    const raw = ndjson([
      { blockId: "b0", line: 1, kind: "assign", vars: [{ name: "v", scope: SCOPE, value: "x", view: { kind: "graph", data: {} } }] },
    ]);
    result = parseTraceEvents(raw, BLOCK_TREE, 10000);
  });

  assert.strictEqual(result.steps[0].vars[0].view, undefined);
  assert.strictEqual(result.steps[0].vars[0].value, "x");
});

test("malformed view (non-object) is dropped without throwing", () => {
  for (const badView of ["nope", 42, [1, 2, 3], true]) {
    let result;
    assert.doesNotThrow(() => {
      const raw = ndjson([
        { blockId: "b0", line: 1, kind: "assign", vars: [{ name: "v", scope: SCOPE, value: "v0", view: badView }] },
      ]);
      result = parseTraceEvents(raw, BLOCK_TREE, 10000);
    });
    assert.strictEqual(result.steps[0].vars[0].view, undefined, `view=${JSON.stringify(badView)} should be dropped`);
    assert.strictEqual(result.steps[0].vars[0].value, "v0");
  }
});

test("missing view entirely: snapshot is view-less scalar, no throw", () => {
  let result;
  assert.doesNotThrow(() => {
    const raw = ndjson([
      { blockId: "b0", line: 1, kind: "assign", vars: [{ name: "v", type: "int", scope: SCOPE, value: "10" }] },
      { blockId: "b0", line: 1, kind: "assign", vars: [{ name: "v", type: "int", scope: SCOPE, value: "11" }] },
    ]);
    result = parseTraceEvents(raw, BLOCK_TREE, 10000);
  });

  assert.strictEqual(result.steps.length, 2);
  assert.strictEqual(result.steps[0].vars[0].view, undefined);
  assert.strictEqual(result.steps[0].vars[0].value, "10");
  // Whole-variable change still tracked for view-less scalars.
  assert.strictEqual(result.steps[1].vars[0].changed, true);
  assert.strictEqual(result.steps[1].vars[0].value, "11");
});

test("mix of valid and malformed views in the same step does not throw", () => {
  let result;
  assert.doesNotThrow(() => {
    const raw = ndjson([
      {
        blockId: "b0",
        line: 1,
        kind: "assign",
        vars: [
          { name: "good", scope: SCOPE, view: { kind: "array1d", data: ["1"] } },
          { name: "bad", scope: SCOPE, value: "s", view: { kind: "totally-unknown" } },
          { name: "missing", scope: SCOPE, value: "m" },
        ],
      },
    ]);
    result = parseTraceEvents(raw, BLOCK_TREE, 10000);
  });

  const vars = result.steps[0].vars;
  assert.strictEqual(vars[0].view.kind, "array1d");
  assert.strictEqual(vars[1].view, undefined);
  assert.strictEqual(vars[2].view, undefined);
});
