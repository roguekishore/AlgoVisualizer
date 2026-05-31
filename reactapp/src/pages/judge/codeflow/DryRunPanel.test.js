import React, { act } from "react";
import { createRoot } from "react-dom/client";
import DryRunPanel from "./DryRunPanel";
import { V } from "../../../components/visualizer/theme";

// Unit tests for the DryRunPanel parallel dry-run worksheet window.
//
// Coverage:
//   - Renders one DataStructureView (one WorksheetCell) per in-scope variable
//     for a given step.
//   - Updates the rendered structures when the `step` prop changes.
//   - Empty-vars state renders the "No variables in scope" placeholder.
//   - StaticOnly trace status renders the "Static view only" notice.
//
// _Requirements: R12_

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
    rerender(next) {
      act(() => root.render(next));
    },
    unmount() {
      act(() => root.unmount());
      container.remove();
    },
  };
}

/**
 * Locate the worksheet's variable grid: the single div whose layout is a CSS
 * grid. Its direct children are the per-variable WorksheetCells, so its child
 * count equals the number of rendered DataStructureViews.
 */
function findVarGrid(container) {
  return Array.from(container.querySelectorAll("div")).find(
    (el) => el.style.display === "grid",
  );
}

/** Count the per-variable worksheet cells (one DataStructureView each). */
function cellCount(container) {
  const grid = findVarGrid(container);
  return grid ? grid.children.length : 0;
}

/** No-op handlers shared by the playback control props. */
const handlers = {
  onForward() {},
  onBackward() {},
  onPlayPause() {},
  onReset() {},
  onSpeedChange() {},
};

/** Build a minimal scalar VarSnapshot the value model will normalize. */
function scalarVar(name, value) {
  return { name, type: "int", scope: "main", value: String(value), changed: false };
}

/** Build a ready trace with the given per-step var arrays. */
function buildTrace(stepVars, extra = {}) {
  return {
    blockTree: { id: "root", children: [] },
    status: "Trace",
    inputTokens: [],
    steps: stepVars.map((vars, i) => ({ line: i + 1, vars })),
    ...extra,
  };
}

describe("DryRunPanel - one DataStructureView per in-scope variable (R12)", () => {
  test("renders exactly one worksheet cell per variable for the current step", () => {
    const trace = buildTrace([
      [scalarVar("a", 1), scalarVar("b", 2), scalarVar("c", 3)],
    ]);

    const { container, unmount } = render(
      <DryRunPanel
        trace={trace}
        status="ready"
        step={0}
        totalSteps={1}
        playing={false}
        speed={200}
        {...handlers}
      />,
    );

    // Three in-scope variables => three DataStructureView cells.
    expect(cellCount(container)).toBe(3);

    // Each variable name is rendered in its cell.
    expect(container.textContent).toContain("a");
    expect(container.textContent).toContain("b");
    expect(container.textContent).toContain("c");

    unmount();
  });

  test("renders only the variables in scope at the current step", () => {
    const trace = buildTrace([
      [scalarVar("a", 1), scalarVar("b", 2)],
      [scalarVar("a", 1)],
    ]);

    const { container, unmount } = render(
      <DryRunPanel
        trace={trace}
        status="ready"
        step={1}
        totalSteps={2}
        playing={false}
        speed={200}
        {...handlers}
      />,
    );

    // Step 1 has a single in-scope variable.
    expect(cellCount(container)).toBe(1);

    unmount();
  });
});

describe("DryRunPanel - updates structures when step changes (R12)", () => {
  test("re-rendering with a different step prop updates the rendered values", () => {
    const trace = buildTrace([
      [scalarVar("a", 10)],
      [scalarVar("a", 20), scalarVar("b", 99)],
    ]);

    const { container, rerender, unmount } = render(
      <DryRunPanel
        trace={trace}
        status="ready"
        step={0}
        totalSteps={2}
        playing={false}
        speed={200}
        {...handlers}
      />,
    );

    // Step 0: one variable showing value 10.
    expect(cellCount(container)).toBe(1);
    expect(container.textContent).toContain("10");
    expect(container.textContent).not.toContain("20");

    // Advance to step 1: structures must reflect the new step.
    rerender(
      <DryRunPanel
        trace={trace}
        status="ready"
        step={1}
        totalSteps={2}
        playing={false}
        speed={200}
        {...handlers}
      />,
    );

    expect(cellCount(container)).toBe(2);
    expect(container.textContent).toContain("20");
    expect(container.textContent).toContain("99");
    expect(container.textContent).not.toContain("10");

    unmount();
  });
});

describe("DryRunPanel - empty-vars state (R12)", () => {
  test("renders the placeholder when no variables are in scope", () => {
    const trace = buildTrace([[]]);

    const { container, unmount } = render(
      <DryRunPanel
        trace={trace}
        status="ready"
        step={0}
        totalSteps={1}
        playing={false}
        speed={200}
        {...handlers}
      />,
    );

    // No grid of cells; the empty placeholder is shown instead.
    expect(cellCount(container)).toBe(0);
    expect(container.textContent).toContain("No variables in scope");

    unmount();
  });
});

describe("DryRunPanel - StaticOnly state (R12)", () => {
  test("renders the StaticOnly notice when the trace status is StaticOnly", () => {
    const trace = buildTrace([[scalarVar("a", 1)]], {
      status: "StaticOnly",
      error: "instrumentation failed",
    });

    const { container, unmount } = render(
      <DryRunPanel
        trace={trace}
        status="ready"
        step={0}
        totalSteps={1}
        playing={false}
        speed={200}
        {...handlers}
      />,
    );

    // The amber "Static view only" banner is present.
    expect(container.textContent).toContain("Static view only");
    expect(container.textContent).toContain("instrumentation failed");

    unmount();
  });
});
