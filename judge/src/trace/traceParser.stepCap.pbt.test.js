/**
 * Property-based test for the step cap and truncation honesty of
 * `parseTraceEvents` (task 3.5).
 *
 * Property 5: Step cap (design.md)
 *   length(steps) <= stepCap  ∧  (truncated <=> totalSteps > stepCap)
 *
 * Here `truncated` is the value the route derives from the parser output
 * (`totalSteps > stepCap`, see design.md line 496) and is observable in the
 * parser result as "steps were dropped", i.e. `steps.length < totalSteps`.
 *
 * **Validates: Requirements 3.4**
 *
 * Uses the built-in `node:test` runner with `fast-check` (see package.json).
 */

const test = require("node:test");
const assert = require("node:assert");
const fc = require("fast-check");

const { parseTraceEvents } = require("./traceParser");

/**
 * Build a small block tree whose ids are exactly `ids` (a `program` root plus
 * one child per id). The root id is included so generated events can reference
 * any of them.
 */
function makeBlockTree(ids) {
  const [rootId, ...childIds] = ids;
  return {
    id: rootId,
    type: "program",
    parentId: null,
    children: childIds.map((id) => ({
      id,
      type: "block",
      parentId: rootId,
      children: [],
    })),
  };
}

/**
 * Generator for a raw NDJSON event stream of varying length together with the
 * block tree whose ids the events reference and the stepCap to apply.
 *
 * The stream is intentionally noisy: blank lines, malformed JSON, and events
 * referencing unknown block ids are interleaved so that the parser's
 * line-count, valid-event-count, and stored-step-count all diverge. The
 * property holds regardless because it is stated purely in terms of the
 * parser's returned `steps`/`totalSteps`.
 */
const scenarioArb = fc
  .record({
    // Distinct, non-empty block ids; first one is the program root.
    ids: fc.uniqueArray(
      fc.string({ minLength: 1, maxLength: 6 }).filter((s) => s.trim().length > 0),
      { minLength: 1, maxLength: 5 }
    ),
    stepCap: fc.integer({ min: 1, max: 50 }),
    // Each line is one of: a valid event, an unknown-blockId event, malformed
    // text, or a blank line.
    lines: fc.array(
      fc.oneof(
        { weight: 6, arbitrary: fc.constant({ kind: "valid" }) },
        { weight: 1, arbitrary: fc.constant({ kind: "unknown" }) },
        { weight: 1, arbitrary: fc.constant({ kind: "malformed" }) },
        { weight: 1, arbitrary: fc.constant({ kind: "blank" }) }
      ),
      { minLength: 0, maxLength: 120 }
    ),
  })
  .map(({ ids, stepCap, lines }) => {
    const validIds = ids;
    const rendered = lines.map((line, i) => {
      switch (line.kind) {
        case "valid": {
          const blockId = validIds[i % validIds.length];
          return JSON.stringify({ blockId, line: i + 1, kind: "step", vars: [] });
        }
        case "unknown":
          return JSON.stringify({ blockId: "\u0000__not_a_real_id__", line: i + 1, kind: "step" });
        case "malformed":
          return "{ this is not json ";
        case "blank":
        default:
          return "";
      }
    });
    return {
      rawEvents: rendered.join("\n"),
      blockTree: makeBlockTree(ids),
      stepCap,
    };
  });

test("Property 5: step count never exceeds the cap (Validates: Requirements 3.4)", () => {
  fc.assert(
    fc.property(scenarioArb, ({ rawEvents, blockTree, stepCap }) => {
      const { steps } = parseTraceEvents(rawEvents, blockTree, stepCap);
      assert.ok(
        steps.length <= stepCap,
        `expected steps.length (${steps.length}) <= stepCap (${stepCap})`
      );
    })
  );
});

test("Property 5: truncated <=> totalSteps > stepCap (Validates: Requirements 3.4)", () => {
  fc.assert(
    fc.property(scenarioArb, ({ rawEvents, blockTree, stepCap }) => {
      const { steps, totalSteps } = parseTraceEvents(rawEvents, blockTree, stepCap);

      // `truncated` as the route derives it from the parser output.
      const truncated = totalSteps > stepCap;
      // Truncation observed in the result: some valid events were not stored.
      const stepsWereDropped = steps.length < totalSteps;

      assert.strictEqual(
        truncated,
        stepsWereDropped,
        `truncated (${truncated}) must match steps-dropped (${stepsWereDropped}); ` +
          `totalSteps=${totalSteps}, steps.length=${steps.length}, stepCap=${stepCap}`
      );

      // When not truncated, every counted step is stored; when truncated, the
      // stored count is exactly the cap.
      assert.strictEqual(steps.length, Math.min(totalSteps, stepCap));
    })
  );
});
