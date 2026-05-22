/**
 * Scope / variable discovery for the Code Flow Visualizer (Phase 2, task 17).
 *
 * To capture variable *values* at runtime (tasks 18/19), the instrumentation
 * needs to know, at each probe line, which variables are legally in scope and
 * already declared. Emitting a variable before its declaration would not
 * compile, so this module performs a static pass over the Tree-sitter tree to
 * build a lexical-scope model:
 *
 *   - `collectScopeVariables(language, code, blockTree)` walks declaration and
 *     parameter nodes, producing nested `Scope`s each holding the
 *     `{ name, type, declLine }` of the locals/parameters declared directly in
 *     that scope.
 *   - `variablesInScopeAt(scopeModel, line)` returns the set of variables that
 *     are visible *and already declared* at a given 1-based line: the union,
 *     across every scope whose range encloses `line`, of variables whose
 *     `declLine <= line`.
 *
 * The functions are pure and operate on the same Tree-sitter grammars used by
 * `structuralPass.js`, so they can be unit-tested in isolation (task 17.2).
 *
 * @typedef {import('./types').Language} Language
 */

const Parser = require("tree-sitter");
const Cpp = require("tree-sitter-cpp");
const Java = require("tree-sitter-java");

/**
 * A single declared variable within a lexical scope.
 * @typedef {Object} ScopeVar
 * @property {string} name      - Identifier name.
 * @property {string} type      - Best-effort declared type (e.g. "int", "vector<int>").
 * @property {number} declLine  - 1-based line on which it is declared.
 * @property {string} [scope]   - Stable id of the declaring scope (set by collection).
 */

/**
 * A lexical scope (function body or compound block) and the variables declared
 * directly within it.
 * @typedef {Object} Scope
 * @property {string} id        - Stable scope id (e.g. "s3").
 * @property {number} startLine - 1-based scope start (inclusive).
 * @property {number} endLine   - 1-based scope end (inclusive).
 * @property {ScopeVar[]} vars  - Variables declared directly in this scope.
 */

/** Node types that open a new lexical scope, per language. */
const SCOPE_TYPES = {
  cpp: new Set([
    "function_definition",
    "compound_statement",
    "for_statement",
    "for_range_loop",
    "while_statement",
  ]),
  java: new Set([
    "method_declaration",
    "constructor_declaration",
    "block",
    "for_statement",
    "enhanced_for_statement",
    "while_statement",
  ]),
};

let sharedParser = null;

/**
 * Parse source with the given grammar, returning the root node or null.
 * @param {Language} language
 * @param {string} code
 * @returns {object|null}
 */
function parse(language, code) {
  const grammar = language === "java" ? Java : language === "cpp" ? Cpp : null;
  if (!grammar) return null;
  if (!sharedParser) sharedParser = new Parser();
  sharedParser.setLanguage(grammar);
  try {
    const tree = sharedParser.parse(typeof code === "string" ? code : "");
    return tree && tree.rootNode ? tree.rootNode : null;
  } catch (_err) {
    return null;
  }
}

/** 1-based start line of a node. */
function startLineOf(node) {
  const p = node.startPosition || { row: 0 };
  return p.row + 1;
}

/** 1-based end line of a node. */
function endLineOf(node) {
  const p = node.endPosition || node.startPosition || { row: 0 };
  return p.row + 1;
}

/**
 * Extract the text of a node's named child by field name, trimmed.
 * @param {object} node
 * @param {string} field
 * @returns {string}
 */
function fieldText(node, field) {
  if (!node || typeof node.childForFieldName !== "function") return "";
  const child = node.childForFieldName(field);
  return child && typeof child.text === "string" ? child.text.trim() : "";
}

/**
 * Find the first descendant identifier name of a declarator node (handles
 * pointer/reference/array declarators in C++ and array declarators in Java).
 * @param {object} node
 * @returns {string}
 */
function declaratorName(node) {
  if (!node) return "";
  // Direct identifier.
  if (node.type === "identifier") return node.text.trim();
  // C++ wraps the name in init_declarator / pointer_declarator / array_declarator.
  if (typeof node.childForFieldName === "function") {
    const declarator = node.childForFieldName("declarator");
    if (declarator) {
      const inner = declaratorName(declarator);
      if (inner) return inner;
    }
    const name = node.childForFieldName("name");
    if (name && typeof name.text === "string") return name.text.trim();
  }
  // Fallback: first identifier among named children.
  if (Array.isArray(node.namedChildren)) {
    for (const child of node.namedChildren) {
      const n = declaratorName(child);
      if (n) return n;
    }
  }
  return "";
}

/**
 * Collect `{ name, type, declLine }` from a declaration node, for both the
 * single- and multi-declarator forms.
 * @param {Language} language
 * @param {object} node - A declaration / local_variable_declaration node.
 * @returns {ScopeVar[]}
 */
function varsFromDeclaration(language, node) {
  const out = [];
  const type = fieldText(node, "type") || "";
  const declLine = startLineOf(node);

  // Both grammars expose declarator(s) as named children of type
  // init_declarator / variable_declarator / *_declarator.
  const declarators = (node.namedChildren || []).filter((c) =>
    /declarator/.test(c.type)
  );

  if (declarators.length === 0) {
    // e.g. a bare `int x;` may surface the identifier directly.
    const name = declaratorName(node);
    if (name) out.push({ name, type, declLine });
    return out;
  }

  for (const d of declarators) {
    const name = declaratorName(d);
    if (name) out.push({ name, type, declLine });
  }
  return out;
}

/**
 * Collect parameter variables from a function/method node's parameter list.
 * @param {Language} language
 * @param {object} fnNode
 * @returns {ScopeVar[]}
 */
function varsFromParameters(language, fnNode) {
  const out = [];
  const paramTypes =
    language === "java"
      ? ["formal_parameter", "spread_parameter"]
      : ["parameter_declaration"];

  // Node types that begin the function body — never descend into them when
  // collecting parameters (their locals belong to the body scope).
  const bodyTypes =
    language === "java" ? new Set(["block"]) : new Set(["compound_statement"]);

  const declLine = startLineOf(fnNode);

  const stack = [...(fnNode.namedChildren || [])];
  while (stack.length > 0) {
    const n = stack.pop();
    if (!n) continue;
    if (bodyTypes.has(n.type)) continue; // skip the function body entirely
    if (paramTypes.includes(n.type)) {
      const name = declaratorName(n) || fieldText(n, "name");
      const type = fieldText(n, "type") || "";
      if (name) out.push({ name, type, declLine });
      continue;
    }
    for (const c of n.namedChildren || []) stack.push(c);
  }
  return out;
}

/**
 * Build the lexical-scope model for the given source.
 *
 * @param {Language} language - "cpp" or "java".
 * @param {string} code - The source to analyze.
 * @param {object} [_blockTree] - Reserved (kept for signature symmetry with the
 *   structural pass); the scope model is derived directly from the CST.
 * @returns {{ scopes: Scope[] }} The flat list of scopes (each with its vars).
 */
function collectScopeVariables(language, code, _blockTree) {
  const lang = language === "java" ? "java" : "cpp";
  const root = parse(lang, code);
  if (!root) return { scopes: [] };

  const scopeTypes = SCOPE_TYPES[lang];
  const declTypes =
    lang === "java"
      ? new Set(["local_variable_declaration"])
      : new Set(["declaration"]);
  const fnTypes =
    lang === "java"
      ? new Set(["method_declaration", "constructor_declaration"])
      : new Set(["function_definition"]);

  /** @type {Scope[]} */
  const scopes = [];
  let scopeIdCounter = 0;

  /**
   * Walk the CST, attaching declarations to the nearest enclosing scope.
   * @param {object} node
   * @param {Scope|null} currentScope
   */
  function walk(node, currentScope) {
    if (!node) return;

    let scopeForChildren = currentScope;

    if (scopeTypes.has(node.type)) {
      scopeIdCounter += 1;
      /** @type {Scope} */
      const scope = {
        id: `s${scopeIdCounter}`,
        startLine: startLineOf(node),
        endLine: endLineOf(node),
        vars: [],
      };
      // Function/method scopes also own their parameters.
      if (fnTypes.has(node.type)) {
        scope.vars.push(...varsFromParameters(lang, node));
      }
      for (const v of scope.vars) v.scope = scope.id;
      scopes.push(scope);
      scopeForChildren = scope;
    }

    if (declTypes.has(node.type) && scopeForChildren) {
      const declared = varsFromDeclaration(lang, node);
      for (const v of declared) v.scope = scopeForChildren.id;
      scopeForChildren.vars.push(...declared);
    }

    for (const child of node.namedChildren || []) {
      walk(child, scopeForChildren);
    }
  }

  walk(root, null);
  return { scopes };
}

/**
 * Return the variables visible and already-declared at a 1-based `line`.
 *
 * A variable is in scope at `line` when it belongs to a scope whose
 * `[startLine, endLine]` encloses `line` and its `declLine <= line`. When the
 * same name is declared in multiple enclosing scopes (shadowing), the
 * innermost (smallest enclosing range) declaration wins.
 *
 * @param {{ scopes: Scope[] }} scopeModel - Output of `collectScopeVariables`.
 * @param {number} line - 1-based source line.
 * @returns {ScopeVar[]} In-scope, declared variables (innermost shadowing wins).
 */
function variablesInScopeAt(scopeModel, line) {
  if (!scopeModel || !Array.isArray(scopeModel.scopes)) return [];

  // Enclosing scopes ordered outermost → innermost (larger range first).
  const enclosing = scopeModel.scopes
    .filter((s) => s.startLine <= line && line <= s.endLine)
    .sort((a, b) => b.endLine - b.startLine - (a.endLine - a.startLine));

  /** @type {Map<string, ScopeVar>} */
  const byName = new Map();
  for (const scope of enclosing) {
    for (const v of scope.vars) {
      if (v.declLine <= line) {
        // Later (more inner) scopes overwrite, so innermost shadowing wins.
        byName.set(v.name, v);
      }
    }
  }
  return Array.from(byName.values());
}

module.exports = {
  collectScopeVariables,
  variablesInScopeAt,
  // Exported for unit tests.
  varsFromDeclaration,
  declaratorName,
  SCOPE_TYPES,
};
