/**
 * Property-based tests for input tokenization and consumed-token linking
 * (task 3.6).
 *
 * Functions under test (judge/src/trace/traceParser.js):
 *   - tokenizeInput(input)
 *   - linkConsumedTokens(tokens, steps)
 *
 * Properties (Validates: Requirements 6.1, 6.2, 6.3):
 *   P1. tokenizeInput yields tokens with contiguous indices from 0 and every
 *       token's consumedAtStep is null (Requirement 6.1).
 *   P2. linkConsumedTokens links every consumed token to a valid step index and
 *       leaves never-read tokens with consumedAtStep === null
 *       (Requirements 6.2, 6.3).
 *
 * Uses the built-in `node:test` runner with fast-check (see package.json).
 */

const test = require("node:test");
const assert = require("node:assert");
const fc = require("fast-check");

const { tokenizeInput, linkConsumedTokens } = require("./traceParser");

// A single whitespace-separated unit: non-empty, contains no whitespace.
const unitArb = fc
  .array(fc.constantFrom(..."abcXYZ0129_-+"), { minLength: 1, maxLength: 6 })
  .map((chars) => chars.join(""));

// A run of whitespace used to separate / pad units in a generated input.
const wsArb = fc.constantFrom(" ", "  ", "\t", "\n", "\r\n", " \t ", "\n  ");

/**
 * Build an input string from a list of units interleaved with random
 * whitespace (including optional leading/trailing whitespace). Because units
 * never contain whitespace, the expected token count equals `units.length`.
 */
const inputArb = fc
  .record({
    units: fc.array(unitArb, { minLength: 0, maxLength: 12 }),
    leading: fc.option(wsArb, { nil: "" }),
    trailing: fc.option(wsArb, { nil: "" }),
    seps: fc.array(wsArb, { minLength: 0, maxLength: 12 }),
  })
  .map(({ units, leading, trailing, seps }) => {
    let s = leading;
    units.forEach((u, i) => {
      s += u;
      if (i < units.length - 1) {
        s += seps[i] || " ";
      }
    });
    s += trailing;
    return { input: s, expectedCount: units.length };
  });

test("P1: tokenizeInput yields contiguous indices from 0 with null consumedAtStep", () => {
  fc.assert(
    fc.property(inputArb, ({ input, expectedCount }) => {
      const tokens = tokenizeInput(input);

      // Count matches the whitespace-separated units.
      assert.strictEqual(tokens.length, expectedCount);

      tokens.forEach((tok, i) => {
        // Contiguous indices starting at 0 (Requirement 6.1).
        assert.strictEqual(tok.index, i);
        // Initially unlinked (Requirement 6.1 / 6.3).
        assert.strictEqual(tok.consumedAtStep, null);
        // Raw text is a real, whitespace-free token.
        assert.ok(typeof tok.raw === "string" && tok.raw.length > 0);
        assert.ok(!/\s/.test(tok.raw));
      });
    }),
  );
});

// A step carrying an optional inputConsumed payload. Index is assigned
// positionally (contiguous from 0) by the test to mirror parsed steps.
const consumedPayloadArb = fc.option(
  fc.array(unitArb, { minLength: 0, maxLength: 4 }).chain((units) =>
    fc.array(wsArb, { minLength: Math.max(0, units.length - 1), maxLength: Math.max(0, units.length) }).map((seps) =>
      units.map((u, i) => (i < units.length - 1 ? u + (seps[i] || " ") : u)).join(""),
    ),
  ),
  { nil: null },
);

const stepsArb = fc.array(consumedPayloadArb, { minLength: 0, maxLength: 10 }).map((payloads) =>
  payloads.map((inputConsumed, index) => {
    const step = { index, blockId: `b${index}`, line: index + 1, kind: "read", vars: [] };
    if (inputConsumed != null) {
      step.inputConsumed = inputConsumed;
    }
    return step;
  }),
);

test("P2: linkConsumedTokens links consumed tokens to valid step indices; unread tokens stay null", () => {
  fc.assert(
    fc.property(inputArb, stepsArb, ({ input }, steps) => {
      const tokens = tokenizeInput(input);
      const linked = linkConsumedTokens(tokens, steps);

      const validStepIndices = new Set(steps.map((s) => s.index));

      // Structure preserved: same length, indices, and raw values.
      assert.strictEqual(linked.length, tokens.length);
      linked.forEach((tok, i) => {
        assert.strictEqual(tok.index, i);
        assert.strictEqual(tok.raw, tokens[i].raw);
      });

      // Expected number of consumed tokens: total units read by steps (in
      // order), capped at the number of available tokens.
      let totalUnits = 0;
      for (const step of steps) {
        if (step.inputConsumed != null) {
          totalUnits += String(step.inputConsumed)
            .split(/\s+/)
            .filter((u) => u.length > 0).length;
        }
      }
      const expectedConsumed = Math.min(totalUnits, tokens.length);

      let consumedCount = 0;
      let lastConsumedStep = -Infinity;
      let seenNull = false;

      linked.forEach((tok) => {
        if (tok.consumedAtStep === null) {
          seenNull = true;
          return;
        }
        consumedCount += 1;

        // Consumption is a prefix: once a null appears, no later token may be
        // consumed (tokens are read sequentially in index order).
        assert.strictEqual(seenNull, false);

        // Every consumed token references a real step index (Requirement 6.2).
        assert.ok(
          validStepIndices.has(tok.consumedAtStep),
          `consumedAtStep ${tok.consumedAtStep} is not a valid step index`,
        );

        // consumedAtStep is non-decreasing with token index.
        assert.ok(tok.consumedAtStep >= lastConsumedStep);
        lastConsumedStep = tok.consumedAtStep;
      });

      // Exactly the expected count is consumed; the rest stay null (Req 6.3).
      assert.strictEqual(consumedCount, expectedConsumed);
    }),
  );
});

test("P2 edge: no steps leaves every token unconsumed (consumedAtStep null)", () => {
  fc.assert(
    fc.property(inputArb, ({ input }) => {
      const tokens = tokenizeInput(input);
      const linked = linkConsumedTokens(tokens, []);
      assert.strictEqual(linked.length, tokens.length);
      linked.forEach((tok) => assert.strictEqual(tok.consumedAtStep, null));
    }),
  );
});
