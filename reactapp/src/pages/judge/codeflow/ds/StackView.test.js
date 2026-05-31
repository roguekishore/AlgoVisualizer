import React, { act } from "react";
import { createRoot } from "react-dom/client";
import StackView from "./StackView";
import { V } from "../../../../components/visualizer/theme";

// Unit tests for the StackView (vertical LIFO) renderer.
//
// Coverage:
//   - Correct cell count and top-of-stack ordering (top rendered first).
//   - A TOP end marker renders beside the top cell.
//   - The top cell receives accent styling when changedKeys contains "top".
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

const valueBoxes = (container) =>
  Array.from(container.querySelectorAll("div[title]"));

describe("StackView - cell count and ordering (R10)", () => {
  test("renders one cell per item with the top drawn first", () => {
    const model = { kind: "stack", data: { items: ["a", "b", "c"], top: 2 }, changedKeys: [] };
    const { container, unmount } = render(<StackView model={model} />);

    const boxes = valueBoxes(container);
    expect(boxes).toHaveLength(3);
    // Items reversed so the top (last item, "c") is rendered first.
    expect(boxes.map((b) => b.textContent)).toEqual(["c", "b", "a"]);

    unmount();
  });

  test("renders an empty placeholder for missing items", () => {
    const { container, unmount } = render(
      <StackView model={{ kind: "stack", data: {} }} />
    );
    expect(valueBoxes(container)).toHaveLength(0);
    expect(container.textContent).toContain("empty");
    unmount();
  });
});

describe("StackView - TOP end marker (R10)", () => {
  test("shows a visible TOP marker beside the top cell", () => {
    const model = { kind: "stack", data: { items: ["a", "b"], top: 1 }, changedKeys: [] };
    const { container, unmount } = render(<StackView model={model} />);

    const topMarkers = Array.from(container.querySelectorAll("span")).filter(
      (s) => s.textContent === "TOP"
    );
    // A TOP span renders per row; exactly one is visible (accent), others transparent.
    const visible = topMarkers.filter((s) => isAccent(s.style.color));
    expect(visible).toHaveLength(1);

    unmount();
  });
});

describe("StackView - changed top accent styling (R11)", () => {
  test("highlights the top cell when changedKeys contains 'top'", () => {
    const model = { kind: "stack", data: { items: ["a", "b", "c"], top: 2 }, changedKeys: ["top"] };
    const { container, unmount } = render(<StackView model={model} />);

    const boxes = valueBoxes(container);
    // First rendered box is the top ("c") and should be accented.
    expect(isAccent(boxes[0].style.color)).toBe(true);
    expect(boxes[0].textContent).toBe("c");
    // Non-top cells are not accented.
    expect(isAccent(boxes[1].style.color)).toBe(false);
    expect(isAccent(boxes[2].style.color)).toBe(false);

    unmount();
  });

  test("no accent when changedKeys is empty", () => {
    const model = { kind: "stack", data: { items: ["a", "b"], top: 1 }, changedKeys: [] };
    const { container, unmount } = render(<StackView model={model} />);

    const boxes = valueBoxes(container);
    expect(boxes.some((b) => isAccent(b.style.color))).toBe(false);

    unmount();
  });
});
