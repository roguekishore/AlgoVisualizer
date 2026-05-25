/**
 * Property-based test — Element-level diff soundness.
 *
 * Property 11 (design.md, Phase 2) / Requirement R11:
 *   When a captured value changes between consecutive steps, the system
 *   identifies which elements changed. This test pins the *soundness* half of
 *   that guarantee:
 *
 *     - Every key in a variable's `view.changedKeys` names an element whose
 *       value actually differs from the previous step's value at that key.
 *     - An element that did NOT change is never listed in `changedKeys`.
 *
 * Strategy:
 *   - Generate a pair of consecutive structured views (previous + current) for
 *     a variety of kinds (array1d/list/set, array2d, stack, queue, deque, map),
 *     using a small value alphabet so changes and non-changes both occur often.
 *   - Feed them through the public `parseTraceEvents` API as a two-step NDJSON
 *     stream (one block, the same variable by scope+name in both steps) so the
 *     internal `normalizeVars` diff runs exactly as in production.
 *   - Read `steps[1].vars[0].view.changedKeys` and, for each comparable element
 *     position, cross-check the reported key against the ground-truth element
 *     values (independently of the implementation's diff helpers).
 *
 * **Validates: R11**
 */

const test = require("node:test");
const assert = require("node:assert");
const fc = require("fast-check");

const { parseTraceEvents } = require("./traceParser");

// A single-block tree; both events reference it so the variable is matched
// across steps by scope + name.
const BLOCK_TREE = {
  id: "b0",
  type: "program",
  label: "program",
  sourceRange: { startLine: 1, startCol: 1, endLine: 100, endCol: 1 },
  parentId: null,
  children: [],
};

const VAR_NAME = "v";
const VAR_SCOPE = "main";

// Small alphabet of element values (emitted as strings by the runtimes) so
// independent prev/cur generation yields a healthy mix of equal and changed
// elements, exercising both soundness directions.
const elemArb = fc.constantFrom("0", "1", "2", "3");

const arr1dArb = fc.array(elemArb, { maxLength: 6 });
const arr2dArb = fc.array(fc.array(elemArb, { maxLength: 4 }), { maxLength: 4 });

// Map entries with unique keys (duplicate keys are not produced by the
// runtimes and would make ground-truth lookup ambiguous).
const mapArb = fc
  .uniqueArray(fc.constantFrom("a", "b", "c", "d", "e"), { maxLength: 5 })
  .chain((keys) =>
    fc.tuple(...keys.map(() => elemArb)).map((vals) =>
      keys.map((key, i) => ({ key, value: vals[i] })),
    ),
  );

/**
 * Build the kind-specific `view.data` for a generated element collection.
 * Mirrors the shapes the C++/Java runtimes emit (stack/queue wrap items;
 * deque/array are bare arrays).
 */
function makeData(kind, elems) {
  switch (kind) {
    case "stack":
    case "queue":
      return { items: elems };
    default:
      return elems; // array1d/list/set/deque -> bare array; array2d -> grid; map -> entries
  }
}

/**
 * Ground-truth lookup: the current element value at `key` for a given kind and
 * data, computed independently of the production diff helpers.
 */
function elementAt(kind, data, key) {
  const items = data && typeof data === "object" && Array.isArray(data.items)
    ? data.items
    : Array.isArray(data)
      ? data
      : [];
  switch (kind) {
    case "array1d":
    case "list":
    case "set":
      return Array.isArray(data) ? data[Number(key)] : undefined;
    case "array2d": {
      const [r, c] = key.split(",").map(Number);
      const row = Array.isArray(data) && Array.isArray(data[r]) ? data[r] : [];
      return row[c];
    }
    case "stack":
      return key === "top" ? items[items.length - 1] : undefined;
    case "queue":
    case "deque":
      if (key === "front") return items[0];
      if (key === "back") return items[items.length - 1];
      return undefined;
    case "map": {
      if (!Array.isArray(data)) return undefined;
      const entry = data.find((e) => e && String(e.key) === key);
      return entry ? entry.value : undefined;
    }
    default:
      return undefined;
  }
}

/**
 * The list of comparable element keys present in the CURRENT view's data.
 * Soundness is checked over exactly these positions: each is either reported
 * (and must differ) or not reported (and must be equal).
 */
function comparableKeys(kind, data) {
  const items = data && typeof data === "object" && Array.isArray(data.items)
    ? data.items
    : Array.isArray(data)
      ? data
      : [];
  switch (kind) {
    case "array1d":
    case "list":
    case "set":
      return (Array.isArray(data) ? data : []).map((_, i) => String(i));
    case "array2d": {
      const keys = [];
      (Array.isArray(data) ? data : []).forEach((row, r) => {
        (Array.isArray(row) ? row : []).forEach((_, c) => keys.push(`${r},${c}`));
      });
      return keys;
    }
    case "stack":
      return items.length > 0 ? ["top"] : [];
    case "queue":
    case "deque":
      return items.length > 0 ? ["front", "back"] : [];
    case "map":
      return (Array.isArray(data) ? data : []).map((e) => String(e.key));
    default:
      return [];
  }
}

const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/**
 * An arbitrary producing a kind plus a previous and current `view.data` pair.
 */
const viewPairArb = fc.oneof(
  fc.record({
    kind: fc.constantFrom("array1d", "list", "set"),
    prev: arr1dArb,
    cur: arr1dArb,
  }),
  fc.record({ kind: fc.constant("array2d"), prev: arr2dArb, cur: arr2dArb }),
  fc.record({ kind: fc.constant("stack"), prev: arr1dArb, cur: arr1dArb }),
  fc.record({ kind: fc.constant("queue"), prev: arr1dArb, cur: arr1dArb }),
  fc.record({ kind: fc.constant("deque"), prev: arr1dArb, cur: arr1dArb }),
  fc.record({ kind: fc.constant("map"), prev: mapArb, cur: mapArb }),
);

/**
 * Build the two-step NDJSON stream: step 0 carries the previous view, step 1
 * the current view, both for the same variable (scope + name).
 */
function buildEvents(kind, prevData, curData) {
  const mkEvent = (data) =>
    JSON.stringify({
      blockId: "b0",
      line: 1,
      kind: "assign",
      vars: [
        {
          name: VAR_NAME,
          type: kind,
          scope: VAR_SCOPE,
          view: { kind, data },
        },
      ],
    });
  return `${mkEvent(prevData)}\n${mkEvent(curData)}`;
}

test("Property 11: every changedKey names a genuinely changed element (diff soundness)", () => {
  fc.assert(
    fc.property(viewPairArb, ({ kind, prev, cur }) => {
      const prevData = makeData(kind, prev);
      const curData = makeData(kind, cur);

      const rawEvents = buildEvents(kind, prevData, curData);
      const { steps } = parseTraceEvents(rawEvents, BLOCK_TREE, 10000);

      assert.strictEqual(steps.length, 2, "both steps should be stored");
      const view = steps[1].vars[0].view;
      assert.ok(view, "current step's variable should carry a structured view");
      const changed = new Set(view.changedKeys);

      // Soundness: every reported key must reference a current element that
      // actually differs from the previous step's element at that key.
      for (const key of view.changedKeys) {
        const curElem = elementAt(kind, curData, key);
        const prevElem = elementAt(kind, prevData, key);
        assert.ok(
          !eq(curElem, prevElem),
          `changedKey "${key}" (${kind}) reported but element is unchanged: ${JSON.stringify(curElem)}`,
        );
      }

      // Unchanged elements are never listed: any comparable current element
      // equal to its previous counterpart must be absent from changedKeys.
      for (const key of comparableKeys(kind, curData)) {
        const curElem = elementAt(kind, curData, key);
        const prevElem = elementAt(kind, prevData, key);
        if (eq(curElem, prevElem)) {
          assert.ok(
            !changed.has(key),
            `unchanged element "${key}" (${kind}) must not appear in changedKeys`,
          );
        }
      }

      // Reported keys must be drawn from the current view's element positions
      // (no phantom keys pointing at removed/previous-only elements).
      const valid = new Set(comparableKeys(kind, curData));
      for (const key of view.changedKeys) {
        assert.ok(
          valid.has(key),
          `changedKey "${key}" (${kind}) is not a current element position`,
        );
      }
    }),
    { numRuns: 50 },
  );
});

test("diff soundness on a concrete array1d step pair", () => {
  // prev [1,2,3] -> cur [1,9,3]: only index 1 changed.
  const rawEvents = buildEvents("array1d", ["1", "2", "3"], ["1", "9", "3"]);
  const { steps } = parseTraceEvents(rawEvents, BLOCK_TREE, 10000);

  assert.strictEqual(steps.length, 2);
  assert.deepStrictEqual(steps[1].vars[0].view.changedKeys, ["1"]);
});

test("diff soundness on a concrete map step pair", () => {
  const prev = [{ key: "a", value: "1" }, { key: "b", value: "2" }];
  const cur = [{ key: "a", value: "1" }, { key: "b", value: "5" }, { key: "c", value: "7" }];
  const rawEvents = buildEvents("map", prev, cur);
  const { steps } = parseTraceEvents(rawEvents, BLOCK_TREE, 10000);

  assert.strictEqual(steps.length, 2);
  const changed = new Set(steps[1].vars[0].view.changedKeys);
  // "b" changed value, "c" is new; "a" unchanged.
  assert.ok(changed.has("b") && changed.has("c"));
  assert.ok(!changed.has("a"));
});
