/**
 * Property-based test for block tree containment (task 2.3).
 *
 * Property 1: Containment — every non-root block's `sourceRange` is fully
 * contained within its parent's `sourceRange`.
 * **Validates: Requirements 2.3**
 *
 * Strategy: a fast-check generator builds an abstract tree of nested C++
 * constructs (loops / conditionals / generic blocks wrapping simple
 * statements), each rendered onto its own indented source lines so the nesting
 * is structurally faithful. The generated source is parsed by the real
 * `buildBlockTree`, and the resulting `BlockNode` tree is walked to assert that
 * for every parent → child edge the child's range sits inside the parent's.
 *
 * Generating valid nested source (rather than fabricating `BlockNode`s
 * directly) exercises the actual range-computation path in `buildBlockTree`,
 * so the property meaningfully validates Requirement 2.3 instead of merely
 * re-checking a hand-built tree.
 *
 * Uses the built-in `node:test` runner (see package.json "test" script) with
 * fast-check as the property engine.
 */

const test = require("node:test");
const assert = require("node:assert");
const fc = require("fast-check");

const { buildBlockTree } = require("./structuralPass");

/**
 * Position comparison helper: is position `a` at or before position `b`?
 * Positions are 1-based `{ line, col }` pairs.
 * @param {{line:number, col:number}} a
 * @param {{line:number, col:number}} b
 * @returns {boolean}
 */
function posLE(a, b) {
  if (a.line !== b.line) return a.line < b.line;
  return a.col <= b.col;
}

/**
 * Is `inner` fully contained within `outer`? Containment is checked with full
 * line+column precision: `outer.start <= inner.start` and
 * `inner.end <= outer.end`.
 * @param {import('./types').SourceRange} outer
 * @param {import('./types').SourceRange} inner
 * @returns {boolean}
 */
function rangeContains(outer, inner) {
  const outerStart = { line: outer.startLine, col: outer.startCol };
  const outerEnd = { line: outer.endLine, col: outer.endCol };
  const innerStart = { line: inner.startLine, col: inner.startCol };
  const innerEnd = { line: inner.endLine, col: inner.endCol };
  return posLE(outerStart, innerStart) && posLE(innerEnd, outerEnd);
}

/**
 * Walk the block tree, asserting containment for every parent → child edge.
 * @param {import('./types').BlockNode} node
 */
function assertContainment(node) {
  for (const child of node.children) {
    assert.ok(
      rangeContains(node.sourceRange, child.sourceRange),
      `child ${child.id} (${JSON.stringify(child.sourceRange)}) is not ` +
        `contained within parent ${node.id} ` +
        `(${JSON.stringify(node.sourceRange)})`
    );
    assertContainment(child);
  }
}

/**
 * Abstract statement-tree generator. A node is either a leaf simple statement
 * or a compound construct (loop / conditional / generic block) wrapping one or
 * more nested statements. `fc.letrec` bounds the recursion depth so generated
 * programs stay small and parseable.
 */
const { stmt } = fc.letrec((tie) => ({
  stmt: fc.oneof(
    { maxDepth: 4, depthSize: "small" },
    // Leaf: a simple assignment statement.
    fc.constant({ kind: "simple" }),
    // Compound constructs that introduce a nested block.
    fc.record({
      kind: fc.constantFrom("for", "while", "if", "block"),
      body: fc.array(tie("stmt"), { minLength: 1, maxLength: 3 }),
    })
  ),
}));

/**
 * Render an abstract statement node into indented C++ source lines.
 * @param {object} node - A generated statement node.
 * @param {number} indent - Current indentation depth (in 4-space units).
 * @returns {string[]} Source lines for this statement.
 */
function renderStmt(node, indent) {
  const pad = "    ".repeat(indent);
  if (node.kind === "simple") {
    return [`${pad}x = x + 1;`];
  }

  let header;
  switch (node.kind) {
    case "for":
      header = `${pad}for (int i = 0; i < 3; i++) {`;
      break;
    case "while":
      header = `${pad}while (x < 100) {`;
      break;
    case "if":
      header = `${pad}if (x < 50) {`;
      break;
    case "block":
    default:
      header = `${pad}{`;
      break;
  }

  const bodyLines = node.body.flatMap((child) => renderStmt(child, indent + 1));
  return [header, ...bodyLines, `${pad}}`];
}

/**
 * Render a full, compilable C++ program from a list of generated statements.
 * @param {object[]} stmts
 * @returns {string}
 */
function renderProgram(stmts) {
  const body = stmts.flatMap((s) => renderStmt(s, 1));
  return ["int main() {", "    int x = 0;", ...body, "    return 0;", "}"].join(
    "\n"
  );
}

/** A program is a non-empty list of top-level statements. */
const programArb = fc
  .array(stmt, { minLength: 1, maxLength: 4 })
  .map(renderProgram);

test("Property 1: every non-root block's range is contained within its parent's (cpp)", () => {
  fc.assert(
    fc.property(programArb, (code) => {
      const { blockTree } = buildBlockTree("cpp", code);

      // Root program node covers everything; verify all descendant edges.
      assert.strictEqual(blockTree.parentId, null);
      assertContainment(blockTree);
    }),
    { numRuns: 50 }
  );
});

test("Property 1: containment holds for deeply nested constructs (cpp)", () => {
  // Construct a single deep chain (for > while > if > block > simple) to
  // exercise containment across many levels with a fixed, known shape.
  const deep = {
    kind: "for",
    body: [
      {
        kind: "while",
        body: [
          {
            kind: "if",
            body: [{ kind: "block", body: [{ kind: "simple" }] }],
          },
        ],
      },
    ],
  };
  const code = renderProgram([deep]);
  const { blockTree } = buildBlockTree("cpp", code);
  assertContainment(blockTree);
});
