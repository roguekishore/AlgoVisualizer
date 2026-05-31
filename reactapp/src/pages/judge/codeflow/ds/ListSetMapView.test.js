import React, { act } from "react";
import { createRoot } from "react-dom/client";
import ListSetMapView from "./ListSetMapView";
import { V } from "../../../../components/visualizer/theme";

// Unit tests for the ListSetMapView renderer (list / set chips + map rows).
//
// Coverage:
//   - list/set render one chip per element; lists show an index, sets do not.
//   - map renders one key->value row per entry (key, arrow, value).
//   - Changed elements/keys receive accent styling.
//   - Malformed/empty data degrades to an "empty" placeholder.
//
// _Requirements: R10, R11_

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function render(element) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  let root;
  act(() => {
    root = createRoot(container);
    root.render(element);
  });
  return {
    container,
    unmount() {
      act(() => root.unmount());
      container.remove();
    },
  };
}

function normColor(c) {
  if (!c) return "";
  const s = String(c).trim().toLowerCase();
  const hex = /^#([0-9a-f]{6})$/.exec(s);
  if (hex) {
    const n = hex[1];
    return `rgb(${parseInt(n.slice(0, 2), 16)},${parseInt(n.slice(2, 4), 16)},${parseInt(n.slice(4, 6), 16)})`;
  }
  return s.replace(/\s+/g, "");
}
const isAccent = (color) => normColor(color) === normColor(V.accent);

const chips = (container) =>
  Array.from(container.querySelectorAll("div[title]"));

describe("ListSetMapView - list chips (R10)", () => {
  test("renders one chip per list element, each prefixed with its index", () => {
    const model = { kind: "list", data: ["x", "y", "z"], changedKeys: [] };
    const { container, unmount } = render(<ListSetMapView model={model} />);

    const items = chips(container);
    expect(items).toHaveLength(3);
    // Lists show an index span, so the chip text includes both index and value.
    expect(items[0].textContent).toContain("0");
    expect(items[0].textContent).toContain("x");
    expect(items[2].textContent).toContain("2");
    expect(items[2].textContent).toContain("z");

    unmount();
  });

  test("set chips omit the index", () => {
    const model = { kind: "set", data: ["x", "y"], changedKeys: [] };
    const { container, unmount } = render(<ListSetMapView model={model} />);

    const items = chips(container);
    expect(items).toHaveLength(2);
    // No index prefix: chip text is just the value.
    expect(items[0].textContent).toBe("x");
    expect(items[1].textContent).toBe("y");

    unmount();
  });

  test("renders an empty placeholder for missing list data", () => {
    const { container, unmount } = render(
      <ListSetMapView model={{ kind: "list", data: null }} />
    );
    expect(chips(container)).toHaveLength(0);
    expect(container.textContent).toContain("empty");
    unmount();
  });
});

describe("ListSetMapView - map rows (R10)", () => {
  test("renders one row per entry with key, arrow, and value", () => {
    const model = {
      kind: "map",
      data: [
        { key: "a", value: "1" },
        { key: "b", value: "2" },
      ],
      changedKeys: [],
    };
    const { container, unmount } = render(<ListSetMapView model={model} />);

    // Two entries => two key boxes + two value boxes (both carry title).
    const boxes = chips(container);
    expect(boxes).toHaveLength(4);

    // The arrow separator renders between key and value.
    expect(container.textContent).toContain("→");
    // Key->value content present.
    expect(container.textContent).toContain("a");
    expect(container.textContent).toContain("1");
    expect(container.textContent).toContain("b");
    expect(container.textContent).toContain("2");

    unmount();
  });

  test("renders an empty placeholder for missing map data", () => {
    const { container, unmount } = render(
      <ListSetMapView model={{ kind: "map", data: null }} />
    );
    expect(chips(container)).toHaveLength(0);
    expect(container.textContent).toContain("empty");
    unmount();
  });
});

describe("ListSetMapView - changed accent styling (R11)", () => {
  test("list: chip whose index is in changedKeys is accented", () => {
    const model = { kind: "list", data: ["x", "y", "z"], changedKeys: ["1"] };
    const { container, unmount } = render(<ListSetMapView model={model} />);

    const items = chips(container);
    expect(isAccent(items[0].style.color)).toBe(false);
    expect(isAccent(items[1].style.color)).toBe(true);
    expect(isAccent(items[2].style.color)).toBe(false);

    unmount();
  });

  test("map: value box whose key is in changedKeys is accented", () => {
    const model = {
      kind: "map",
      data: [
        { key: "a", value: "1" },
        { key: "b", value: "2" },
      ],
      changedKeys: ["b"],
    };
    const { container, unmount } = render(<ListSetMapView model={model} />);

    // Boxes in DOM order: a-key, a-value, b-key, b-value.
    const boxes = chips(container);
    expect(isAccent(boxes[1].style.color)).toBe(false); // a value
    expect(isAccent(boxes[3].style.color)).toBe(true); // b value
    expect(boxes[3].textContent).toBe("2");

    unmount();
  });
});
