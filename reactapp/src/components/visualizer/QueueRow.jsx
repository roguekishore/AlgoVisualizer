import React from "react";
import { cn } from "../../lib/utils";
import { ArrowRightLeft } from "lucide-react";
import { Separator } from "../ui/separator";

/**
 * QueueRow — horizontal FIFO queue.
 *
 * Clean card, front element accented, optional front/back labels.
 */
const QueueRow = ({
  items = [],
  getItemClass,
  showLabels = true,
  title = "Queue",
}) => {
  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[13px] font-medium text-foreground">{title}</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">
          size {items.length}
        </span>
      </div>
      <Separator />

      <div className="p-4 overflow-x-auto">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">Empty</p>
        ) : (
          <div className="flex items-center gap-1.5">
            {items.map((item, i) => {
              const itemClass = getItemClass
                ? getItemClass(item, i)
                : i === 0
                ? "bg-primary/10 border-primary text-foreground scale-105"
                : "bg-muted border-border text-foreground";

              return (
                <div key={i} className="flex flex-col items-center gap-1 shrink-0">
                  {showLabels && i === 0 && (
                    <span className="text-[10px] font-mono text-primary font-medium">Front</span>
                  )}
                  {showLabels && i === items.length - 1 && i !== 0 && (
                    <span className="text-[10px] font-mono text-muted-foreground font-medium">Back</span>
                  )}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-md border flex items-center justify-center font-mono text-sm font-medium transition-all",
                      itemClass
                    )}
                  >
                    {typeof item === "object" ? item.value ?? item : item}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default QueueRow;
