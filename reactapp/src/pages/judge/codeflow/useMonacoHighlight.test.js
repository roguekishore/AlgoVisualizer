import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { useMonacoHighlight } from "./useMonacoHighlight";

// Mark this as an act-aware environment so effects flush inside act(...).
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

/**
 * Minimal renderHook helper built on react-dom/client + act (matching the
 * convention used by useCodeFlow.test.js, since @testing-library/react and
 * react-test-renderer are not installed). Supports re-rendering with new props
 * so we can drive the hook's range inputs over time.
 */
function renderHook(callback, initialProps) {
  const result = { current: undefined };
  let props = initialProps;
  let container;
  let root;

  function Probe() {
    result.current = callback(props);
    return null;
  }

  act(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    root.render(React.createElement(Probe));
  });

  return {
    result,
    rerender(nextProps) {
      props = nextProps;
      act(() => {
        root.render(React.createElement(Probe));
      });
    },
    unmount() {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

/**
 * Mock Monaco editor exposing the modern DecorationsCollection API. The
 * collection replaces its full decoration set on each `set`, which mirrors the
 * real Monaco behavior the hook relies on.
 */
function createMockEditorWithCollection() {
  const state = { decorations: [], revealedLines: [], cleared: false };

  const collection = {
    set(decorations) {
      state.decorations = decorations;
      state.cleared = false;
    },
    clear() {
      state.decorations = [];
      state.cleared = true;
    },
  };

  const editor = {
    createDecorationsCollection: jest.fn((initial = []) => {
      state.decorations = initial;
      return collection;
    }),
    revealLineInCenter: jest.fn((line) => {
      state.revealedLines.push(line);
    }),
  };

  return { editor, state };
}

/**
 * Mock Monaco editor exposing only the legacy deltaDecorations API to exercise
 * the hook's fallback path.
 */
function createMockEditorWithDelta() {
  const state = { decorations: [], revealedLines: [] };
  let nextId = 1;

  const editor = {
    deltaDecorations: jest.fn((oldIds, newDecorations) => {
      // Apply replacing the full set, returning fresh ids for the new ones.
      state.decorations = newDecorations;
      return newDecorations.map(() => `dec-${nextId++}`);
    }),
    revealLineInCenter: jest.fn((line) => {
      state.revealedLines.push(line);
    }),
  };

  return { editor, state };
}

const range = (startLine, endLine = startLine) => ({
  startLine,
  startCol: 1,
  endLine,
  endCol: 1,
});

const classNames = (decorations) =>
  decorations.map((d) => d.options.className);

describe("useMonacoHighlight (modern DecorationsCollection API)", () => {
  test("applies at most one hover and one exec region", () => {
    const { editor, state } = createMockEditorWithCollection();
    const editorRef = { current: editor };

    const { unmount } = renderHook(
      ({ hover, exec }) => useMonacoHighlight(editorRef, hover, exec),
      { hover: range(3, 5), exec: range(4) },
    );

    expect(state.decorations).toHaveLength(2);
    const names = classNames(state.decorations);
    expect(names.filter((n) => n === "cfv-hover-highlight")).toHaveLength(1);
    expect(names.filter((n) => n === "cfv-exec-highlight")).toHaveLength(1);

    unmount();
  });

  test("only a hover range yields exactly one hover decoration", () => {
    const { editor, state } = createMockEditorWithCollection();
    const editorRef = { current: editor };

    const { unmount } = renderHook(
      ({ hover, exec }) => useMonacoHighlight(editorRef, hover, exec),
      { hover: range(2, 8), exec: null },
    );

    expect(state.decorations).toHaveLength(1);
    expect(classNames(state.decorations)).toEqual(["cfv-hover-highlight"]);

    unmount();
  });

  test("both-null removes all decorations", () => {
    const { editor, state } = createMockEditorWithCollection();
    const editorRef = { current: editor };

    const { rerender, unmount } = renderHook(
      ({ hover, exec }) => useMonacoHighlight(editorRef, hover, exec),
      { hover: range(3, 5), exec: range(4) },
    );

    expect(state.decorations).toHaveLength(2);

    // Clear both ranges -> no feature-owned decorations remain.
    rerender({ hover: null, exec: null });
    expect(state.decorations).toHaveLength(0);

    unmount();
  });

  test("reveals the executing line for the active range", () => {
    const { editor, state } = createMockEditorWithCollection();
    const editorRef = { current: editor };

    const { unmount } = renderHook(
      ({ hover, exec }) => useMonacoHighlight(editorRef, hover, exec),
      { hover: null, exec: range(7) },
    );

    expect(state.revealedLines).toContain(7);

    unmount();
  });

  test("removes all decorations on unmount (no leaks across problem switches)", () => {
    const { editor, state } = createMockEditorWithCollection();
    const editorRef = { current: editor };

    const { unmount } = renderHook(
      ({ hover, exec }) => useMonacoHighlight(editorRef, hover, exec),
      { hover: range(1, 2), exec: range(2) },
    );

    expect(state.decorations).toHaveLength(2);

    unmount();

    // After unmount the feature-owned collection is cleared.
    expect(state.decorations).toHaveLength(0);
    expect(state.cleared).toBe(true);
  });
});

describe("useMonacoHighlight (legacy deltaDecorations API)", () => {
  test("applies at most one hover and one exec region", () => {
    const { editor, state } = createMockEditorWithDelta();
    const editorRef = { current: editor };

    const { unmount } = renderHook(
      ({ hover, exec }) => useMonacoHighlight(editorRef, hover, exec),
      { hover: range(3, 5), exec: range(4) },
    );

    expect(state.decorations).toHaveLength(2);
    const names = classNames(state.decorations);
    expect(names.filter((n) => n === "cfv-hover-highlight")).toHaveLength(1);
    expect(names.filter((n) => n === "cfv-exec-highlight")).toHaveLength(1);

    unmount();
  });

  test("both-null removes all decorations", () => {
    const { editor, state } = createMockEditorWithDelta();
    const editorRef = { current: editor };

    const { rerender, unmount } = renderHook(
      ({ hover, exec }) => useMonacoHighlight(editorRef, hover, exec),
      { hover: range(3, 5), exec: range(4) },
    );

    expect(state.decorations).toHaveLength(2);

    rerender({ hover: null, exec: null });
    expect(state.decorations).toHaveLength(0);

    unmount();
  });

  test("removes all decorations on unmount (no leaks across problem switches)", () => {
    const { editor, state } = createMockEditorWithDelta();
    const editorRef = { current: editor };

    const { unmount } = renderHook(
      ({ hover, exec }) => useMonacoHighlight(editorRef, hover, exec),
      { hover: range(1, 2), exec: range(2) },
    );

    expect(state.decorations).toHaveLength(2);

    unmount();
    expect(state.decorations).toHaveLength(0);
  });
});

describe("useMonacoHighlight (inert when no editor)", () => {
  test("does not throw when editorRef is null", () => {
    const editorRef = { current: null };

    expect(() => {
      const { unmount } = renderHook(
        ({ hover, exec }) => useMonacoHighlight(editorRef, hover, exec),
        { hover: range(1), exec: range(1) },
      );
      unmount();
    }).not.toThrow();
  });
});
