import React from "react";
import { cn } from "../../lib/utils";
import { Separator } from "../ui/separator";
import { Layers } from "lucide-react";

/**
 * CallStackView — recursion call-stack visualizer.
 *
 * Renders frames in reverse order (most recent on top) with
 * active-frame highlighting using primary tint.
 */

const CallStackView = ({
  frames = [],
  activeIndex = -1,
  title = "Call Stack",
  className,
}) => {
  if (!frames.length) return null;

  return (
    <div className={cn("rounded-lg border bg-card", className)}>
      {/* header */}
      <div className="flex items-center gap-2 px-4 py-2.5">
        <Layers className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[13px] font-medium text-foreground">{title}</span>
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">
          {frames.length} frame{frames.length !== 1 && "s"}
        </span>
      </div>

      <Separator />

      {/* stack frames — top = most recent */}
      <div className="px-4 py-3 space-y-1.5">
        {[...frames].reverse().map((frame, i) => {
          const originalIdx = frames.length - 1 - i;
          const isActive = originalIdx === activeIndex;

          return (
            <div
              key={originalIdx}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md border text-sm font-mono transition-colors",
                isActive
                  ? "bg-primary/10 border-primary text-foreground"
                  : "bg-muted/30 border-transparent text-muted-foreground"
              )}
            >
              {/* depth indicator */}
              <span className="text-[10px] tabular-nums opacity-60 w-4 text-right">
                {originalIdx}
              </span>

              {/* frame name / label */}
              <span className="truncate flex-1">
                {typeof frame === "string" ? frame : frame.label ?? `frame(${originalIdx})`}
              </span>

              {/* optional value */}
              {typeof frame === "object" && frame.value !== undefined && (
                <span className="text-xs text-emerald-500 font-semibold tabular-nums">
                  {String(frame.value)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CallStackView;
