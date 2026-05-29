import { createContext, useContext, useMemo, useState } from "react";

/**
 * @typedef {Object} BlockHover
 * @property {"block"} source   - hover originated from a Flow block
 * @property {string} blockId   - id of the hovered block
 *
 * @typedef {Object} EditorHover
 * @property {"editor"} source  - hover originated from the Monaco editor
 * @property {number} line      - 1-based source line under the cursor
 *
 * Shared hover state for the bidirectional block <-> source highlight.
 * Either a block-sourced hover, an editor-sourced hover, or null when nothing
 * is hovered.
 * @typedef {BlockHover | EditorHover | null} Hovered
 */

/**
 * @typedef {Object} CodeFlowContextValue
 * @property {Hovered} hovered                       - current hover state
 * @property {(next: Hovered) => void} setHovered    - update the hover state
 * @property {Record<number, string[]>} sourceMap    - line -> blockId[] (outermost -> innermost)
 */

/** @type {CodeFlowContextValue} */
const DEFAULT_VALUE = {
  hovered: null,
  setHovered: () => {},
  sourceMap: {},
};

const CodeFlowContext = createContext(DEFAULT_VALUE);

/**
 * Provides shared hover state and the source map to the Flow tab subtree so
 * that Flow blocks and the Monaco highlighter stay in sync.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {Record<number, string[]>} [props.sourceMap] - line -> blockId[] from the trace
 */
export function CodeFlowProvider({ children, sourceMap }) {
  const [hovered, setHovered] = useState(/** @type {Hovered} */ (null));

  const value = useMemo(
    () => ({ hovered, setHovered, sourceMap: sourceMap || {} }),
    [hovered, sourceMap],
  );

  return (
    <CodeFlowContext.Provider value={value}>
      {children}
    </CodeFlowContext.Provider>
  );
}

/**
 * Access the shared Code Flow hover state and source map.
 * Must be used within a {@link CodeFlowProvider}.
 *
 * @returns {CodeFlowContextValue}
 */
export function useCodeFlowContext() {
  const context = useContext(CodeFlowContext);

  if (context === undefined)
    throw new Error("useCodeFlowContext must be used within a CodeFlowProvider");

  return context;
}

export default CodeFlowContext;
