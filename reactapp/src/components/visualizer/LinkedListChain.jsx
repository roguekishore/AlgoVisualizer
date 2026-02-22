import React from "react";
import { cn } from "../../lib/utils";
import { ArrowRight } from "lucide-react";

/**
 * LinkedListChain — horizontal chain of linked-list nodes with arrows.
 *
 * Clean border boxes, subtle arrows, no shadow.
 */
const LinkedListChain = ({
  nodes = [],
  getNodeClass,
  externalPointers = [],
  title = "Linked List",
}) => {
  return (
    <div className="rounded-lg border bg-card px-4 py-4">
      <span className="text-[13px] font-medium text-foreground mb-4">{title}</span>

      <div className="flex items-center gap-0 overflow-x-auto pb-2">
        {nodes.map((node, i) => {
          const nodeClass = getNodeClass
            ? getNodeClass(node)
            : "bg-muted border-border text-foreground";

          // Check for external pointer labels
          const pointerLabels = externalPointers
            .filter((p) => p.targetId === node.id)
            .map((p) => p.label);

          return (
            <React.Fragment key={node.id ?? i}>
              <div className="flex flex-col items-center gap-1 shrink-0">
                {/* Pointer labels above */}
                {pointerLabels.length > 0 && (
                  <div className="flex gap-1">
                    {pointerLabels.map((label) => (
                      <span
                        key={label}
                        className="text-[10px] font-mono font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}
                {/* Node box */}
                <div
                  className={cn(
                    "w-12 h-12 rounded-md border flex items-center justify-center font-mono font-semibold text-sm transition-colors",
                    nodeClass
                  )}
                >
                  {node.value}
                </div>
              </div>
              {/* Arrow */}
              {i < nodes.length - 1 && (
                <ArrowRight className="h-4 w-4 text-muted-foreground mx-1 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
        {/* Null terminator */}
        <div className="flex items-center gap-1 shrink-0 ml-1">
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground">null</span>
        </div>
      </div>
    </div>
  );
};

export default LinkedListChain;
