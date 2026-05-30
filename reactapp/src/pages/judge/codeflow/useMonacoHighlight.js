import { useEffect, useRef } from "react";
import { V } from "../../../components/visualizer/theme";

/**
 * useMonacoHighlight
 *
 * Translates the Code Flow Visualizer's shared highlight state into Monaco editor
 * decorations + reveal calls. Powers the bidirectional source <-> block highlight
 * (hover) and the current-step execution line highlight during playback.
 *
 * Responsibilities (see design.md "useMonacoHighlight"):
 * - Maintain a single decorations collection owned by this feature.
 * - Apply a `cfv-hover-highlight` region for `highlightedRange` (hovered block /
 *   resolved editor line) and a `cfv-exec-highlight` region for `activeRange`
 *   (the current step's executing line).
 * - `revealLineInCenter` for the active execution line during playback.
 * - Remove all feature-owned decorations when both ranges clear and on unmount,
 *   so nothing leaks across problem switches or tab unmounts.
 *
 * @typedef {Object} SourceRange
 * @property {number} startLine 1-based, inclusive
 * @property {number} startCol  1-based
 * @property {number} endLine   1-based, inclusive
 * @property {number} endCol    1-based
 *
 * @param {{ current: any } | null | undefined} editorRef ref to a mounted Monaco editor (inert when null)
 * @param {SourceRange | null | undefined} highlightedRange hovered block range, or null
 * @param {SourceRange | null | undefined} activeRange current-step execution line range, or null
 * @returns {void}
 */
export function useMonacoHighlight(editorRef, highlightedRange, activeRange) {
  // Holds the Monaco DecorationsCollection (modern API) when available.
  const collectionRef = useRef(null);
  // Holds decoration ids for the legacy deltaDecorations fallback.
  const decorationIdsRef = useRef([]);

  // Inject the feature CSS (driven by theme.js tokens) exactly once.
  useEffect(() => {
    ensureHighlightStyles();
  }, []);

  // Sync decorations whenever the ranges change.
  useEffect(() => {
    const editor = editorRef?.current;
    if (!editor) return;

    /** @type {Array<{range: object, options: object}>} */
    const decorations = [];

    if (highlightedRange) {
      decorations.push({
        range: toMonacoRange(highlightedRange),
        options: {
          isWholeLine: true,
          className: "cfv-hover-highlight",
          linesDecorationsClassName: "cfv-hover-gutter",
        },
      });
    }

    if (activeRange) {
      decorations.push({
        range: toMonacoRange(activeRange),
        options: {
          isWholeLine: true,
          className: "cfv-exec-highlight",
          linesDecorationsClassName: "cfv-exec-gutter",
        },
      });
    }

    applyDecorations(editor, decorations, collectionRef, decorationIdsRef);

    // Reveal the executing line during playback so it stays in view.
    if (activeRange && typeof editor.revealLineInCenter === "function") {
      editor.revealLineInCenter(activeRange.startLine);
    }
  }, [editorRef, highlightedRange, activeRange]);

  // Remove every feature-owned decoration on unmount (no leaks across problems).
  useEffect(() => {
    return () => {
      const editor = editorRef?.current;
      clearDecorations(editor, collectionRef, decorationIdsRef);
    };
    // editorRef identity is stable for the editor instance; cleanup only on unmount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/**
 * Convert a 1-based feature SourceRange into a Monaco IRange.
 * @param {SourceRange} r
 * @returns {{startLineNumber:number,startColumn:number,endLineNumber:number,endColumn:number}}
 */
function toMonacoRange(r) {
  return {
    startLineNumber: r.startLine,
    startColumn: typeof r.startCol === "number" ? r.startCol : 1,
    endLineNumber: r.endLine,
    endColumn: typeof r.endCol === "number" ? r.endCol : 1,
  };
}

/**
 * Apply the given decorations, preferring the modern DecorationsCollection API and
 * falling back to deltaDecorations on older Monaco builds. Replacing the full set
 * each time guarantees at most one hover and one exec region are present.
 */
function applyDecorations(editor, decorations, collectionRef, decorationIdsRef) {
  if (typeof editor.createDecorationsCollection === "function") {
    if (collectionRef.current) {
      collectionRef.current.set(decorations);
    } else {
      collectionRef.current = editor.createDecorationsCollection(decorations);
    }
    return;
  }

  if (typeof editor.deltaDecorations === "function") {
    decorationIdsRef.current = editor.deltaDecorations(
      decorationIdsRef.current || [],
      decorations,
    );
  }
}

/**
 * Remove all feature-owned decorations via whichever API is in use.
 */
function clearDecorations(editor, collectionRef, decorationIdsRef) {
  if (collectionRef.current) {
    if (typeof collectionRef.current.clear === "function") {
      collectionRef.current.clear();
    } else if (typeof collectionRef.current.set === "function") {
      collectionRef.current.set([]);
    }
    collectionRef.current = null;
  }

  if (
    editor &&
    typeof editor.deltaDecorations === "function" &&
    decorationIdsRef.current &&
    decorationIdsRef.current.length > 0
  ) {
    editor.deltaDecorations(decorationIdsRef.current, []);
  }
  decorationIdsRef.current = [];
}

const STYLE_ELEMENT_ID = "cfv-monaco-highlight-styles";

/**
 * Inject the `cfv-hover-highlight` / `cfv-exec-highlight` styles once, sourcing all
 * colors from the shared visualizer theme tokens (theme.js) so the highlight stays
 * on-brand with the Terminal Brutalism aesthetic. Hover uses the acid-yellow accent;
 * the executing line uses the semantic green to distinguish "running here" from
 * "you're looking here".
 */
function ensureHighlightStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ELEMENT_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ELEMENT_ID;
  style.textContent = `
.cfv-hover-highlight {
  background: ${V.accentDim};
  box-shadow: inset 3px 0 0 ${V.accent};
}
.cfv-hover-gutter {
  background: ${V.accent};
  width: 3px !important;
  margin-left: 2px;
}
.cfv-exec-highlight {
  background: ${V.greenDim};
  box-shadow: inset 3px 0 0 ${V.green};
}
.cfv-exec-gutter {
  background: ${V.green};
  width: 3px !important;
  margin-left: 2px;
}
`;
  document.head.appendChild(style);
}

export default useMonacoHighlight;
