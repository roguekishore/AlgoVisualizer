import React, { act } from "react";
import { createRoot } from "react-dom/client";
import ScalarChip from "./ScalarChip";
import { V } from "../../../../components/visualizer/theme";

// Unit tests for the ScalarChip renderer.
//
// Coverage:
//   - Renders a `name = value` chip.
//   - Flashes (accent color) when the model is marked changed.
//   - String kinds are quoted; scalars are not.
//   - Degrades gracefully on missing/garbled input.
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

describe("ScalarChip - name = value rendering (R10)", () => {
  test("renders the name and value", () => {
    const model = { kind: "scalar", name: "count", data: "42", changed: false };
    const { container, unmount } = render(<ScalarChip model={model} />);

    expect(container.textContent).toContain("count");
    expect(container.textContent).toContain("42");
    expect(container.textContent).toContain("=");

    unmount();
  });

  test("quotes string-kind values", () => {
    const model = { kind: "string", name: "s", data: "hi", changed: false };
    const { container, unmount } = render(<ScalarChip model={model} />);

    expect(container.textContent).toContain('"hi"');

    unmount();
  });
});

describe("ScalarChip - change flashing (R11)", () => {
  test("uses accent color when changed", () => {
    const model = { kind: "scalar", name: "n", data: "7", changed: true };
    const { container, unmount } = render(<ScalarChip model={model} />);

    expect(isAccent(container.firstChild.style.color)).toBe(true);

    unmount();
  });

  test("uses non-accent text color when unchanged", () => {
    const model = { kind: "scalar", name: "n", data: "7", changed: false };
    const { container, unmount } = render(<ScalarChip model={model} />);

    expect(isAccent(container.firstChild.style.color)).toBe(false);

    unmount();
  });
});

describe("ScalarChip - graceful degradation", () => {
  test("does not throw on missing model", () => {
    expect(() => {
      const { unmount } = render(<ScalarChip model={null} />);
      unmount();
    }).not.toThrow();
  });
});
