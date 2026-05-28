/**
 * Flow Resolvers
 * Pure helper functions powering the bidirectional source-block highlight in the
 * Code Flow Visualizer. These have no React/DOM dependencies so they can be unit-
 * and property-tested in isolation.
 *
 * Implements:
 * - Algorithm 4: resolveBlockAtLine (editor line -> innermost block id)
 * - Algorithm 5: activeBlockIds (current step -> active block + ancestors)
 *
 * @typedef {import("./types").SourceMap} SourceMap
 * @typedef {Object} SourceRange
 * @property {number} startLine 1-based, inclusive
 * @property {number} startCol  1-based
 * @property {number} endLine   1-based, inclusive
 * @property {number} endCol    1-based
 * @typedef {Object} BlockNode
 * @property {string} id
 * @property {string} type
 * @property {string} label
 * @property {SourceRange} sourceRange
 * @property {string|null} parentId
 * @property {BlockNode[]} children
 * @typedef {Object} TraceStep
 * @property {number} index
 * @property {string} blockId
 * @property {number} line
 */

/**
 * Algorithm 4 — Resolve the innermost block covering a 1-based editor line.
 *
 * The source map stores, for each line, the chain of block ids covering it ordered
 * outermost -> innermost, so the innermost block is the last element of the chain.
 *
 * @param {SourceMap | null | undefined} sourceMap map of line -> blockId[] (innermost last)
 * @param {number} line 1-based source line
 * @returns {string | null} the innermost block id covering `line`, or null if none
 *
 * Postcondition: when non-null, the returned id references an existing block whose
 * sourceRange contains `line` (guaranteed by how the source map is built).
 */
export function resolveBlockAtLine(sourceMap, line) {
  if (!sourceMap) return null;
  const chain = sourceMap[line];
  if (!chain || chain.length === 0) return null;
  // innermost block covering the line is the last element
  return chain[chain.length - 1];
}

/**
 * Build a fast id -> BlockNode index for a block tree.
 *
 * @param {BlockNode | null | undefined} blockTree
 * @returns {Map<string, BlockNode>}
 */
function indexBlocks(blockTree) {
  const byId = new Map();
  if (!blockTree) return byId;
  const stack = [blockTree];
  while (stack.length > 0) {
    const node = stack.pop();
    if (!node || node.id == null) continue;
    byId.set(node.id, node);
    if (Array.isArray(node.children)) {
      for (const child of node.children) stack.push(child);
    }
  }
  return byId;
}

/**
 * Algorithm 5 — Compute the set of block ids active at the current step: the step's
 * own block plus every ancestor up to (and including) the root.
 *
 * @param {BlockNode | null | undefined} blockTree the root program block
 * @param {TraceStep | null | undefined} step the current step, or null
 * @returns {Set<string>} active block ids, or an empty set when `step` is null
 *
 * Postcondition: returns { step.blockId } ∪ ancestors(step.blockId), or ∅ when step is null.
 */
export function activeBlockIds(blockTree, step) {
  const active = new Set();
  if (!step || step.blockId == null) return active;

  const byId = indexBlocks(blockTree);
  let id = step.blockId;
  // Walk to the root following parentId. Guard against missing nodes and cycles.
  while (id != null && !active.has(id)) {
    active.add(id);
    const node = byId.get(id);
    id = node ? node.parentId : null;
  }
  return active;
}

/**
 * Convert a 1-based source line into a single-line SourceRange, used by the panel
 * to highlight the executing line in the editor.
 *
 * @param {number} line 1-based source line
 * @returns {SourceRange | null} a full-line range, or null for an invalid line
 */
export function lineRange(line) {
  if (typeof line !== "number" || !Number.isFinite(line) || line < 1) return null;
  return {
    startLine: line,
    startCol: 1,
    endLine: line,
    endCol: 1,
  };
}

/**
 * Resolve the SourceRange to highlight given the current hover state.
 *
 * - When a block is hovered ({ source: "block", blockId }), return that block's range.
 * - When the editor is hovered ({ source: "editor", line }), resolve the innermost
 *   block at that line via the trace's source map and return its range; if no block
 *   covers the line, return null so highlighting is cleared.
 *
 * @param {Object | null | undefined} trace the TraceResult (provides blockTree + sourceMap)
 * @param {({source:"block",blockId:string}|{source:"editor",line:number}|null|undefined)} hovered
 * @returns {SourceRange | null} the range to highlight, or null to clear
 */
export function resolveHighlightRange(trace, hovered) {
  if (!trace || !hovered) return null;

  if (hovered.source === "block") {
    const byId = indexBlocks(trace.blockTree);
    const node = byId.get(hovered.blockId);
    return node ? node.sourceRange : null;
  }

  if (hovered.source === "editor") {
    const blockId = resolveBlockAtLine(trace.sourceMap, hovered.line);
    if (!blockId) return null;
    const byId = indexBlocks(trace.blockTree);
    const node = byId.get(blockId);
    return node ? node.sourceRange : null;
  }

  return null;
}
