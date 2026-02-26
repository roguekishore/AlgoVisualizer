import React, { lazy, Suspense, useMemo } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { cn } from "../../lib/utils";

/* ── judgeId → visualizer lazy component map ── */
const VISUALIZER_MAP = {
  "find-max-element": lazy(() =>
    import("../algorithms/Arrays/FindMaxElement")
  ),
  "find-min-element": lazy(() =>
    import("../algorithms/Arrays/FindMinElement")
  ),
};

/**
 * VisualizerDrawer
 *
 * A collapsible panel that sits above the main workspace in the JudgePage.
 * Slides open/closed with a smooth height transition. Renders the
 * algorithm visualizer that corresponds to the current judge problem.
 *
 * Props:
 *   problemId   — judge problem ID (e.g. "find-max-element")
 *   isOpen      — whether the drawer is expanded
 *   onToggle    — callback to toggle open/close
 *   testArray   — optional number[] parsed from the active test case input
 */
export default function VisualizerDrawer({
  problemId,
  isOpen,
  onToggle,
  testArray,
}) {
  const VisualizerComponent = useMemo(
    () => VISUALIZER_MAP[problemId] ?? null,
    [problemId]
  );

  /* No visualizer for this problem — render nothing */
  if (!VisualizerComponent) return null;

  return (
    <div className="flex flex-col flex-shrink-0 border-b border-border">
      {/* ── Toggle bar ── */}
      <button
        onClick={onToggle}
        className={cn(
          "flex items-center gap-2 h-8 px-3 text-xs font-medium transition-colors",
          "bg-card hover:bg-accent text-muted-foreground hover:text-foreground",
          "select-none"
        )}
      >
        {isOpen ? (
          <EyeOff className="h-3.5 w-3.5" />
        ) : (
          <Eye className="h-3.5 w-3.5" />
        )}
        <span>Visualizer</span>
        <Badge
          variant="outline"
          className="text-[9px] py-0 px-1.5 border-[#5542FF]/40 text-[#5542FF] dark:text-[#B28EF2] bg-[#5542FF]/5 ml-0.5"
        >
          Interactive
        </Badge>
        {testArray && isOpen && (
          <span className="ml-auto text-[10px] text-muted-foreground font-mono truncate max-w-[200px]">
            [{testArray.slice(0, 6).join(", ")}
            {testArray.length > 6 ? ", …" : ""}]
          </span>
        )}
      </button>

      {/* ── Collapsible content ── */}
      <div
        className={cn(
          "transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden",
          isOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="h-[360px] bg-background overflow-y-auto">
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            }
          >
            <VisualizerComponent
              embedded
              externalArray={testArray}
              navigate={() => {}}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

/**
 * Toggle button for the JudgePage header toolbar.
 * Kept here for co-location with the drawer logic.
 */
export function VisualizerToggleButton({ problemId, isOpen, onToggle }) {
  if (!VISUALIZER_MAP[problemId]) return null;

  return (
    <Button
      variant={isOpen ? "default" : "ghost"}
      size="sm"
      className={cn(
        "h-7 px-2.5 text-xs gap-1.5",
        isOpen &&
          "bg-[#5542FF] hover:bg-[#5542FF]/90 text-white"
      )}
      onClick={onToggle}
    >
      {isOpen ? (
        <EyeOff className="h-3.5 w-3.5" />
      ) : (
        <Eye className="h-3.5 w-3.5" />
      )}
      Visualizer
    </Button>
  );
}
