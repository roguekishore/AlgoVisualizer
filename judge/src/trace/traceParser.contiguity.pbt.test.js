/**
 * Property-based test for step contiguity (task 3.3).
 *
 * Property 3: Step contiguity — `steps[i].index === i` for all i.
 * **Validates: Requirements 3.2**
 *
 * Strategy: generate random NDJSON raw-event streams against a known, fixed
 * block tree (so a subset of blockIds are valid). The generator deliberately
 * mixes well-formed events, blank lines, malformed JSON, and events that
 * reference unknown block ids — exactly the inputs `parseTraceEvents` must skip
 * defensively (Algorithm 3 / Requirement 3.5). Regardless of which lines are
 * dropped, the stored steps must carry contiguous 0-based indices.
 *
 * Uses the built-in `node:test` runner (see package.json "test" script) with
 * fast-check as the property engine.
 */

const test = require("node:test");
const assert = require("node:assert");
const fc = require("fast-check");

const { parseTraceEvents } = require("./traceParser");
const { STEP_CAP } = require("./constants");

/**
 * A known, fixed block tree. Its ids are the only ones a valid event may
 * reference; any other blockId must be dropped by `parseTraceEvents`.
 */
const KNOWN_TREE = {
  id: "b0",
  type: "program",
  label: "program",
  sourceRange: { startLine: 1, startCol: 1, endLine: 20, endCol: 1 },
  parentId: null,
  children: [
    {
      id: "b1",
      type: "function",
      label: "main",
      sourceRange: { startLine: 1, startCol: 1, endLine: 20, endCol: 1 },
      parentId: "b0",
      children: [
        {
          id: "b2",
          type: "loop",
          label: "for",
          sourceRange: { startLine: 5, startCol: 3, endLine: 12, endCol: 3 },
          parentId: "b1",
          children: [
            {
              id: "b3",
              type: "conditional",
              label: "if",
              sourceRange: { startLine: 7, startCol: 5, endLine: 9, endCol: 5 },
              parentId: "b2",
              children: [],
            },
          ],
        },
      ],
    },
  ],
};

const VALID_IDS = ["b0", "b1", "b2", "b3"];
const KINDS = [
  "enter",
  "exit",
  "iterate",
  "assign",
  "read",
  "write",
  "call",
  "return",
];

/** Arbitrary producing a well-formed NDJSON line for a valid block. */
const validEventLine = fc
  .record({
    blockId: fc.constantFrom(...VALID_IDS),
    line: fc.integer({ min: 1, max: 20 }),
    kind: fc.constantFrom(...KINDS),
    vars: fc.array(
      fc.record({
        name: fc.string({ minLength: 1, maxLength: 4 }),
        type: fc.constantFrom("int", "long", "String"),
        value: fc.string({ maxLength: 6 }),
        scope: fc.constantFrom(...VALID_IDS),
      }),
      { maxLength: 3 }
    ),
  })
  .map((ev) => JSON.stringify(ev));

/** Arbitrary producing lines that must be skipped defensively. */
const blankLine = fc.constantFrom("", "   ", "\t");
const malformedLine = fc.constantFrom(
  "{not json",
  "}{",
  "[1,2,3]", // valid JSON but not an object event
  "42",
  '"a string"',
  "null"
);
const unknownBlockLine = fc
  .record({
    blockId: fc.constantFrom("bX", "b99", "zzz", ""),
    line: fc.integer({ min: 1, max: 20 }),
    kind: fc.constantFrom(...KINDS),
  })
  .map((ev) => JSON.stringify(ev));

/** Any single line: a weighted mix of valid and droppable lines. */
const anyLine = fc.oneof(
  { weight: 6, arbitrary: validEventLine },
  { weight: 1, arbitrary: blankLine },
  { weight: 1, arbitrary: malformedLine },
  { weight: 1, arbitrary: unknownBlockLine }
);

/** A full raw NDJSON event stream. */
const rawEventStream = fc
  .array(anyLine, { maxLength: 200 })
  .map((lines) => lines.join("\n"));

test("Property 3: stored steps have contiguous 0-based indices", () => {
  fc.assert(
    fc.property(rawEventStream, (rawEvents) => {
      const { steps, totalSteps } = parseTraceEvents(
        rawEvents,
        KNOWN_TREE,
        STEP_CAP
      );

      // Contiguity: steps[i].index === i for all i.
      for (let i = 0; i < steps.length; i += 1) {
        assert.strictEqual(
          steps[i].index,
          i,
          `expected steps[${i}].index === ${i}, got ${steps[i].index}`
        );
      }

      // Supporting invariants from Algorithm 3 that contiguity relies on.
      assert.ok(steps.length <= STEP_CAP, "steps length must not exceed cap");
      assert.ok(
        totalSteps >= steps.length,
        "totalSteps must be >= stored steps"
      );
      assert.strictEqual(
        steps.length,
        Math.min(totalSteps, STEP_CAP),
        "steps.length must equal min(totalSteps, stepCap)"
      );
    }),
    { numRuns: 50 }
  );
});

test("Property 3: contiguity holds with a small stepCap forcing truncation", () => {
  const smallCap = 5;
  fc.assert(
    fc.property(
      fc.array(validEventLine, { minLength: 0, maxLength: 50 }),
      (lines) => {
        const rawEvents = lines.join("\n");
        const { steps, totalSteps } = parseTraceEvents(
          rawEvents,
          KNOWN_TREE,
          smallCap
        );

        for (let i = 0; i < steps.length; i += 1) {
          assert.strictEqual(steps[i].index, i);
        }
        assert.ok(steps.length <= smallCap);
        assert.strictEqual(steps.length, Math.min(totalSteps, smallCap));
      }
    ),
    { numRuns: 50 }
  );
});
