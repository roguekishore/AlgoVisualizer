import React from "react";
import { V, MONO } from "../../../components/visualizer/theme";
import { useCodeFlowContext } from "./CodeFlowContext";

/**
 * FlowBlock — Recursive visual block for the Code Flow Visualizer.
 *
 * Renders a single {@link BlockNode} and (recursively) its children, indenting by
 * `depth`. Blocks are styled by their {@link BlockType} using the shared visualizer
 * theme tokens, and receive active styling when their id is in `activeBlockIds`
 * (the current step's block plus its ancestors). Hovering a block emits the
 * bidirectional highlight signal through {@link CodeFlowContext} so the Monaco
 * editor highlights the corresponding source range.
 *
 * @typedef {import("./flowResolvers").BlockNode} BlockNode
 * @typedef {import("./flowResolvers").TraceStep} TraceStep
 *
 * @param {Object} props
 * @param {BlockNode} props.node                  - block to render
 * @param {Set<string>} props.activeBlockIds      - ids active at the current step
 * @param {number} props.depth                    - nesting depth (drives indentation)
 * @param {TraceStep | null} [props.currentStep]  - current step, for loop iteration counts
 */
export default function FlowBlock({ node, activeBlockIds, depth = 0, currentStep = null }) {
  const { setHovered } = useCodeFlowContext();

  if (!node) return null;

  const isActive = activeBlockIds instanceof Set && activeBlockIds.has(node.id);
  const style = BLOCK_STYLES[node.type] || BLOCK_STYLES.block;

  // Iteration count is shown for loop blocks: prefer the live count carried on the
  // current step when it targets this loop, otherwise omit it.
  const iteration =
    node.type === "loop" &&
    currentStep &&
    currentStep.blockId === node.id &&
    typeof currentStep.iteration === "number"
      ? currentStep.iteration
      : null;

  const handleEnter = () => setHovered({ source: "block", blockId: node.id });
  const handleLeave = () => setHovered(null);

  const children = Array.isArray(node.children) ? node.children : [];

  return (
    <div style={{ marginLeft: depth > 0 ? 16 : 0 }}>
      <div
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 10px",
          marginBottom: 4,
          cursor: "pointer",
          background: isActive ? V.accentDim : style.bg,
          borderLeft: `3px solid ${isActive ? V.accent : style.border}`,
          border: `1px solid ${isActive ? V.accentMid : V.border}`,
          borderLeftWidth: 3,
          boxShadow: isActive ? `0 0 10px ${V.accentDim}` : "none",
          transition: "background 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
        }}
      >
        {/* type tag */}
        <span
          style={{
            fontFamily: MONO,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: isActive ? V.accent : style.tag,
            flexShrink: 0,
          }}
        >
          {node.type}
        </span>

        {/* label */}
        <span
          style={{
            fontFamily: MONO,
            fontSize: 12,
            color: isActive ? V.textBright : V.text,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            flex: 1,
          }}
          title={node.label}
        >
          {node.label}
        </span>

        {/* loop iteration count */}
        {iteration != null && (
          <span
            style={{
              fontFamily: MONO,
              fontSize: 10,
              fontWeight: 700,
              color: V.accent,
              background: V.accentDim,
              border: `1px solid ${V.accentMid}`,
              padding: "1px 6px",
              borderRadius: 2,
              flexShrink: 0,
            }}
          >
            ×{iteration}
          </span>
        )}
      </div>

      {children.length > 0 && (
        <div>
          {children.map((child) => (
            <FlowBlock
              key={child.id}
              node={child}
              activeBlockIds={activeBlockIds}
              depth={depth + 1}
              currentStep={currentStep}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Per-BlockType visual tokens, sourced from the shared visualizer theme.
 * @type {Record<string, {bg: string, border: string, tag: string}>}
 */
const BLOCK_STYLES = {
  program: { bg: V.surface, border: V.borderHi, tag: V.dim },
  function: { bg: V.greenDim, border: V.green, tag: V.green },
  loop: { bg: V.purpleDim, border: V.purple, tag: V.purple },
  conditional: { bg: V.amberDim, border: V.amber, tag: V.amber },
  declaration: { bg: V.blueDim, border: V.blue, tag: V.blue },
  assignment: { bg: V.cyanDim, border: V.cyan, tag: V.cyan },
  call: { bg: V.greenDim, border: V.green, tag: V.green },
  io: { bg: V.accentDim, border: V.accentMid, tag: V.accent },
  return: { bg: V.redDim, border: V.red, tag: V.red },
  block: { bg: V.elevated, border: V.border, tag: V.dim },
};
