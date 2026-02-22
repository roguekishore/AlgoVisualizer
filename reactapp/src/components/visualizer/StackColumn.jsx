import React from "react";
import { cn } from "../../lib/utils";
import { Layers } from "lucide-react";
import { Separator } from "../ui/separator";

/**
 * StackColumn — vertical LIFO stack.
 *
 * Clean card, items stacked bottom-up, top element accented.
 */
const StackColumn = ({
  items = [],
  getItemClass,
  maxVisible = 8,
  title = "Stack",
}) => {
  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Layers className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[13px] font-medium text-foreground">{title}</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">
          size {items.length}
        </span>
      </div>
      <Separator />

      <div
        className="flex flex-col-reverse gap-1.5 p-4 overflow-y-auto"
        style={{ maxHeight: `${maxVisible * 44}px` }}
      >
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">Empty</p>
        ) : (
          items.map((item, i) => {
            const itemClass = getItemClass
              ? getItemClass(item, i)
              : i === 0
              ? "bg-primary/10 border-primary text-foreground"
              : "bg-muted border-border text-foreground";

            return (
              <div
                key={i}
                className={cn(
                  "px-4 py-2 rounded-md border font-mono text-sm text-center transition-colors",
                  itemClass
                )}
              >
                {typeof item === "object" ? item.value ?? JSON.stringify(item) : item}
              </div>
            );
          })
        )}
      </div>

      {items.length > 0 && (
        <div className="px-4 pb-2">
          <div className="text-[10px] text-muted-foreground text-center border-t border-dashed border-border pt-1.5">
            Base
          </div>
        </div>
      )}
    </div>
  );
};

export default StackColumn;
