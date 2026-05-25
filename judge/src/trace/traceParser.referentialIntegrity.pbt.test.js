/**
 * Property-based test — Referential integrity of parsed trace steps.
 *
 * Property 4 (design.md) / Requirement 3.3:
 *   Every stored step's `blockId` references an existing block in the block
 *   tree, and its `line` lies within that block's `sourceRange`.
 *
 * Strategy:
 *   - Generate a nested `BlockNode` tree with contained, 1-based source ranges
 *     (each child's range lies inside its parent's, `startLine <= endLine`).
 *   - Generate a stream of raw NDJSON events: VALID events whose `blockId` and
 *     `line` are drawn from a real block and a line inside that block's range,
 *     interleaved with INVALID events (unknown blockId, malformed JSON, blank
 *     lines, primitives/arrays) that the parser must drop defensively.
 *   - Assert that for every step `parseTraceEvents` stores, the blockId exists
 *     in the tree and the line falls within that block's source range.
 *
 * **Validates: Requirements 3.3**
 */

const test = require("node:test");
const assert = require("node:assert");
const fc = require("fast-check");

const { parseTraceEvents } = require("./traceParser");

const STEP_KINDS = [
  "enter",
  "exit",
  "iterate",
  "assign",
  "read",
  "write",
  "call",
  "return",
];

// Raw lines that must never survive parsing into a step.
const MALFORMED_RAW = [
  "", // blank
  "   ", // whitespace-only
  "not json at all",
  "{ broken json", // unterminated object
  "[1, 2, 3]", // array — not a usable object event
  "42", // primitive
  '"a string"', // primitive
  "null", // null
  '{"line": 1, "kind": "enter"}', // missing blockId
  '{"blockId": 12, "line": 1, "kind": "enter"}', // non-string blockId
];

/**
 * A recursive shape describing the nesting of blocks (no ranges yet).
 * Depth and breadth are bounded to keep generated trees small.
 */
const treeShapeArb = fc.letrec((rec) => ({
  node: fc.record({
    children: fc.oneof(
      { maxDepth: 3, withCrossShrink: true },
      fc.constant([]),
      fc.array(rec("node"), { maxLength: 3 }),
    ),
  }),
})).node;

/**
 * Lay out a generated tree shape into concrete `BlockNode`s with contained,
 * 1-based line ranges. Returns the root node plus a flat list of every node.
 *
 * Each node occupies a contiguous span of lines: a leading "header" line, then
 * its children's spans nested inside, then a trailing "closing" line. This
 * guarantees `child.range ⊆ parent.range` and `startLine <= endLine`.
 */
function layout(shape) {
  const flat = [];
  const counter = { id: 0, line: 1 };

  function place(node, parentId) {
    const id = `b${counter.id++}`;
    const startLine = counter.line;
    counter.line += 1; // header line owned by this block

    const children = [];
    for (const childShape of node.children) {
      children.push(place(childShape, id));
    }

    const endLine = counter.line; // trailing/closing line for this block
    counter.line += 1;

    const blockNode = {
      id,
      type: parentId === null ? "program" : "block",
      label: id,
      sourceRange: { startLine, startCol: 1, endLine, endCol: 1 },
      parentId,
      children,
    };
    flat.push(blockNode);
    return blockNode;
  }

  const root = place(shape, null);
  return { root, flat };
}

/**
 * Descriptor for a single raw event line. A "valid" descriptor is resolved
 * against the laid-out blocks at test time; an "invalid" descriptor is an
 * opaque raw string that must be dropped.
 */
const eventDescriptorArb = fc.oneof(
  fc.record({
    valid: fc.constant(true),
    blockSel: fc.nat({ max: 100000 }),
    lineSel: fc.nat({ max: 100000 }),
    kind: fc.constantFrom(...STEP_KINDS),
  }),
  fc.record({
    valid: fc.constant(false),
    raw: fc.constantFrom(...MALFORMED_RAW),
  }),
);

test("Property 4: every stored step references an existing block and an in-range line", () => {
  fc.assert(
    fc.property(
      treeShapeArb,
      fc.array(eventDescriptorArb, { maxLength: 60 }),
      fc.integer({ min: 1, max: 10000 }),
      (shape, descriptors, stepCap) => {
        const { root, flat } = layout(shape);

        const rangeById = new Map();
        for (const b of flat) {
          rangeById.set(b.id, b.sourceRange);
        }

        // Build the raw NDJSON stream from the descriptors.
        const lines = descriptors.map((d) => {
          if (!d.valid) {
            return d.raw;
          }
          const block = flat[d.blockSel % flat.length];
          const { startLine, endLine } = block.sourceRange;
          const span = endLine - startLine + 1;
          const line = startLine + (d.lineSel % span);
          return JSON.stringify({ blockId: block.id, line, kind: d.kind });
        });
        const rawEvents = lines.join("\n");

        const { steps } = parseTraceEvents(rawEvents, root, stepCap);

        // Core property: referential integrity holds for every stored step.
        for (const step of steps) {
          assert.ok(
            rangeById.has(step.blockId),
            `step.blockId ${step.blockId} must reference an existing block`,
          );
          const range = rangeById.get(step.blockId);
          assert.ok(
            step.line >= range.startLine && step.line <= range.endLine,
            `step.line ${step.line} must lie within [${range.startLine}, ${range.endLine}] of block ${step.blockId}`,
          );
        }
      },
    ),
    { numRuns: 50 },
  );
});

test("referential integrity holds on a concrete mixed stream", () => {
  const blockTree = {
    id: "b0",
    type: "program",
    label: "program",
    sourceRange: { startLine: 1, startCol: 1, endLine: 10, endCol: 1 },
    parentId: null,
    children: [
      {
        id: "b1",
        type: "loop",
        label: "for",
        sourceRange: { startLine: 3, startCol: 1, endLine: 6, endCol: 1 },
        parentId: "b0",
        children: [],
      },
    ],
  };

  const rawEvents = [
    JSON.stringify({ blockId: "b0", line: 1, kind: "enter" }),
    "garbage not json",
    JSON.stringify({ blockId: "b1", line: 4, kind: "iterate" }),
    JSON.stringify({ blockId: "ghost", line: 99, kind: "enter" }), // unknown -> dropped
    "",
    JSON.stringify({ blockId: "b1", line: 5, kind: "assign", vars: [] }),
  ].join("\n");

  const { steps, totalSteps } = parseTraceEvents(rawEvents, blockTree, 10000);

  // Only the 3 valid, known-block events survive.
  assert.strictEqual(steps.length, 3);
  assert.strictEqual(totalSteps, 3);

  const rangeById = new Map([
    ["b0", blockTree.sourceRange],
    ["b1", blockTree.children[0].sourceRange],
  ]);
  for (const step of steps) {
    assert.ok(rangeById.has(step.blockId));
    const r = rangeById.get(step.blockId);
    assert.ok(step.line >= r.startLine && step.line <= r.endLine);
  }
});
