/**
 * Property-Based Test — Property 7: Ancestor closure of active set
 *
 * activeBlockIds(tree, s) equals { s.blockId } ∪ ancestors(s.blockId)
 *
 * Validates: Requirements 5.3
 *
 * Strategy: generate a random block tree (each node has a unique id and a
 * parentId pointing at an already-created node, so the structure is always a
 * valid rooted tree with no cycles). Pick a random node as the step's blockId,
 * compute the expected ancestor set independently by walking parentId pointers
 * via a flat id->parentId map, and assert set equality against activeBlockIds.
 */
import fc from "fast-check";
import { activeBlockIds } from "./flowResolvers";

/**
 * Generate a random rooted block tree.
 *
 * Returns { tree, nodes } where `tree` is the nested BlockNode root and `nodes`
 * is the flat list of all created nodes (each with id and parentId).
 */
function blockTreeArbitrary() {
  // Generate a parent index for each non-root node: node i (i>=1) attaches to
  // some node j with j < i. This guarantees an acyclic rooted tree.
  return fc
    .array(fc.nat(), { minLength: 0, maxLength: 30 })
    .map((parentSeeds) => {
      const count = parentSeeds.length + 1; // +1 for the root
      // Create flat nodes first.
      const flat = [];
      for (let i = 0; i < count; i += 1) {
        flat.push({
          id: `b${i}`,
          type: "block",
          label: `block ${i}`,
          sourceRange: { startLine: 1, startCol: 1, endLine: 1, endCol: 1 },
          parentId: i === 0 ? null : null, // filled below
          children: [],
        });
      }
      // Assign parents for non-root nodes (i >= 1) to some earlier node.
      for (let i = 1; i < count; i += 1) {
        const parentIndex = parentSeeds[i - 1] % i; // in [0, i)
        flat[i].parentId = flat[parentIndex].id;
        flat[parentIndex].children.push(flat[i]);
      }
      return { tree: flat[0], nodes: flat };
    });
}

/** Independent reference implementation of { id } ∪ ancestors(id). */
function expectedAncestorSet(nodes, startId) {
  const parentOf = new Map(nodes.map((n) => [n.id, n.parentId]));
  const set = new Set();
  let id = startId;
  while (id != null && !set.has(id)) {
    set.add(id);
    id = parentOf.get(id) ?? null;
  }
  return set;
}

describe("flowResolvers.activeBlockIds — Property 7: Ancestor closure", () => {
  test("activeBlockIds(tree, s) === { s.blockId } ∪ ancestors(s.blockId)", () => {
    fc.assert(
      fc.property(
        blockTreeArbitrary().chain(({ tree, nodes }) =>
          fc.record({
            tree: fc.constant(tree),
            nodes: fc.constant(nodes),
            // pick any node in the tree as the active step's block
            pickIndex: fc.nat({ max: nodes.length - 1 }),
          }),
        ),
        ({ tree, nodes, pickIndex }) => {
          const blockId = nodes[pickIndex].id;
          const step = { index: 0, blockId, line: 1 };

          const actual = activeBlockIds(tree, step);
          const expected = expectedAncestorSet(nodes, blockId);

          // Same size and same members => set equality.
          expect(actual.size).toBe(expected.size);
          for (const id of expected) {
            expect(actual.has(id)).toBe(true);
          }
          for (const id of actual) {
            expect(expected.has(id)).toBe(true);
          }
        },
      ),
      { numRuns: 50 },
    );
  });

  test("activeBlockIds returns an empty set when step is null", () => {
    fc.assert(
      fc.property(blockTreeArbitrary(), ({ tree }) => {
        const result = activeBlockIds(tree, null);
        expect(result.size).toBe(0);
      }),
    );
  });
});
