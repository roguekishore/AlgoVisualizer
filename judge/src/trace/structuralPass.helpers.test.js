/**
 * Unit tests for the structural-pass leaf helpers (task 2.1):
 *   - mapGrammarType
 *   - makeLabel
 *   - rangeOf
 *
 * Uses the built-in `node:test` runner (see package.json "test" script).
 * Tests for `buildBlockTree` itself live in task 2.5's test file.
 */

const test = require("node:test");
const assert = require("node:assert");
const Parser = require("tree-sitter");
const Cpp = require("tree-sitter-cpp");
const Java = require("tree-sitter-java");

const { mapGrammarType, makeLabel, rangeOf } = require("./structuralPass");

function parse(language, code) {
  const p = new Parser();
  p.setLanguage(language === "java" ? Java : Cpp);
  return p.parse(code);
}

test("mapGrammarType maps C++ block node types", () => {
  assert.strictEqual(mapGrammarType("cpp", "translation_unit"), "program");
  assert.strictEqual(mapGrammarType("cpp", "function_definition"), "function");
  assert.strictEqual(mapGrammarType("cpp", "for_statement"), "loop");
  assert.strictEqual(mapGrammarType("cpp", "for_range_loop"), "loop");
  assert.strictEqual(mapGrammarType("cpp", "while_statement"), "loop");
  assert.strictEqual(mapGrammarType("cpp", "do_statement"), "loop");
  assert.strictEqual(mapGrammarType("cpp", "if_statement"), "conditional");
  assert.strictEqual(mapGrammarType("cpp", "switch_statement"), "conditional");
  assert.strictEqual(mapGrammarType("cpp", "declaration"), "declaration");
  assert.strictEqual(mapGrammarType("cpp", "assignment_expression"), "assignment");
  assert.strictEqual(mapGrammarType("cpp", "call_expression"), "call");
  assert.strictEqual(mapGrammarType("cpp", "return_statement"), "return");
  assert.strictEqual(mapGrammarType("cpp", "compound_statement"), "block");
});

test("mapGrammarType maps Java block node types", () => {
  assert.strictEqual(mapGrammarType("java", "program"), "program");
  assert.strictEqual(mapGrammarType("java", "method_declaration"), "function");
  assert.strictEqual(mapGrammarType("java", "constructor_declaration"), "function");
  assert.strictEqual(mapGrammarType("java", "for_statement"), "loop");
  assert.strictEqual(mapGrammarType("java", "enhanced_for_statement"), "loop");
  assert.strictEqual(mapGrammarType("java", "while_statement"), "loop");
  assert.strictEqual(mapGrammarType("java", "do_statement"), "loop");
  assert.strictEqual(mapGrammarType("java", "if_statement"), "conditional");
  assert.strictEqual(mapGrammarType("java", "switch_expression"), "conditional");
  assert.strictEqual(mapGrammarType("java", "local_variable_declaration"), "declaration");
  assert.strictEqual(mapGrammarType("java", "assignment_expression"), "assignment");
  assert.strictEqual(mapGrammarType("java", "method_invocation"), "call");
  assert.strictEqual(mapGrammarType("java", "return_statement"), "return");
  assert.strictEqual(mapGrammarType("java", "block"), "block");
});

test("mapGrammarType returns null for non-block nodes and cross-language types", () => {
  assert.strictEqual(mapGrammarType("cpp", "identifier"), null);
  assert.strictEqual(mapGrammarType("cpp", "number_literal"), null);
  assert.strictEqual(mapGrammarType("java", "type_identifier"), null);
  // A node type belonging to the other grammar is not recognized.
  assert.strictEqual(mapGrammarType("java", "translation_unit"), null);
  assert.strictEqual(mapGrammarType("cpp", "method_invocation"), null);
  // Empty / missing input.
  assert.strictEqual(mapGrammarType("cpp", ""), null);
  assert.strictEqual(mapGrammarType("cpp", undefined), null);
});

test("rangeOf produces 1-based ranges with startLine <= endLine", () => {
  const code = "int main(){\n  for (int i = 0; i < 5; i++) {\n    x++;\n  }\n}";
  const tree = parse("cpp", code);
  const fn = tree.rootNode.namedChild(0);
  const loop = fn.namedChild(2).namedChild(0); // compound_statement -> for_statement

  const r = rangeOf(loop);
  assert.strictEqual(r.startLine, 2);
  assert.strictEqual(r.endLine, 4);
  assert.ok(r.startLine >= 1 && r.startCol >= 1);
  assert.ok(r.startLine <= r.endLine);

  const root = rangeOf(tree.rootNode);
  assert.strictEqual(root.startLine, 1);
  assert.ok(root.startLine <= root.endLine);
});

test("rangeOf normalizes inverted positions defensively", () => {
  const inverted = {
    startPosition: { row: 5, column: 3 },
    endPosition: { row: 2, column: 1 },
  };
  const r = rangeOf(inverted);
  assert.ok(r.startLine <= r.endLine);
});

test("makeLabel uses fixed labels for program and block", () => {
  const tree = parse("cpp", "int main(){}");
  assert.strictEqual(makeLabel("program", tree.rootNode, "int main(){}"), "program");
  const fn = tree.rootNode.namedChild(0);
  const compound = fn.namedChild(2);
  assert.strictEqual(makeLabel("block", compound, "int main(){}"), "block");
});

test("makeLabel condenses a construct to a single line", () => {
  const code = "int main(){\n  for (int i = 0; i < 5; i++) {\n    x++;\n  }\n}";
  const tree = parse("cpp", code);
  const fn = tree.rootNode.namedChild(0);
  const loop = fn.namedChild(2).namedChild(0);
  const label = makeLabel("loop", loop, code);
  assert.ok(label.startsWith("for (int i = 0; i < 5; i++)"));
  assert.ok(!label.includes("\n"));
});

test("makeLabel falls back to code slice when node text is unavailable", () => {
  const code = "int x = 5;";
  const label = makeLabel("declaration", { startIndex: 0, endIndex: 10 }, code);
  assert.strictEqual(label, "int x = 5");
});

test("makeLabel truncates overly long labels", () => {
  const label = makeLabel("call", { text: "a".repeat(200) }, "");
  assert.ok(label.length <= 80);
  assert.ok(label.endsWith("…"));
});

test("makeLabel falls back to the type when no text is derivable", () => {
  const label = makeLabel("return", {}, undefined);
  assert.strictEqual(label, "return");
});
