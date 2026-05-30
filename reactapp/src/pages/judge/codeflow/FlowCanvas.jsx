import React from "react";
import { V, MONO } from "../../../components/visualizer/theme";
import FlowBlock from "./FlowBlock";

/**
 * FlowCanvas — Renders the {@link BlockNode} tree as nested visual blocks starting
 * from the root `program` block. Active blocks (the current step's block plus its
 * ancestors) are highlighted, and hovering a block drives the bidirectional source
 * highlight via {@link CodeFlowContext}.
 *
 * @typedef {import("./flowResolvers").BlockNode} BlockNode
 * @typedef {import("./flowResolvers").TraceStep} TraceStep
 *
 * @param {Object} props
 * @param {BlockNode | null} props.blockTree         - root block of the tree
 * @param {Set<string>} props.activeBlockIds         - ids active at the current step
 * @param {TraceStep | null} [props.currentStep]     - current step, for loop iteration counts
 */
export default function FlowCanvas({ blockTree, activeBlockIds, currentStep = null }) {
  if (!blockTree) {
    return (
      <div
        style={{
          fontFamily: MONO,
          fontSize: 12,
          color: V.dim,
          padding: 16,
        }}
      >
        No block tree to display.
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: MONO,
        padding: 12,
        background: V.bg,
        overflow: "auto",
      }}
    >
      <FlowBlock
        node={blockTree}
        activeBlockIds={activeBlockIds instanceof Set ? activeBlockIds : new Set()}
        depth={0}
        currentStep={currentStep}
      />
    </div>
  );
}
