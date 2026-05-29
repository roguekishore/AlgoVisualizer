/**
 * Property-based test for bidirectional consistency of resolveBlockAtLine.
 *
 * Property 6: Bidirectional consistency — when `resolveBlockAtLine` returns a
 * non-null block id, that block's `sourceRange` contains the resolved line.
 *
 * **Validates: Requirements 4.3**
 *
 * Strategy: generate a valid nested block tree (each child's sourceRange is
 * contained within its parent's, siblings are disjoint), then derive a
 * consistent SourceMap by registering each block's covered lines outermost ->
 * innermost (mirroring Algorithm 2). For arbitrary lines (including out-of-range
 * lines that should resolve to null), assert that any non-null resolution points
 * to a block whose sourceRange contains the line.
 */
import fc from "fast-check";
import { resolveBlockAtLine } from "./flowResolvers";

/**
 * Assign concrete 1-based line ranges to an abstract tree shape.
 * Each node covers [s, e]; children are placed in disjoint contiguous
 * sub-ranges inside [s, e], guaranteeing containment within the parent.
 */
function assignRanges(shape, s, e, parentId, ctx) {
  const id = `b${ctx.id++}`;
  const node = {
    id,
    type: "block",
    label: "",
    sourceRange: { startLine: s, startCol: 1, endLine: e, endCol: 1 },
    parentId,
    children: [],
  };

  const span = e - s + 1;
  const kids = Array.isArray(shape.children) ? shape.children : [];

  if (span >= 2 && kids.length > 0) {
    // Place at most `span` children (each needs >= 1 line).
    const placeable = kids.slice(0, Math.min(kids.length, span));
    const n = placeable.length;
    const base = Math.floor(span / n);
    let extra = span % n;
    let cursor = s;
    for (let i = 0; i < n; i++) {
      let len = base;
      if (extra > 0) {
        len += 1;
        extra -= 1;
      }
      const cs = cursor;
      const ce = cursor + len - 1;
      cursor = ce + 1;
      node.children.push(assignRanges(placeable[i], cs, ce, id, ctx));
    }
  }

  return node;
}

/**
 * Build a SourceMap (line -> blockId[], outermost -> innermost) from a block
 * tree via pre-order traversal: a parent is registered before its children, so
 * for every line the chain is ordered outermost first, innermost last.
 */
function buildSourceMap(root) {
  const map = {};
  const visit = (node) => {
    for (let ln = node.sourceRange.startLine; ln <= node.sourceRange.endLine; ln++) {
      if (!map[ln]) map[ln] = [];
      map[ln].push(node.id);
    }
    for (const child of node.children) visit(child);
  };
  visit(root);
  return map;
}

/** Build an id -> node index for fast lookup. */
function indexBlocks(root) {
  const byId = new Map();
  const stack = [root];
  while (stack.length > 0) {
    const node = stack.pop();
    byId.set(node.id, node);
    for (const child of node.children) stack.push(child);
  }
  return byId;
}

// Abstract recursive tree shape; fast-check controls depth/breadth via size.
const shapeArb = fc.letrec((rec) => ({
  node: fc.record({
    children: fc.oneof(
      { depthSize: "small" },
      fc.constant([]),
      fc.array(rec("node"), { maxLength: 3 })
    ),
  }),
})).node;

describe("flowResolvers — Property 6: bidirectional consistency", () => {
  test("a non-null resolveBlockAtLine result's sourceRange contains the line", () => {
    fc.assert(
      fc.property(
        shapeArb,
        fc.integer({ min: 1, max: 40 }), // total number of source lines
        fc.integer({ min: -3, max: 45 }), // query line (may be out of range -> null)
        (shape, totalLines, queryLine) => {
          const ctx = { id: 0 };
          const tree = assignRanges(shape, 1, totalLines, null, ctx);
          const sourceMap = buildSourceMap(tree);
          const byId = indexBlocks(tree);

          const resolved = resolveBlockAtLine(sourceMap, queryLine);

          if (resolved === null) return true; // no claim made

          // The resolved id must exist and its sourceRange must contain the line.
          const node = byId.get(resolved);
          expect(node).toBeDefined();
          const { startLine, endLine } = node.sourceRange;
          expect(queryLine).toBeGreaterThanOrEqual(startLine);
          expect(queryLine).toBeLessThanOrEqual(endLine);
          return true;
        }
      ),
      { numRuns: 80 }
    );
  });

  test("resolves to the innermost block (last in the outermost->innermost chain)", () => {
    fc.assert(
      fc.property(
        shapeArb,
        fc.integer({ min: 1, max: 40 }),
        fc.integer({ min: 1, max: 40 }),
        (shape, totalLines, queryLine) => {
          const ctx = { id: 0 };
          const tree = assignRanges(shape, 1, totalLines, null, ctx);
          const sourceMap = buildSourceMap(tree);

          const chain = sourceMap[queryLine];
          const resolved = resolveBlockAtLine(sourceMap, queryLine);

          if (!chain || chain.length === 0) {
            expect(resolved).toBeNull();
            return true;
          }
          // Innermost = last element of the chain.
          expect(resolved).toBe(chain[chain.length - 1]);
          return true;
        }
      ),
      { numRuns: 80 }
    );
  });
});
