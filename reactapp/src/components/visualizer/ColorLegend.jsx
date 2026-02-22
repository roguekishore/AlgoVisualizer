import React from "react";
import { cn } from "../../lib/utils";

/**
 * ColorLegend — a row of colored dots with labels.
 *
 * Minimal styling, muted-foreground text, small dots.
 */
const ColorLegend = ({ items = [], layout = "row" }) => {
  if (!items.length) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-x-5 gap-y-1.5 text-[11px] text-muted-foreground",
        layout === "wrap" ? "flex-wrap" : "flex-nowrap overflow-x-auto"
      )}
    >
      {items.map(({ color, label }, i) => {
        const isTw = typeof color === "string" && color.startsWith("bg-");
        return (
          <span key={i} className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span
              className={cn("w-2 h-2 rounded-sm shrink-0", isTw ? color : "")}
              style={isTw ? undefined : { backgroundColor: color }}
            />
            <span>{label}</span>
          </span>
        );
      })}
    </div>
  );
};

export default ColorLegend;
