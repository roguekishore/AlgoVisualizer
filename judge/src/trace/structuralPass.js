/**
 * Static structural pass for the Code Flow Visualizer.
 *
 * This module parses C++/Java source into a `BlockNode` tree (the `program`
 * root with nested loops, conditionals, declarations, calls, I/O and returns)
 * with precise, 1-based source ranges, plus a `SourceMap` for fast
 * line → block resolution.
 *
 * Task 2.1 implements the leaf utilities used by the recursive descent:
 *   - `mapGrammarType(language, grammarType)` — maps a Tree-sitter CST node
 *     grammar type to a `BlockType`, or `null` for nodes that are not block
 *     boundaries.
 *   - `makeLabel(type, cstNode, code)` — produces a short, single-line human
 *     label for a block.
 *   - `rangeOf(cstNode)` — produces a 1-based `SourceRange` (with
 *     `startLine <= endLine`).
 *
 * `buildBlockTree` (task 2.2) consumes these and is added to this same module.
 *
 * @typedef {import('./types').BlockType} BlockType
 * @typedef {import('./types').SourceRange} SourceRange
 * @typedef {import('./types').Language} Language
 * @typedef {import('./types').BlockNode} BlockNode
 * @typedef {import('./types').SourceMap} SourceMap
 */

const Parser = require("tree-sitter");
const Cpp = require("tree-sitter-cpp");
const Java = require("tree-sitter-java");

/**
 * Maximum number of characters retained in a generated block label before it
 * is truncated with an ellipsis. Keeps the Flow canvas labels compact.
 * @type {number}
 */
const MAX_LABEL_LENGTH = 80;

/**
 * C++ (tree-sitter-cpp) grammar node type → `BlockType`.
 *
 * Note: I/O constructs (e.g. `cin >> x`, `cout << x`) surface as
 * `binary_expression` / `call_expression` nodes whose I/O nature depends on the
 * identifiers involved, not on the grammar type alone. They are therefore
 * classified contextually by `buildBlockTree` (task 2.2) rather than here.
 *
 * @type {Object.<string, BlockType>}
 */
const CPP_TYPE_MAP = {
  translation_unit: "program",
  function_definition: "function",
  // loops
  for_statement: "loop",
  for_range_loop: "loop",
  while_statement: "loop",
  do_statement: "loop",
  // conditionals
  if_statement: "conditional",
  switch_statement: "conditional",
  // declarations
  declaration: "declaration",
  field_declaration: "declaration",
  // assignment / call / return
  assignment_expression: "assignment",
  call_expression: "call",
  return_statement: "return",
  // generic compound statement
  compound_statement: "block",
};

/**
 * Java (tree-sitter-java) grammar node type → `BlockType`.
 *
 * As with C++, I/O constructs (e.g. `Scanner.nextInt()`,
 * `System.out.println(...)`) are `method_invocation` nodes that are classified
 * contextually by `buildBlockTree` (task 2.2).
 *
 * @type {Object.<string, BlockType>}
 */
const JAVA_TYPE_MAP = {
  program: "program",
  // functions
  method_declaration: "function",
  constructor_declaration: "function",
  // loops
  for_statement: "loop",
  enhanced_for_statement: "loop",
  while_statement: "loop",
  do_statement: "loop",
  // conditionals
  if_statement: "conditional",
  switch_statement: "conditional",
  switch_expression: "conditional",
  // declarations
  local_variable_declaration: "declaration",
  field_declaration: "declaration",
  // assignment / call / return
  assignment_expression: "assignment",
  method_invocation: "call",
  return_statement: "return",
  // generic compound statement
  block: "block",
};

/**
 * Map a Tree-sitter CST node grammar type to a `BlockType`.
 *
 * @param {Language} language - "cpp" or "java".
 * @param {string} grammarType - The CST node's grammar type (e.g. "for_statement").
 * @returns {(BlockType|null)} The mapped block type, or `null` for node types
 *   that are not block boundaries (the caller should still recurse into them to
 *   discover nested blocks).
 */
function mapGrammarType(language, grammarType) {
  if (!grammarType) return null;
  const table = language === "java" ? JAVA_TYPE_MAP : CPP_TYPE_MAP;
  return table[grammarType] || null;
}

/**
 * Read a node's start/end position defensively, normalizing to 0-based
 * `{ row, column }` regardless of which Tree-sitter accessor shape is present.
 *
 * @param {object} cstNode - A Tree-sitter node.
 * @returns {{ start: {row:number, column:number}, end: {row:number, column:number} }}
 */
function positionsOf(cstNode) {
  const start = cstNode.startPosition || { row: 0, column: 0 };
  const end = cstNode.endPosition || { row: start.row, column: start.column };
  return { start, end };
}

/**
 * Produce a 1-based `SourceRange` for a CST node.
 *
 * Tree-sitter reports 0-based rows and columns; this converts to the 1-based,
 * inclusive line / column convention used throughout the trace pipeline.
 *
 * @param {object} cstNode - A Tree-sitter node with `startPosition`/`endPosition`.
 * @returns {SourceRange} A range guaranteed to satisfy `startLine <= endLine`.
 */
function rangeOf(cstNode) {
  const { start, end } = positionsOf(cstNode);

  let startLine = start.row + 1;
  let startCol = start.column + 1;
  let endLine = end.row + 1;
  let endCol = end.column + 1;

  // Defensive normalization: never allow an inverted range to escape.
  if (endLine < startLine) {
    endLine = startLine;
    endCol = startCol;
  } else if (endLine === startLine && endCol < startCol) {
    endCol = startCol;
  }

  return { startLine, startCol, endLine, endCol };
}

/**
 * Collapse a raw source snippet into a compact, single-line label.
 *
 * Takes the first source line of the snippet, collapses internal whitespace,
 * strips a trailing block-open `{` or statement terminator `;`, and truncates
 * to `MAX_LABEL_LENGTH` with an ellipsis.
 *
 * @param {string} text - The raw node text.
 * @returns {string} A trimmed, single-line label.
 */
function condenseLabel(text) {
  if (!text) return "";
  // Use the first non-empty source line so multi-line constructs (e.g. a loop
  // header followed by a body) reduce to their signature line.
  const firstLine =
    text.split("\n").find((line) => line.trim().length > 0) || "";
  let label = firstLine.replace(/\s+/g, " ").trim();
  // Drop a dangling block-open brace or statement terminator for readability.
  label = label.replace(/\s*\{$/, "").replace(/;$/, "").trim();
  if (label.length > MAX_LABEL_LENGTH) {
    label = label.slice(0, MAX_LABEL_LENGTH - 1).trimEnd() + "…";
  }
  return label;
}

/**
 * Build a short, human-readable label for a block.
 *
 * The label summarizes the construct for display in the Flow canvas. The
 * `program` and generic `block` types use fixed labels; all other types derive
 * a condensed single-line label from the node's source text.
 *
 * @param {BlockType} type - The block's type (from `mapGrammarType`).
 * @param {object} cstNode - The Tree-sitter node the block represents.
 * @param {string} [code] - The full source (fallback when `cstNode.text` is
 *   unavailable; sliced via `startIndex`/`endIndex`).
 * @returns {string} A non-empty label string.
 */
function makeLabel(type, cstNode, code) {
  if (type === "program") return "program";
  if (type === "block") return "block";

  let text = "";
  if (cstNode && typeof cstNode.text === "string") {
    text = cstNode.text;
  } else if (
    cstNode &&
    typeof code === "string" &&
    Number.isInteger(cstNode.startIndex) &&
    Number.isInteger(cstNode.endIndex)
  ) {
    text = code.slice(cstNode.startIndex, cstNode.endIndex);
  }

  const label = condenseLabel(text);
  return label.length > 0 ? label : type;
}

/**
 * Error thrown by `buildBlockTree` when the source cannot be parsed into a
 * usable syntax tree. The tracer orchestrator (task 6.2) catches this and
 * surfaces a `Trace Error` status with a null block tree.
 */
class ParseError extends Error {
  /** @param {string} message */
  constructor(message) {
    super(message);
    this.name = "ParseError";
  }
}

/**
 * Lazily-instantiated, reusable Tree-sitter parser. A single parser instance is
 * reused across calls (its language is reset per call), avoiding the cost of
 * re-instantiating native bindings on every trace request.
 * @type {Parser|null}
 */
let sharedParser = null;

/**
 * Parse source with the appropriate Tree-sitter grammar.
 *
 * @param {Language} language - "cpp" or "java".
 * @param {string} code - The source to parse.
 * @returns {object} The Tree-sitter `Tree`.
 * @throws {ParseError} When the grammar is unknown or parsing yields no tree.
 */
function parseSource(language, code) {
  const grammar = language === "java" ? Java : language === "cpp" ? Cpp : null;
  if (!grammar) {
    throw new ParseError(`Unsupported language: ${String(language)}`);
  }
  if (!sharedParser) {
    sharedParser = new Parser();
  }
  sharedParser.setLanguage(grammar);

  let tree;
  try {
    tree = sharedParser.parse(typeof code === "string" ? code : "");
  } catch (err) {
    throw new ParseError(`Failed to parse source: ${err && err.message}`);
  }
  if (!tree || !tree.rootNode) {
    throw new ParseError("Unable to parse source: no syntax tree produced");
  }
  return tree;
}

/**
 * Decide whether a CST node that mapped to `call`/`assignment` (or their
 * children) is actually an I/O construct, reclassifying it to the `io`
 * `BlockType`. I/O is contextual: it depends on the identifiers involved
 * (`cin`/`cout`/`printf`/`scanf`/`getline` in C++, `System.out`/`System.err`/
 * `Scanner`-style readers in Java) rather than on the grammar type alone.
 *
 * Only the outermost expression of an I/O statement should become an `io`
 * block, so streaming chains (`cout << a << b`) are detected at the top-level
 * `binary_expression` whose parent is not itself a stream `binary_expression`.
 *
 * @param {Language} language
 * @param {object} cstNode - The Tree-sitter node.
 * @param {BlockType} baseType - The type from `mapGrammarType`.
 * @returns {boolean} True when the node should be classified as `io`.
 */
function isIoNode(language, cstNode, baseType) {
  const text = typeof cstNode.text === "string" ? cstNode.text : "";
  if (!text) return false;

  if (language === "cpp") {
    // C++ stream I/O surfaces as a `binary_expression` (cin >> / cout <<).
    // Reclassify only the outermost stream expression of the statement so a
    // chain like `cout << a << b` yields a single io block.
    if (cstNode.type === "binary_expression") {
      const parent = cstNode.parent;
      if (parent && parent.type === "binary_expression") return false;
      return /\b(cin|cout|cerr|clog)\b/.test(text);
    }
    // Function-style I/O calls.
    if (baseType === "call" || cstNode.type === "call_expression") {
      return /\b(printf|scanf|getline|puts|gets|fprintf|fscanf)\b/.test(text);
    }
    return false;
  }

  if (language === "java") {
    // Java I/O is always a method_invocation: System.out/err.*, or a
    // Scanner/BufferedReader-style read (next*, read*, hasNext*).
    if (baseType === "call" || cstNode.type === "method_invocation") {
      if (/System\s*\.\s*(out|err)\s*\./.test(text)) return true;
      const name =
        typeof cstNode.childForFieldName === "function"
          ? cstNode.childForFieldName("name")
          : null;
      const methodName = name && typeof name.text === "string" ? name.text : "";
      if (/^(next|nextLine|nextInt|nextDouble|nextLong|nextBoolean|nextFloat|read|readLine|hasNext|hasNextInt|hasNextLine)/.test(
          methodName
        )) {
        return true;
      }
    }
    return false;
  }

  return false;
}

/**
 * Build a `BlockNode` tree (and companion `SourceMap`) from source.
 *
 * Implements Algorithm 2 from the design doc:
 *   1. Parse the source with the language's Tree-sitter grammar; throw
 *      `ParseError` when no usable tree is produced.
 *   2. Recursively descend the named children, emitting a `BlockNode` for each
 *      node that maps to a `BlockType` (with contextual `io` reclassification),
 *      and threading non-block nodes through so nested blocks are still found.
 *   3. Assign every block a unique id; register each covered line into the
 *      `sourceMap` outermost → innermost (outer blocks pushed before inner).
 *   4. Root everything under a single synthetic `program` node (`id: "b0"`,
 *      `parentId: null`) covering the whole file.
 *
 * @param {Language} language - "cpp" or "java".
 * @param {string} code - The source to parse.
 * @returns {{ blockTree: BlockNode, sourceMap: SourceMap }}
 * @throws {ParseError} When the source cannot be parsed into a usable tree.
 */
function buildBlockTree(language, code) {
  const tree = parseSource(language, code);
  const root = tree.rootNode;

  // A wholly-unparseable input yields a root that is itself an error and that
  // covers no named structure. Treat that as a parse failure.
  if (root.type === "ERROR" && root.namedChildCount === 0) {
    throw new ParseError("Unable to parse source");
  }

  let idCounter = 0;
  /** @type {SourceMap} */
  const sourceMap = {};

  /**
   * Register every line covered by `range` against `blockId`. Because outer
   * blocks are visited before their inner children, appending here naturally
   * yields an outermost → innermost ordering per line.
   * @param {SourceRange} range
   * @param {string} blockId
   */
  function registerLines(range, blockId) {
    for (let ln = range.startLine; ln <= range.endLine; ln += 1) {
      if (!sourceMap[ln]) sourceMap[ln] = [];
      sourceMap[ln].push(blockId);
    }
  }

  /**
   * Visit a CST node, returning the list of `BlockNode`s it contributes to its
   * parent. A node that does not itself map to a block still has its children
   * visited (their blocks bubble up to the nearest enclosing block).
   *
   * @param {object} cstNode
   * @param {(string|null)} parentId
   * @returns {BlockNode[]}
   */
  function visit(cstNode, parentId) {
    let type = mapGrammarType(language, cstNode.grammarType || cstNode.type);

    // Contextual I/O reclassification (cin/cout, Scanner/System.out, etc.).
    if (isIoNode(language, cstNode, type)) {
      type = "io";
    }

    // Never emit a second `program` node from the grammar; the synthetic root
    // (b0) is the single program block.
    if (type === "program") type = null;

    if (type === null) {
      /** @type {BlockNode[]} */
      const collected = [];
      for (const child of cstNode.namedChildren) {
        collected.push(...visit(child, parentId));
      }
      return collected;
    }

    idCounter += 1;
    const range = rangeOf(cstNode);
    /** @type {BlockNode} */
    const node = {
      id: `b${idCounter}`,
      type,
      label: makeLabel(type, cstNode, code),
      sourceRange: range,
      parentId,
      children: [],
    };

    registerLines(range, node.id);

    for (const child of cstNode.namedChildren) {
      node.children.push(...visit(child, node.id));
    }

    return [node];
  }

  const roots = visit(root, "b0");

  const programRange = rangeOf(root);
  /** @type {BlockNode} */
  const program = {
    id: "b0",
    type: "program",
    label: "program",
    sourceRange: programRange,
    parentId: null,
    children: roots,
  };

  // The program block is the outermost block for every covered line: prepend it
  // so each line's chain starts at the root (outermost → innermost preserved).
  for (let ln = programRange.startLine; ln <= programRange.endLine; ln += 1) {
    if (!sourceMap[ln]) sourceMap[ln] = [];
    sourceMap[ln].unshift("b0");
  }
  // Any line registered by a child but outside the root's reported span (should
  // not normally happen) still gets the program prepended.
  for (const key of Object.keys(sourceMap)) {
    const chain = sourceMap[key];
    if (chain[0] !== "b0") chain.unshift("b0");
  }

  return { blockTree: program, sourceMap };
}

module.exports = {
  mapGrammarType,
  makeLabel,
  rangeOf,
  buildBlockTree,
  ParseError,
  // Exported for reuse / inspection by buildBlockTree (task 2.2) and tests.
  CPP_TYPE_MAP,
  JAVA_TYPE_MAP,
  MAX_LABEL_LENGTH,
};
