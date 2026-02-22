import React from "react";
import { cn } from "../../lib/utils";
import { CheckCircle } from "lucide-react";

/**
 * ExplanationBox — step explanation text.
 *
 * Simple mode: single line.  History mode: scrollable log.
 * Clean card border, no shadow.
 */
const ExplanationBox = ({
  explanation = "",
  finished = false,
  history,
  currentStep,
  title = "Explanation",
}) => {
  // Scrollable history mode (BFS, DFS, etc.)
  if (history && history.length > 0) {
    return (
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="px-4 py-2.5 border-b">
          <span className="text-[13px] font-medium text-foreground">{title}</span>
        </div>
        <div className="max-h-[320px] overflow-y-auto p-2 space-y-0.5">
          {history.slice(0, (currentStep ?? 0) + 1).map((step, index) => (
            <div
              key={index}
              className={cn(
                "px-3 py-1.5 rounded-md text-[13px] transition-colors",
                index === currentStep
                  ? "bg-primary/8 text-foreground"
                  : "text-muted-foreground"
              )}
              ref={
                index === currentStep
                  ? (el) => el?.scrollIntoView({ behavior: "smooth", block: "nearest" })
                  : null
              }
            >
              <div className="flex items-start gap-2">
                <span className="text-[10px] font-mono text-muted-foreground/60 mt-0.5 shrink-0">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className="leading-relaxed">{step.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Simple single-line mode
  return (
    <div className="rounded-lg border bg-card px-4 py-3">
      <span className="text-[11px] font-medium text-muted-foreground">
        {title}
      </span>
      <p className="text-[13px] text-foreground leading-relaxed mt-0.5">
        {explanation}
        {finished && (
          <CheckCircle className="inline-block ml-1.5 text-emerald-500 h-3.5 w-3.5" />
        )}
      </p>
    </div>
  );
};

export default ExplanationBox;
