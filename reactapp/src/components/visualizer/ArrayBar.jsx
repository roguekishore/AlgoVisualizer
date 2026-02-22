import React from "react";
import { cn } from "../../lib/utils";
import { BarChart3 } from "lucide-react";
import { Separator } from "../ui/separator";
import VisualizerPointer from "../VisualizerPointer";

/**
 * ArrayBar — horizontal row of value boxes with optional pointers.
 *
 * Clean card, no shadow, minimal border boxes per element.
 */
const ArrayBar = ({
  items = [],
  containerId = "array-container",
  title,
  getStyle,
  pointers = [],
  cellSize = 3.2,
  showIndex = false,
}) => {
  const gap = 0.35;

  return (
    <div className="rounded-lg border bg-card">
      {title && (
        <>
          <div className="flex items-center gap-2 px-4 py-2.5">
            <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[13px] font-medium text-foreground">{title}</span>
          </div>
          <Separator />
        </>
      )}

      <div className="flex justify-center items-end min-h-[120px] py-5 px-4 overflow-x-auto">
        <div
          id={containerId}
          className="relative transition-all"
          style={{
            width: `${items.length * (cellSize + gap)}rem`,
            height: `${cellSize}rem`,
          }}
        >
          {/* Boxes */}
          {items.map((item, index) => {
            const value = typeof item === "object" ? item.value : item;
            const key = typeof item === "object" ? item.id ?? index : index;
            const customClass = getStyle
              ? getStyle(item, index)
              : "bg-secondary text-secondary-foreground";

            return (
              <div
                key={key}
                id={`${containerId}-element-${index}`}
                className={cn(
                  "absolute flex flex-col items-center justify-center rounded border font-mono text-sm font-medium transition-all duration-500 ease-in-out",
                  customClass
                )}
                style={{
                  width: `${cellSize}rem`,
                  height: `${cellSize}rem`,
                  left: `${index * (cellSize + gap)}rem`,
                }}
              >
                {value}
                {showIndex && (
                  <span className="text-[9px] opacity-50 mt-0.5">{index}</span>
                )}
              </div>
            );
          })}

          {/* Pointers */}
          {pointers.map(
            (ptr, i) =>
              ptr.index != null && (
                <VisualizerPointer
                  key={i}
                  index={ptr.index}
                  containerId={containerId}
                  color={ptr.color ?? "amber"}
                  label={ptr.label ?? ""}
                />
              )
          )}
        </div>
      </div>
    </div>
  );
};

export default ArrayBar;
