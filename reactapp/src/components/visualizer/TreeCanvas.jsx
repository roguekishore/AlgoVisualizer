import React from "react";
import { cn } from "../../lib/utils";
import { GitBranch } from "lucide-react";
import { Separator } from "../ui/separator";

/**
 * TreeCanvas — SVG binary tree with recursive layout.
 *
 * Clean card wrapper, no shadow. SVG rendered inside.
 */

function layoutTree(node, depth = 0, x = 0, spread = 1, positions = new Map()) {
  if (!node) return positions;
  const horizontalGap = 60 * spread;
  positions.set(node, { x, y: depth * 70 + 40 });
  if (node.left) layoutTree(node.left, depth + 1, x - horizontalGap, spread * 0.55, positions);
  if (node.right) layoutTree(node.right, depth + 1, x + horizontalGap, spread * 0.55, positions);
  return positions;
}

const TreeCanvas = ({
  root,
  renderNode,
  getEdgeColor,
  width = 700,
  height = 350,
  nodeRadius = 18,
  title = "Tree",
}) => {
  if (!root) return null;

  const positions = layoutTree(root, 0, width / 2, 1);

  const renderEdges = (node) => {
    if (!node) return null;
    const parent = positions.get(node);
    if (!parent) return null;
    const edges = [];

    const drawEdge = (child) => {
      const childPos = positions.get(child);
      if (!childPos) return;
      const colorClass = getEdgeColor ? getEdgeColor(node, child) : "stroke-border";
      edges.push(
        <line
          key={`${parent.x}-${parent.y}-${childPos.x}-${childPos.y}`}
          x1={parent.x} y1={parent.y}
          x2={childPos.x} y2={childPos.y}
          className={cn("transition-colors", colorClass)}
          strokeWidth={1.5}
        />
      );
    };

    if (node.left) { drawEdge(node.left); edges.push(...(renderEdges(node.left) || [])); }
    if (node.right) { drawEdge(node.right); edges.push(...(renderEdges(node.right) || [])); }
    return edges;
  };

  const renderNodes = (node) => {
    if (!node) return null;
    const pos = positions.get(node);
    if (!pos) return null;

    const defaultNode = (
      <g key={`node-${pos.x}-${pos.y}`}>
        <circle
          cx={pos.x} cy={pos.y} r={nodeRadius}
          className="fill-muted stroke-border"
          strokeWidth={1.5}
        />
        <text
          x={pos.x} y={pos.y}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-foreground text-xs font-mono font-medium"
        >
          {node.val}
        </text>
      </g>
    );

    return (
      <>
        {renderNode ? renderNode(node, pos.x, pos.y) : defaultNode}
        {node.left && renderNodes(node.left)}
        {node.right && renderNodes(node.right)}
      </>
    );
  };

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center gap-2 px-4 py-2.5">
        <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[13px] font-medium text-foreground">{title}</span>
      </div>
      <Separator />
      <div className="p-4 overflow-auto flex justify-center">
        <svg width={width} height={height} className="overflow-visible">
          {renderEdges(root)}
          {renderNodes(root)}
        </svg>
      </div>
    </div>
  );
};

export default TreeCanvas;
