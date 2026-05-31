import React, { act } from "react";
import { createRoot } from "react-dom/client";
import QueueView from "./QueueView";
import { V } from "../../../../components/visualizer/theme";

// Unit tests for the QueueView (horizontal FIFO / deque) renderer.
//
// Coverage:
//   - Correct cell count and horizontal ordering.
//   - FRONT / BACK end markers render at the correct cells.
//   - Changed ends (changedKeys "front"/"back") receive accent styling.
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

const markerTexts = (container) =>
  Array.from(container.querySelectorAll("span")).map((s) => s.textContent);

describe("QueueView - cell count and ordering (R10)", () => {
  test("renders one cell per item in front-to-back order", () => {
    const model = {
      kind: "queue",
      data: { items: ["a", "b", "c"], front: 0, back: 2 },
      changedKeys: [],
    };
    const { container, unmount } = render(<QueueView model={model} />);

    const boxes = valueBoxes(container);
    expect(boxes).toHaveLength(3);
    expect(boxes.map((b) => b.textContent)).toEqual(["a", "b", "c"]);

    unmount();
  });

  test("renders an empty placeholder for missing items", () => {
    const { container, unmount } = render(
      <QueueView model={{ kind: "queue", data: {} }} />
    );
    expect(valueBoxes(container)).toHaveLength(0);
    expect(container.textContent).toContain("empty");
    unmount();
  });
});

describe("QueueView - FRONT / BACK end markers (R10)", () => {
  test("renders FRONT and BACK markers for a multi-element queue", () => {
    const model = {
      kind: "queue",
      data: { items: ["a", "b", "c"], front: 0, back: 2 },
      changedKeys: [],
    };
    const { container, unmount } = render(<QueueView model={model} />);

    const texts = markerTexts(container);
    expect(texts).toContain("FRONT");
    expect(texts).toContain("BACK");

    unmount();
  });

  test("renders a combined F/B marker for a single-element queue", () => {
    const model = {
      kind: "queue",
      data: { items: ["only"], front: 0, back: 0 },
      changedKeys: [],
    };
    const { container, unmount } = render(<QueueView model={model} />);

    expect(markerTexts(container)).toContain("F/B");

    unmount();
  });
});

describe("QueueView - changed end accent styling (R11)", () => {
  test("highlights the back cell when changedKeys contains 'back'", () => {
    const model = {
      kind: "queue",
      data: { items: ["a", "b", "c"], front: 0, back: 2 },
      changedKeys: ["back"],
    };
    const { container, unmount } = render(<QueueView model={model} />);

    const boxes = valueBoxes(container);
    expect(isAccent(boxes[0].style.color)).toBe(false);
    expect(isAccent(boxes[2].style.color)).toBe(true);
    expect(boxes[2].textContent).toBe("c");

    unmount();
  });

  test("highlights the front cell when changedKeys contains 'front'", () => {
    const model = {
      kind: "queue",
      data: { items: ["a", "b", "c"], front: 0, back: 2 },
      changedKeys: ["front"],
    };
    const { container, unmount } = render(<QueueView model={model} />);

    const boxes = valueBoxes(container);
    expect(isAccent(boxes[0].style.color)).toBe(true);
    expect(isAccent(boxes[2].style.color)).toBe(false);

    unmount();
  });
});
