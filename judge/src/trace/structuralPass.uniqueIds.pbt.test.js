/**
 * Property-based test for the static structural pass (task 2.4).
 *
 *   Property 2: Unique IDs — all block ids are unique across the tree.
 *   **Validates: Requirements 2.2**
 *
 * Strategy: rather than fabricate `BlockNode` trees directly (which would test a
 * hand-written generator instead of the real code), we drive the actual
 * `buildBlockTree` implementation with randomly generated *valid* source
 * programs. A smart, recursive generator emits syntactically valid C++ and Java
 * snippets composed of the constructs the structural pass recognizes (loops,
 * conditionals, declarations, assignments, calls, I/O, returns, nested blocks),
 * so the generated input space stays inside "parseable program" while still
 * exercising deep nesting and repetition (the situations most likely to collide
 * ids).
 *
 * Uses fast-check (dev dependency) with the built-in `node:test` runner.
 */

const test = require("node:test");
const assert = require("node:assert");
const fc = require("fast-check");

const { buildBlockTree } = require("./structuralPass");

/**
 * Collect every block id in the tree via DFS.
 * @param {import('./types').BlockNode} node
 * @param {string[]} [acc]
 * @returns {string[]}
 */
function collectIds(node, acc = []) {
  if (!node) return acc;
  acc.push(node.id);
  for (const child of node.children || []) {
    collectIds(child, acc);
  }
  return acc;
}

/**
 * Build a fast-check generator of valid statements for a given language.
 * Returns code fragments (already indented-agnostic; the test joins with
 * newlines) that the structural pass maps to recognized block types.
 *
 * @param {"cpp"|"java"} language
 */
function statementArb(language) {
  // A simple expression-ish leaf used inside generated statements. Constrained
  // to a small identifier/number space to keep programs valid and compact.
  const ident = fc
    .integer({ min: 0, max: 8 })
    .map((n) => `v${n}`);
  const intLit = fc.integer({ min: 0, max: 9 }).map(String);

  return fc.letrec((tie) => ({
    // Leaf statements (no nested blocks).
    declaration: fc
      .tuple(ident, intLit)
      .map(([id, n]) => `int ${id} = ${n};`),
    assignment: fc
      .tuple(ident, intLit)
      .map(([id, n]) => `${id} = ${n};`),
    io:
      language === "cpp"
        ? ident.map((id) => `cout << ${id};`)
        : ident.map((id) => `System.out.println(${id});`),
    call:
      language === "cpp"
        ? ident.map((id) => `foo(${id});`)
        : ident.map((id) => `foo(${id});`),
    ret: intLit.map((n) => `return ${n};`),

    // Compound statements (may nest other statements). Depth is bounded by
    // fast-check's size of the inner array plus letrec's depth handling.
    loop: fc
      .array(tie("stmt"), { minLength: 0, maxLength: 3 })
      .map(
        (body) =>
          `for (int i = 0; i < 3; i++) {\n${body.join("\n")}\n}`
      ),
    conditional: fc
      .tuple(
        fc.array(tie("stmt"), { minLength: 0, maxLength: 2 }),
        fc.array(tie("stmt"), { minLength: 0, maxLength: 2 })
      )
      .map(
        ([thenB, elseB]) =>
          `if (v0 < 3) {\n${thenB.join("\n")}\n} else {\n${elseB.join(
            "\n"
          )}\n}`
      ),
    block: fc
      .array(tie("stmt"), { minLength: 0, maxLength: 3 })
      .map((body) => `{\n${body.join("\n")}\n}`),

    // Any statement.
    stmt: fc.oneof(
      { depthSize: "small", withCrossShrink: true },
      tie("declaration"),
      tie("assignment"),
      tie("io"),
      tie("call"),
      tie("ret"),
      tie("loop"),
      tie("conditional"),
      tie("block")
    ),
  })).stmt;
}

/**
 * Wrap a list of generated statements into a full, parseable program for the
 * given language.
 * @param {"cpp"|"java"} language
 * @param {string[]} statements
 * @returns {string}
 */
function wrapProgram(language, statements) {
  const body = statements.join("\n");
  if (language === "cpp") {
    return `#include <iostream>\nusing namespace std;\nint foo(int x){ return x; }\nint main() {\nint v0 = 0;\n${body}\nreturn 0;\n}`;
  }
  return `public class Main {\n  static int foo(int x){ return x; }\n  public static void main(String[] args) {\n    int v0 = 0;\n${body}\n  }\n}`;
}

for (const language of ["cpp", "java"]) {
  test(`Property 2: block ids are unique across the tree (${language})`, () => {
    fc.assert(
      fc.property(
        fc.array(statementArb(language), { minLength: 0, maxLength: 6 }),
        (statements) => {
          const code = wrapProgram(language, statements);
          const { blockTree } = buildBlockTree(language, code);
          const ids = collectIds(blockTree);
          const unique = new Set(ids);
          // Property 2: every id appears exactly once across the whole tree.
          assert.strictEqual(
            unique.size,
            ids.length,
            `duplicate block id(s) found in ${language} tree`
          );
        }
      ),
      { numRuns: 50 }
    );
  });
}
