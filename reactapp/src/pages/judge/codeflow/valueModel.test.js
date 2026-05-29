import { toValueModel } from "./valueModel";

// Unit tests for the `toValueModel` normalizer.
//
// Coverage:
//   - Each ViewKind maps to the right model (kind + data preserved).
//   - Missing / garbled / unknown `view` degrades to a `scalar` model built
//     from the back-compat `value` string, without throwing.
//   - `changedKeys` is preserved (and normalized to string[]).
//
// _Requirements: R10, R11_

/**
 * Build a minimal VarSnapshot with a structured view.
 * @param {string} kind
 * @param {*} data
 * @param {string[]} [changedKeys]
 */
function snapshotWithView(kind, data, changedKeys) {
  return {
    name: "x",
    type: "auto",
    scope: "main",
    value: "<summary>",
    changed: true,
    view: { kind, data, changedKeys },
  };
}

describe("toValueModel - ViewKind mapping (R10)", () => {
  // Representative data shapes per the design's VarView contract.
  const cases = [
    ["scalar", "42"],
    ["string", "hello"],
    ["array1d", ["1", "2", "3"]],
    ["array2d", [["1", "2"], ["3", "4"]]],
    ["stack", { items: ["1", "2"], top: 1 }],
    ["queue", { items: ["1", "2"], front: 0, back: 1 }],
    ["deque", { items: ["1", "2"], front: 0, back: 1 }],
    ["list", ["a", "b"]],
    ["set", ["a", "b"]],
    ["map", [{ key: "k", value: "v" }]],
    ["object", { foo: "bar" }],
  ];

  it.each(cases)("maps view.kind %s to the matching model", (kind, data) => {
    const model = toValueModel(snapshotWithView(kind, data));

    expect(model.kind).toBe(kind);
    expect(model.data).toEqual(data);
    expect(model.name).toBe("x");
    expect(model.type).toBe("auto");
    expect(model.scope).toBe("main");
    expect(model.changed).toBe(true);
  });

  it("preserves the whole-variable changed flag", () => {
    const unchanged = toValueModel({
      name: "y",
      view: { kind: "array1d", data: ["1"] },
      changed: false,
    });
    expect(unchanged.changed).toBe(false);

    const changed = toValueModel({
      name: "y",
      view: { kind: "array1d", data: ["1"] },
      changed: true,
    });
    expect(changed.changed).toBe(true);
  });
});

describe("toValueModel - changedKeys preservation (R11)", () => {
  it("preserves array index changedKeys", () => {
    const model = toValueModel(
      snapshotWithView("array1d", ["1", "2", "3"], ["1", "2"])
    );
    expect(model.changedKeys).toEqual(["1", "2"]);
  });

  it("preserves grid r,c changedKeys for array2d", () => {
    const model = toValueModel(
      snapshotWithView("array2d", [["1", "2"], ["3", "4"]], ["0,1", "1,0"])
    );
    expect(model.changedKeys).toEqual(["0,1", "1,0"]);
  });

  it("preserves map key changedKeys", () => {
    const model = toValueModel(
      snapshotWithView("map", [{ key: "k", value: "v" }], ["k"])
    );
    expect(model.changedKeys).toEqual(["k"]);
  });

  it("preserves stack/queue end markers as changedKeys", () => {
    const model = toValueModel(
      snapshotWithView("stack", { items: ["1"], top: 0 }, ["top"])
    );
    expect(model.changedKeys).toEqual(["top"]);
  });

  it("normalizes non-string changedKeys entries to strings", () => {
    const model = toValueModel(snapshotWithView("array1d", ["1"], [0, 1]));
    expect(model.changedKeys).toEqual(["0", "1"]);
  });

  it("defaults changedKeys to an empty array when absent", () => {
    const model = toValueModel(snapshotWithView("array1d", ["1"]));
    expect(model.changedKeys).toEqual([]);
  });

  it("defaults changedKeys to an empty array when malformed", () => {
    const model = toValueModel(
      snapshotWithView("array1d", ["1"], "not-an-array")
    );
    expect(model.changedKeys).toEqual([]);
  });
});

describe("toValueModel - degrade to scalar (R10)", () => {
  it("degrades to scalar when view is missing, using the back-compat value", () => {
    const model = toValueModel({
      name: "n",
      type: "int",
      scope: "main",
      value: "7",
      changed: true,
    });

    expect(model.kind).toBe("scalar");
    expect(model.data).toBe("7");
    expect(model.changed).toBe(true);
    expect(model.changedKeys).toEqual([]);
  });

  it("degrades to scalar when view.kind is unknown", () => {
    const model = toValueModel({
      name: "n",
      value: "fallback",
      view: { kind: "tree", data: { root: 1 } },
    });

    expect(model.kind).toBe("scalar");
    expect(model.data).toBe("fallback");
    expect(model.changedKeys).toEqual([]);
  });

  it("degrades to scalar when view is not an object", () => {
    const model = toValueModel({ name: "n", value: "v", view: "garbled" });
    expect(model.kind).toBe("scalar");
    expect(model.data).toBe("v");
  });

  it("degrades to scalar when view.kind is missing", () => {
    const model = toValueModel({ name: "n", value: "v", view: { data: [1] } });
    expect(model.kind).toBe("scalar");
    expect(model.data).toBe("v");
  });

  it("coerces a missing value to an empty string in the scalar fallback", () => {
    const model = toValueModel({ name: "n" });
    expect(model.kind).toBe("scalar");
    expect(model.data).toBe("");
  });

  it("does not throw on null / undefined / non-object input", () => {
    expect(() => toValueModel(null)).not.toThrow();
    expect(() => toValueModel(undefined)).not.toThrow();
    expect(() => toValueModel(42)).not.toThrow();

    const fromNull = toValueModel(null);
    expect(fromNull.kind).toBe("scalar");
    expect(fromNull.name).toBe("");
    expect(fromNull.data).toBe("");
    expect(fromNull.changed).toBe(false);
    expect(fromNull.changedKeys).toEqual([]);
  });
});
