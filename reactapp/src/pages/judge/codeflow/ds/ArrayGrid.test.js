import React, { act } from "react";
import { createRoot } from "react-dom/client";
import ArrayGrid from "./ArrayGrid";
import { V } from "../../../../components/visualizer/theme";

// Unit tests for the ArrayGrid (1D + 2D) renderer.
//
// Coverage:
//   - Correct cell counts and shape (1D single row vs 2D grid of rows).
//   - Changed cells receive the acid-yellow accent styling.
//   - Pointer markers render at their target cells.
//   - Malformed/empty data degrades to an "empty" placeholder.
//
// _Requirements: R10, R11_

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

/** Render a React element into a fresh DOM container, flushing effects. */
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

/**
 * Normalize a CSS color (hex or rgb/rgba) into a whitespace-free, lower-case
 * canonical form so jsdom's rgb() serialization can be compared to theme hex
 * tokens.
 */
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

/** The value-box divs carry a `title`; this returns them in DOM order. */
const valueBoxes = (container) =>
  Array.from(container.querySelectorAll("div[title]"));

describe("ArrayGrid - 1D shape and cell count (R10)", () => {
  test("renders a single row with one cell per element", () => {
    const model = { kind: "array1d", data: ["1", "2", "3"], changedKeys: [] };
    const { container, unmount } = render(<ArrayGrid model={model} />);

    // Top-level container holds the rows; a 1D array is exactly one row.
    expect(container.firstChild.children).toHaveLength(1);
    // Three values => three cells.
    expect(valueBoxes(container)).toHaveLength(3);

    const texts = valueBoxes(container).map((b) => b.textContent);
    expect(texts).toEqual(["1", "2", "3"]);

    unmount();
  });

  test("renders an empty placeholder for missing/invalid data", () => {
    const { container, unmount } = render(
      <ArrayGrid model={{ kind: "array1d", data: null }} />
    );
    expect(valueBoxes(container)).toHaveLength(0);
    expect(container.textContent).toContain("empty");
    unmount();
  });
});

describe("ArrayGrid - 2D shape and cell count (R10)", () => {
  test("renders one row per sub-array with the correct total cell count", () => {
    const model = {
      kind: "array2d",
      data: [
        ["1", "2", "3"],
        ["4", "5", "6"],
      ],
      changedKeys: [],
    };
    const { container, unmount } = render(<ArrayGrid model={model} />);

    // Two sub-arrays => two row containers (distinguishes 2D from 1D).
    expect(container.firstChild.children).toHaveLength(2);
    // 2 x 3 grid => six cells.
    expect(valueBoxes(container)).toHaveLength(6);

    unmount();
  });
});

describe("ArrayGrid - changed cell accent styling (R11)", () => {
  test("1D: only the cell in changedKeys gets the accent color", () => {
    const model = { kind: "array1d", data: ["1", "2", "3"], changedKeys: ["1"] };
    const { container, unmount } = render(<ArrayGrid model={model} />);

    const boxes = valueBoxes(container);
    expect(isAccent(boxes[0].style.color)).toBe(false);
    expect(isAccent(boxes[1].style.color)).toBe(true);
    expect(boxes[1].style.fontWeight).toBe("700");
    expect(isAccent(boxes[2].style.color)).toBe(false);

    unmount();
  });

  test("2D: the cell at the 'r,c' key gets the accent color", () => {
    const model = {
      kind: "array2d",
      data: [
        ["1", "2"],
        ["3", "4"],
      ],
      changedKeys: ["1,0"],
    };
    const { container, unmount } = render(<ArrayGrid model={model} />);

    // Flattened DOM order: (0,0)=1, (0,1)=2, (1,0)=3, (1,1)=4 -> index 2 changed.
    const boxes = valueBoxes(container);
    const accented = boxes.filter((b) => isAccent(b.style.color));
    expect(accented).toHaveLength(1);
    expect(accented[0].textContent).toBe("3");

    unmount();
  });
});

describe("ArrayGrid - pointer markers", () => {
  test("renders pointer labels for the targeted cell", () => {
    const model = { kind: "array1d", data: ["1", "2", "3"], changedKeys: [] };
    const { container, unmount } = render(
      <ArrayGrid model={model} pointers={{ i: "2" }} />
    );

    const labels = Array.from(container.querySelectorAll("span")).map(
      (s) => s.textContent
    );
    expect(labels).toContain("i");

    unmount();
  });
});
