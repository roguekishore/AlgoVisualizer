/**
 * Unit tests for `buildBlockTree` and `mapGrammarType` (task 2.5).
 *
 * Covers each `BlockType` for both C++ and Java, asserting:
 *   - tree shape (nesting, parent/child wiring),
 *   - 1-based source ranges with `startLine <= endLine` and containment,
 *   - exactly one `program` root with `parentId === null`,
 *   - `SourceMap` ordering (outermost → innermost) on nested-loop / if-else /
 *     call / I/O fixtures.
 *
 * Uses the built-in `node:test` runner (see package.json "test" script).
 * The leaf-utility tests live in `structuralPass.helpers.test.js`; this file
 * focuses on the recursive descent and is intentionally separate so the two
 * sub-tasks do not clobber one another.
 */

const test = require("node:test");
const assert = require("node:assert");

const {
  buildBlockTree,
  mapGrammarType,
  ParseError,
} = require("./structuralPass");

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

/** Depth-first flatten of every BlockNode in the tree (root included). */
function flatten(node, out = []) {
  out.push(node);
  for (const child of node.children) flatten(child, out);
  return out;
}

/** All blocks of a given BlockType across the whole tree. */
function blocksOfType(tree, type) {
  return flatten(tree).filter((n) => n.type === type);
}

/** True when range `inner` is fully contained within range `outer`. */
function isContained(inner, outer) {
  const startsAfter =
    inner.startLine > outer.startLine ||
    (inner.startLine === outer.startLine && inner.startCol >= outer.startCol);
  const endsBefore =
    inner.endLine < outer.endLine ||
    (inner.endLine === outer.endLine && inner.endCol <= outer.endCol);
  return startsAfter && endsBefore;
}

/** Map of id → node for the whole tree. */
function indexById(tree) {
  const map = new Map();
  for (const n of flatten(tree)) map.set(n.id, n);
  return map;
}

/**
 * Generic structural invariants every well-formed tree must satisfy.
 * Asserts: single program root, unique ids, 1-based ranges, containment,
 * and parent/child wiring consistency.
 */
function assertTreeInvariants(tree) {
  const all = flatten(tree);
  const byId = indexById(tree);

  // Exactly one program root, with parentId === null, id "b0".
  const programs = all.filter((n) => n.type === "program");
  assert.strictEqual(programs.length, 1, "exactly one program node");
  assert.strictEqual(tree.type, "program", "root is the program node");
  assert.strictEqual(tree.parentId, null, "program root has null parentId");
  assert.strictEqual(tree.id, "b0", "program root id is b0");

  // Unique ids.
  const ids = all.map((n) => n.id);
  assert.strictEqual(new Set(ids).size, ids.length, "all ids are unique");

  for (const node of all) {
    // 1-based ranges with startLine <= endLine.
    assert.ok(node.sourceRange.startLine >= 1, `${node.id} startLine 1-based`);
    assert.ok(node.sourceRange.startCol >= 1, `${node.id} startCol 1-based`);
    assert.ok(
      node.sourceRange.startLine <= node.sourceRange.endLine,
      `${node.id} startLine <= endLine`
    );

    // Non-empty label.
    assert.ok(
      typeof node.label === "string" && node.label.length > 0,
      `${node.id} has a non-empty label`
    );

    if (node.parentId !== null) {
      const parent = byId.get(node.parentId);
      assert.ok(parent, `${node.id} parent ${node.parentId} exists`);
      // Containment within parent.
      assert.ok(
        isContained(node.sourceRange, parent.sourceRange),
        `${node.id} range contained within parent ${node.parentId}`
      );
      // Parent actually lists this node as a child.
      assert.ok(
        parent.children.some((c) => c.id === node.id),
        `${node.id} is listed among parent ${node.parentId}'s children`
      );
    }
  }
}

/** True when `ancestorId` is an ancestor of `nodeId` in the tree. */
function isAncestor(byId, ancestorId, nodeId) {
  let cur = byId.get(nodeId);
  while (cur && cur.parentId !== null) {
    if (cur.parentId === ancestorId) return true;
    cur = byId.get(cur.parentId);
  }
  return false;
}

/**
 * Assert the SourceMap is well-formed: each chain starts at the program root
 * (b0), references only existing ids, and is ordered outermost → innermost.
 *
 * "Outermost → innermost" means ancestors always precede their descendants in
 * the chain. Two sibling blocks may legitimately cover the same line (e.g. a
 * C++ for-loop's `int i = 0` init declaration and the loop body's
 * `compound_statement` both begin on the loop header line) without one
 * containing the other, so we assert ancestor-precedence rather than
 * consecutive containment.
 */
function assertSourceMapOrdering(tree, sourceMap) {
  const byId = indexById(tree);
  for (const [line, chain] of Object.entries(sourceMap)) {
    assert.ok(chain.length >= 1, `line ${line} chain non-empty`);
    assert.strictEqual(chain[0], "b0", `line ${line} chain starts at b0`);
    for (let i = 0; i < chain.length; i += 1) {
      assert.ok(byId.has(chain[i]), `line ${line} id ${chain[i]} exists`);
      // A later entry must never be an ancestor of an earlier one
      // (ancestors precede descendants → outermost → innermost).
      for (let j = i + 1; j < chain.length; j += 1) {
        assert.ok(
          !isAncestor(byId, chain[j], chain[i]),
          `line ${line}: ${chain[j]} (ancestor) must precede descendant ${chain[i]}`
        );
      }
    }
  }
}

// ──────────────────────────────────────────────────────────────────────────
// mapGrammarType — one assertion per BlockType, both languages
// ──────────────────────────────────────────────────────────────────────────

test("mapGrammarType covers every BlockType for C++", () => {
  const expected = {
    program: "translation_unit",
    function: "function_definition",
    loop: "for_statement",
    conditional: "if_statement",
    declaration: "declaration",
    assignment: "assignment_expression",
    call: "call_expression",
    return: "return_statement",
    block: "compound_statement",
  };
  for (const [blockType, grammarType] of Object.entries(expected)) {
    assert.strictEqual(
      mapGrammarType("cpp", grammarType),
      blockType,
      `cpp ${grammarType} → ${blockType}`
    );
  }
});

test("mapGrammarType covers every BlockType for Java", () => {
  const expected = {
    program: "program",
    function: "method_declaration",
    loop: "for_statement",
    conditional: "if_statement",
    declaration: "local_variable_declaration",
    assignment: "assignment_expression",
    call: "method_invocation",
    return: "return_statement",
    block: "block",
  };
  for (const [blockType, grammarType] of Object.entries(expected)) {
    assert.strictEqual(
      mapGrammarType("java", grammarType),
      blockType,
      `java ${grammarType} → ${blockType}`
    );
  }
});

// ──────────────────────────────────────────────────────────────────────────
// buildBlockTree — parse failure
// ──────────────────────────────────────────────────────────────────────────

test("buildBlockTree throws ParseError for an unsupported language", () => {
  assert.throws(() => buildBlockTree("python", "print(1)"), ParseError);
});

test("buildBlockTree handles empty source by producing a lone program root", () => {
  const { blockTree, sourceMap } = buildBlockTree("cpp", "");
  assert.strictEqual(blockTree.type, "program");
  assert.strictEqual(blockTree.parentId, null);
  assert.strictEqual(blockTree.id, "b0");
  // No nested constructs in empty source.
  assert.strictEqual(blockTree.children.length, 0);
  // Any registered lines still start at the program root.
  for (const chain of Object.values(sourceMap)) {
    assert.strictEqual(chain[0], "b0");
  }
});

// ──────────────────────────────────────────────────────────────────────────
// C++ fixtures
// ──────────────────────────────────────────────────────────────────────────

test("buildBlockTree (C++) nested-loop fixture: tree shape, ranges, source-map ordering", () => {
  const code = [
    "#include <iostream>",            // 1
    "using namespace std;",           // 2
    "int main() {",                   // 3
    "  int sum = 0;",                 // 4
    "  for (int i = 0; i < 3; i++) {",// 5
    "    for (int j = 0; j < 3; j++) {", // 6
    "      sum = sum + 1;",           // 7
    "    }",                          // 8
    "  }",                            // 9
    "  return sum;",                  // 10
    "}",                              // 11
  ].join("\n");

  const { blockTree, sourceMap } = buildBlockTree("cpp", code);
  assertTreeInvariants(blockTree);
  assertSourceMapOrdering(blockTree, sourceMap);

  // One function (main).
  const functions = blocksOfType(blockTree, "function");
  assert.strictEqual(functions.length, 1, "single function block");
  assert.strictEqual(functions[0].sourceRange.startLine, 3);
  assert.strictEqual(functions[0].sourceRange.endLine, 11);

  // Two loops, the inner nested within the outer.
  const loops = blocksOfType(blockTree, "loop");
  assert.strictEqual(loops.length, 2, "two loop blocks");
  const outer = loops.find((l) => l.sourceRange.startLine === 5);
  const inner = loops.find((l) => l.sourceRange.startLine === 6);
  assert.ok(outer && inner, "found outer (line 5) and inner (line 6) loops");
  assert.ok(
    isContained(inner.sourceRange, outer.sourceRange),
    "inner loop contained within outer loop"
  );

  // A declaration (int sum = 0) and a return.
  assert.ok(blocksOfType(blockTree, "declaration").length >= 1, "has declaration");
  assert.ok(blocksOfType(blockTree, "return").length >= 1, "has return");

  // SourceMap on the innermost line (7) is ordered program → main → outer → inner.
  const chain7 = sourceMap[7];
  assert.strictEqual(chain7[0], "b0");
  const idxOuter = chain7.indexOf(outer.id);
  const idxInner = chain7.indexOf(inner.id);
  assert.ok(idxOuter > 0 && idxInner > idxOuter, "outer precedes inner on line 7");
  // The innermost-covering block is the deepest in the tree; it must appear
  // after every one of its ancestors present in the chain.
  const byId = indexById(blockTree);
  assert.ok(
    isAncestor(byId, outer.id, inner.id),
    "outer loop is an ancestor of the inner loop"
  );
});

test("buildBlockTree (C++) if-else fixture: conditional blocks", () => {
  const code = [
    "int main() {",        // 1
    "  int x = 5;",        // 2
    "  if (x > 0) {",      // 3
    "    x = 1;",          // 4
    "  } else {",          // 5
    "    x = 2;",          // 6
    "  }",                 // 7
    "  return 0;",         // 8
    "}",                   // 9
  ].join("\n");

  const { blockTree, sourceMap } = buildBlockTree("cpp", code);
  assertTreeInvariants(blockTree);
  assertSourceMapOrdering(blockTree, sourceMap);

  const conditionals = blocksOfType(blockTree, "conditional");
  assert.ok(conditionals.length >= 1, "has a conditional block");
  const ifBlock = conditionals.find((c) => c.sourceRange.startLine === 3);
  assert.ok(ifBlock, "if starts on line 3");
  // The else branch is part of the if_statement span.
  assert.ok(ifBlock.sourceRange.endLine >= 7, "if-statement spans through else");

  // Assignments inside both branches.
  assert.ok(blocksOfType(blockTree, "assignment").length >= 2, "two assignments");
});

test("buildBlockTree (C++) call + I/O fixture: classifies cin/cout as io", () => {
  const code = [
    "#include <iostream>",       // 1
    "using namespace std;",      // 2
    "int add(int a, int b) {",   // 3
    "  return a + b;",           // 4
    "}",                         // 5
    "int main() {",              // 6
    "  int n;",                  // 7
    "  cin >> n;",               // 8
    "  int r = add(n, 1);",      // 9
    "  cout << r << endl;",      // 10
    "  return 0;",               // 11
    "}",                         // 12
  ].join("\n");

  const { blockTree, sourceMap } = buildBlockTree("cpp", code);
  assertTreeInvariants(blockTree);
  assertSourceMapOrdering(blockTree, sourceMap);

  // Two functions: add and main.
  assert.strictEqual(blocksOfType(blockTree, "function").length, 2, "two functions");

  // I/O blocks for cin and cout.
  const io = blocksOfType(blockTree, "io");
  assert.ok(
    io.some((b) => b.sourceRange.startLine === 8),
    "cin >> n classified as io (line 8)"
  );
  assert.ok(
    io.some((b) => b.sourceRange.startLine === 10),
    "cout << r classified as io (line 10)"
  );

  // A call block for add(n, 1).
  const calls = blocksOfType(blockTree, "call");
  assert.ok(
    calls.some((b) => b.sourceRange.startLine === 9),
    "add(n, 1) classified as call (line 9)"
  );
});

// ──────────────────────────────────────────────────────────────────────────
// Java fixtures
// ──────────────────────────────────────────────────────────────────────────

test("buildBlockTree (Java) nested-loop fixture: tree shape, ranges, source-map ordering", () => {
  const code = [
    "public class Main {",               // 1
    "  public static void main(String[] args) {", // 2
    "    int sum = 0;",                  // 3
    "    for (int i = 0; i < 3; i++) {", // 4
    "      for (int j = 0; j < 3; j++) {", // 5
    "        sum = sum + 1;",            // 6
    "      }",                           // 7
    "    }",                             // 8
    "    return;",                       // 9
    "  }",                               // 10
    "}",                                 // 11
  ].join("\n");

  const { blockTree, sourceMap } = buildBlockTree("java", code);
  assertTreeInvariants(blockTree);
  assertSourceMapOrdering(blockTree, sourceMap);

  // The main method.
  const functions = blocksOfType(blockTree, "function");
  assert.strictEqual(functions.length, 1, "single method block");

  // Two loops nested.
  const loops = blocksOfType(blockTree, "loop");
  assert.strictEqual(loops.length, 2, "two loop blocks");
  const outer = loops.find((l) => l.sourceRange.startLine === 4);
  const inner = loops.find((l) => l.sourceRange.startLine === 5);
  assert.ok(outer && inner, "found outer (line 4) and inner (line 5) loops");
  assert.ok(
    isContained(inner.sourceRange, outer.sourceRange),
    "inner loop contained within outer loop"
  );

  assert.ok(blocksOfType(blockTree, "declaration").length >= 1, "has declaration");
  assert.ok(blocksOfType(blockTree, "return").length >= 1, "has return");

  // SourceMap on innermost line (6): outer precedes inner.
  const chain6 = sourceMap[6];
  const idxOuter = chain6.indexOf(outer.id);
  const idxInner = chain6.indexOf(inner.id);
  assert.ok(idxOuter > 0 && idxInner > idxOuter, "outer precedes inner on line 6");
});

test("buildBlockTree (Java) if-else fixture: conditional blocks", () => {
  const code = [
    "public class Main {",                 // 1
    "  public static void main(String[] a) {", // 2
    "    int x = 5;",                      // 3
    "    if (x > 0) {",                    // 4
    "      x = 1;",                        // 5
    "    } else {",                        // 6
    "      x = 2;",                        // 7
    "    }",                               // 8
    "  }",                                 // 9
    "}",                                   // 10
  ].join("\n");

  const { blockTree, sourceMap } = buildBlockTree("java", code);
  assertTreeInvariants(blockTree);
  assertSourceMapOrdering(blockTree, sourceMap);

  const conditionals = blocksOfType(blockTree, "conditional");
  assert.ok(conditionals.length >= 1, "has a conditional block");
  const ifBlock = conditionals.find((c) => c.sourceRange.startLine === 4);
  assert.ok(ifBlock, "if starts on line 4");
  assert.ok(ifBlock.sourceRange.endLine >= 8, "if-statement spans through else");

  assert.ok(blocksOfType(blockTree, "assignment").length >= 2, "two assignments");
});

test("buildBlockTree (Java) call + I/O fixture: classifies Scanner/System.out as io", () => {
  const code = [
    "import java.util.Scanner;",                    // 1
    "public class Main {",                          // 2
    "  static int add(int a, int b) {",             // 3
    "    return a + b;",                            // 4
    "  }",                                          // 5
    "  public static void main(String[] args) {",   // 6
    "    Scanner sc = new Scanner(System.in);",     // 7
    "    int n = sc.nextInt();",                    // 8
    "    int r = add(n, 1);",                       // 9
    "    System.out.println(r);",                   // 10
    "  }",                                          // 11
    "}",                                            // 12
  ].join("\n");

  const { blockTree, sourceMap } = buildBlockTree("java", code);
  assertTreeInvariants(blockTree);
  assertSourceMapOrdering(blockTree, sourceMap);

  // Two methods: add and main.
  assert.strictEqual(blocksOfType(blockTree, "function").length, 2, "two methods");

  // I/O blocks: sc.nextInt() (read) and System.out.println (write).
  const io = blocksOfType(blockTree, "io");
  assert.ok(
    io.some((b) => b.sourceRange.startLine === 8),
    "sc.nextInt() classified as io (line 8)"
  );
  assert.ok(
    io.some((b) => b.sourceRange.startLine === 10),
    "System.out.println classified as io (line 10)"
  );

  // A call block for add(n, 1).
  const calls = blocksOfType(blockTree, "call");
  assert.ok(
    calls.some((b) => b.sourceRange.startLine === 9),
    "add(n, 1) classified as call (line 9)"
  );
});

// ──────────────────────────────────────────────────────────────────────────
// SourceMap: single-root coverage of every line
// ──────────────────────────────────────────────────────────────────────────

test("buildBlockTree: every covered line's chain begins at the single program root", () => {
  const code = [
    "int main() {", // 1
    "  int x = 0;", // 2
    "  return x;",  // 3
    "}",            // 4
  ].join("\n");

  const { blockTree, sourceMap } = buildBlockTree("cpp", code);
  assertTreeInvariants(blockTree);
  for (const [line, chain] of Object.entries(sourceMap)) {
    assert.strictEqual(chain[0], "b0", `line ${line} starts at program root`);
  }
});
