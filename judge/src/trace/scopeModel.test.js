/**
 * Unit tests for scope / variable discovery (task 17.2).
 *
 * Covers C++ and Java fixtures:
 *   - function parameters belong to the function scope,
 *   - nested-block shadowing (innermost declaration wins),
 *   - a variable declared *after* a probe line is excluded at that line,
 *   - loop counters are discovered.
 *
 * Uses the built-in `node:test` runner.
 */

const test = require("node:test");
const assert = require("node:assert");

const {
  collectScopeVariables,
  variablesInScopeAt,
} = require("./scopeModel");

/** Names of in-scope vars at a line, as a sorted array. */
function namesAt(model, line) {
  return variablesInScopeAt(model, line)
    .map((v) => v.name)
    .sort();
}

// ──────────────────────────────────────────────────────────────────────────
// C++
// ──────────────────────────────────────────────────────────────────────────

test("cpp: function parameters are in scope inside the body", () => {
  const code = [
    "int sum(int a, int b) {",   // 1
    "  int c = a + b;",          // 2
    "  return c;",               // 3
    "}",                         // 4
  ].join("\n");

  const model = collectScopeVariables("cpp", code);
  // a, b are parameters; visible from the function start.
  const at2 = namesAt(model, 2);
  assert.ok(at2.includes("a"), "param a in scope");
  assert.ok(at2.includes("b"), "param b in scope");
});

test("cpp: variable declared after a line is excluded at that line", () => {
  const code = [
    "int main() {",       // 1
    "  int x = 1;",       // 2
    "  int y = 2;",       // 3
    "  return 0;",        // 4
    "}",                  // 5
  ].join("\n");

  const model = collectScopeVariables("cpp", code);
  // At line 2, y (declared on line 3) is NOT yet in scope.
  assert.ok(!namesAt(model, 2).includes("y"), "y not yet declared at line 2");
  // At line 4, both x and y are in scope.
  const at4 = namesAt(model, 4);
  assert.ok(at4.includes("x") && at4.includes("y"), "x and y in scope at line 4");
});

test("cpp: loop counter is discovered", () => {
  const code = [
    "int main() {",                 // 1
    "  int n = 5;",                 // 2
    "  for (int i = 0; i < n; i++) {", // 3
    "    int t = i;",               // 4
    "  }",                          // 5
    "  return 0;",                  // 6
    "}",                            // 7
  ].join("\n");

  const model = collectScopeVariables("cpp", code);
  const at4 = namesAt(model, 4);
  assert.ok(at4.includes("i"), "loop counter i in scope inside body");
  assert.ok(at4.includes("t"), "loop body local t in scope");
  assert.ok(at4.includes("n"), "outer n in scope");
});

test("cpp: inner-block shadowing keeps innermost declaration", () => {
  const code = [
    "int main() {",        // 1
    "  int x = 1;",        // 2
    "  {",                 // 3
    "    int x = 2;",      // 4
    "    int y = x;",      // 5
    "  }",                 // 6
    "  return 0;",         // 7
    "}",                   // 8
  ].join("\n");

  const model = collectScopeVariables("cpp", code);
  const inner = variablesInScopeAt(model, 5).filter((v) => v.name === "x");
  // Only one "x" surfaces (innermost), declared on line 4.
  assert.strictEqual(inner.length, 1, "single x after shadow resolution");
  assert.strictEqual(inner[0].declLine, 4, "innermost x (line 4) wins");
});

// ──────────────────────────────────────────────────────────────────────────
// Java
// ──────────────────────────────────────────────────────────────────────────

test("java: method parameters and locals are discovered", () => {
  const code = [
    "class Main {",                          // 1
    "  static int f(int a, int b) {",        // 2
    "    int c = a + b;",                     // 3
    "    return c;",                          // 4
    "  }",                                    // 5
    "}",                                      // 6
  ].join("\n");

  const model = collectScopeVariables("java", code);
  const at3 = namesAt(model, 3);
  assert.ok(at3.includes("a") && at3.includes("b"), "params a,b in scope");
});

test("java: variable declared after a line is excluded", () => {
  const code = [
    "class Main {",                 // 1
    "  public static void main(String[] args) {", // 2
    "    int x = 1;",               // 3
    "    int y = 2;",               // 4
    "  }",                          // 5
    "}",                            // 6
  ].join("\n");

  const model = collectScopeVariables("java", code);
  assert.ok(!namesAt(model, 3).includes("y"), "y not yet declared at line 3");
  assert.ok(namesAt(model, 4).includes("x"), "x in scope at line 4");
});

test("java: loop counter in enhanced/standard for is discovered", () => {
  const code = [
    "class Main {",                              // 1
    "  public static void main(String[] args) {",// 2
    "    int n = 3;",                            // 3
    "    for (int i = 0; i < n; i++) {",         // 4
    "      int t = i;",                          // 5
    "    }",                                     // 6
    "  }",                                       // 7
    "}",                                         // 8
  ].join("\n");

  const model = collectScopeVariables("java", code);
  const at5 = namesAt(model, 5);
  assert.ok(at5.includes("i"), "loop counter i in scope");
  assert.ok(at5.includes("t"), "loop body local t in scope");
});
