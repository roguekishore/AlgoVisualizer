import {
  resolveBlockAtLine,
  activeBlockIds,
  lineRange,
  resolveHighlightRange,
} from "./flowResolvers";

// A small block tree used across the resolver tests:
//   program (b0)
//     loop (b1)
//       call (b2)
const blockTree = {
  id: "b0",
  type: "program",
  label: "main",
  sourceRange: { startLine: 1, startCol: 1, endLine: 10, endCol: 1 },
  parentId: null,
  children: [
    {
      id: "b1",
      type: "loop",
      label: "for",
      sourceRange: { startLine: 3, startCol: 1, endLine: 8, endCol: 1 },
      parentId: "b0",
      children: [
        {
          id: "b2",
          type: "call",
          label: "f()",
          sourceRange: { startLine: 5, startCol: 1, endLine: 5, endCol: 20 },
          parentId: "b1",
          children: [],
        },
      ],
    },
  ],
};

// SourceMap stores, per line, the chain of block ids ordered outermost -> innermost.
const sourceMap = {
  1: ["b0"],
  3: ["b0", "b1"],
  5: ["b0", "b1", "b2"],
};

describe("resolveBlockAtLine", () => {
  test("returns the innermost (last) block id covering a line", () => {
    expect(resolveBlockAtLine(sourceMap, 5)).toBe("b2");
    expect(resolveBlockAtLine(sourceMap, 3)).toBe("b1");
    expect(resolveBlockAtLine(sourceMap, 1)).toBe("b0");
  });

  test("returns null for a line not covered by any block (clears highlight)", () => {
    expect(resolveBlockAtLine(sourceMap, 2)).toBeNull();
    expect(resolveBlockAtLine(sourceMap, 99)).toBeNull();
  });

  test("returns null when the chain for a line is empty", () => {
    expect(resolveBlockAtLine({ 4: [] }, 4)).toBeNull();
  });

  test("returns null when the source map is missing (null/undefined)", () => {
    expect(resolveBlockAtLine(null, 5)).toBeNull();
    expect(resolveBlockAtLine(undefined, 5)).toBeNull();
  });
});

describe("activeBlockIds", () => {
  test("returns an empty set when the step is null", () => {
    const active = activeBlockIds(blockTree, null);
    expect(active).toBeInstanceOf(Set);
    expect(active.size).toBe(0);
  });

  test("returns an empty set when the step has no blockId", () => {
    expect(activeBlockIds(blockTree, { index: 0, line: 1 }).size).toBe(0);
    expect(activeBlockIds(blockTree, { index: 0, blockId: null, line: 1 }).size).toBe(0);
  });

  test("returns the step block plus all ancestors up to the root", () => {
    const active = activeBlockIds(blockTree, { index: 0, blockId: "b2", line: 5 });
    expect([...active].sort()).toEqual(["b0", "b1", "b2"]);
  });

  test("returns just the root when the step block is the root", () => {
    const active = activeBlockIds(blockTree, { index: 0, blockId: "b0", line: 1 });
    expect([...active]).toEqual(["b0"]);
  });

  test("returns only the unknown id when the step block is not in the tree", () => {
    const active = activeBlockIds(blockTree, { index: 0, blockId: "ghost", line: 1 });
    expect([...active]).toEqual(["ghost"]);
  });

  test("handles a null/undefined block tree without throwing", () => {
    expect(activeBlockIds(null, { index: 0, blockId: "b2", line: 5 }).size).toBe(1);
    expect(activeBlockIds(undefined, { index: 0, blockId: "b2", line: 5 }).size).toBe(1);
  });
});

describe("lineRange", () => {
  test("builds a single-line full-line range for a valid line", () => {
    expect(lineRange(7)).toEqual({
      startLine: 7,
      startCol: 1,
      endLine: 7,
      endCol: 1,
    });
  });

  test("returns null for invalid or out-of-bounds lines", () => {
    expect(lineRange(0)).toBeNull();
    expect(lineRange(-3)).toBeNull();
    expect(lineRange(NaN)).toBeNull();
    expect(lineRange(Infinity)).toBeNull();
    expect(lineRange("5")).toBeNull();
    expect(lineRange(null)).toBeNull();
    expect(lineRange(undefined)).toBeNull();
  });
});

describe("resolveHighlightRange", () => {
  const trace = { blockTree, sourceMap };

  test("returns null when trace is missing", () => {
    expect(resolveHighlightRange(null, { source: "block", blockId: "b1" })).toBeNull();
    expect(resolveHighlightRange(undefined, { source: "editor", line: 5 })).toBeNull();
  });

  test("returns null when hovered is missing", () => {
    expect(resolveHighlightRange(trace, null)).toBeNull();
    expect(resolveHighlightRange(trace, undefined)).toBeNull();
  });

  test("block source: returns the hovered block's source range", () => {
    expect(resolveHighlightRange(trace, { source: "block", blockId: "b1" })).toEqual(
      blockTree.children[0].sourceRange,
    );
  });

  test("block source: returns null when the block id is unknown", () => {
    expect(resolveHighlightRange(trace, { source: "block", blockId: "ghost" })).toBeNull();
  });

  test("editor source: returns the innermost block's range for a covered line", () => {
    expect(resolveHighlightRange(trace, { source: "editor", line: 5 })).toEqual(
      blockTree.children[0].children[0].sourceRange,
    );
  });

  test("editor source: returns null for an uncovered line (clears highlight)", () => {
    expect(resolveHighlightRange(trace, { source: "editor", line: 2 })).toBeNull();
  });

  test("editor source: returns null when the source map is missing", () => {
    expect(resolveHighlightRange({ blockTree }, { source: "editor", line: 5 })).toBeNull();
  });

  test("returns null for an unrecognized hover source", () => {
    expect(resolveHighlightRange(trace, { source: "mystery", line: 5 })).toBeNull();
  });
});
