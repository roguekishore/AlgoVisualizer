import React from "react";
import { cn } from "../../lib/utils";
import { Share2 } from "lucide-react";
import { Separator } from "../ui/separator";

/**
 * GraphCanvas — SVG edges + DOM node divs for graph visualizations.
 *
 * Clean card, no shadow. Uses relative positioning for nodes.
 */
const GraphCanvas = ({
  nodes = [],
  edges = [],
  positions = new Map(),
  getNodeClass,
  getEdgeStyle,
  directed = false,
  width = 600,
  height = 400,
  title = "Graph",
  legend,
}) => {
  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center gap-2 px-4 py-2.5">
        <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[13px] font-medium text-foreground">{title}</span>
      </div>
      <Separator />

      <div className="p-4 overflow-auto">
        <div className="relative mx-auto" style={{ width, height }}>
          {/* SVG for edges */}
          <svg className="absolute inset-0" width={width} height={height}>
            {directed && (
              <defs>
                <marker id="viz-arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" className="fill-muted-foreground" />
                </marker>
              </defs>
            )}
            {edges.map((edge, i) => {
              const from = positions.get(edge.from);
              const to = positions.get(edge.to);
              if (!from || !to) return null;
              const style = getEdgeStyle ? getEdgeStyle(edge) : {};
              return (
                <g key={i}>
                  <line
                    x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    className={cn("stroke-border transition-colors", style.className)}
                    strokeWidth={style.strokeWidth ?? 1.5}
                    markerEnd={directed ? "url(#viz-arrowhead)" : undefined}
                  />
                  {edge.weight != null && (
                    <text
                      x={(from.x + to.x) / 2}
                      y={(from.y + to.y) / 2 - 6}
                      textAnchor="middle"
                      className="fill-muted-foreground text-[10px] font-mono"
                    >
                      {edge.weight}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* DOM nodes */}
          {nodes.map((nodeId) => {
            const pos = positions.get(nodeId);
            if (!pos) return null;
            const nodeClass = getNodeClass ? getNodeClass(nodeId) : "bg-muted text-foreground border-border";
            return (
              <div
                key={nodeId}
                className={cn(
                  "absolute w-9 h-9 -ml-[18px] -mt-[18px] rounded-full flex items-center justify-center text-xs font-mono font-semibold border transition-colors",
                  nodeClass
                )}
                style={{ left: pos.x, top: pos.y }}
              >
                {nodeId}
              </div>
            );
          })}
        </div>
        {legend && <div className="mt-3">{legend}</div>}
      </div>
    </div>
  );
};

export default GraphCanvas;
