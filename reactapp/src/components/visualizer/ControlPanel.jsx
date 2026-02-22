import React from "react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
} from "lucide-react";

/**
 * ControlPanel — unified play/pause/step/reset/speed bar.
 *
 * Built entirely from shadcn Button + native select styled to match.
 * No shadows — subtle border, clean bg-card surface.
 */

const DEFAULT_SPEEDS = [
  { label: "Slow",      value: 1500 },
  { label: "Medium",    value: 1000 },
  { label: "Fast",      value: 500  },
  { label: "Very Fast", value: 250  },
];

const ControlPanel = ({
  isLoaded,
  onLoad,
  onStepForward,
  onStepBackward,
  onPlay,
  onPause,
  onReset,
  isPlaying = false,
  currentStep = 0,
  totalSteps = 0,
  speed = 1000,
  onSpeedChange,
  speedOptions = DEFAULT_SPEEDS,
  useSlider = false,
  extraControls,
  inputSlot,
}) => {
  return (
    <div className="rounded-lg border bg-card/50 p-3 mb-5 flex flex-col md:flex-row items-center gap-3">
      {/* Input slot */}
      {inputSlot && <div className="flex-1 min-w-0 w-full md:w-auto">{inputSlot}</div>}

      <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
        {!isLoaded ? (
          <>
            <Button onClick={onLoad} size="sm">
              Load & Visualize
            </Button>
            {extraControls}
          </>
        ) : (
          <>
            {/* Step controls */}
            <div className="flex items-center rounded-md border bg-background">
              <button
                onClick={onStepBackward}
                disabled={currentStep <= 0}
                title="Previous Step (←)"
                className="h-8 w-8 inline-flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
              >
                <SkipBack className="h-3.5 w-3.5" />
              </button>

              <span className="w-px h-4 bg-border" />

              {!isPlaying ? (
                <button
                  onClick={onPlay}
                  disabled={currentStep >= totalSteps - 1}
                  title="Play"
                  className="h-8 w-8 inline-flex items-center justify-center text-foreground hover:text-primary disabled:opacity-40 transition-colors"
                >
                  <Play className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  onClick={onPause}
                  title="Pause"
                  className="h-8 w-8 inline-flex items-center justify-center text-foreground hover:text-primary transition-colors"
                >
                  <Pause className="h-3.5 w-3.5" />
                </button>
              )}

              <span className="w-px h-4 bg-border" />

              <button
                onClick={onStepForward}
                disabled={currentStep >= totalSteps - 1}
                title="Next Step (→)"
                className="h-8 w-8 inline-flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
              >
                <SkipForward className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Speed */}
            {onSpeedChange && (
              <select
                value={speed}
                onChange={(e) => onSpeedChange(Number(e.target.value))}
                className="h-8 rounded-md border border-input bg-background px-2 text-xs text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
              >
                {speedOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {/* Step counter */}
            <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
              {currentStep >= 0 ? currentStep + 1 : 0}
              <span className="opacity-40"> / </span>
              {totalSteps}
            </span>

            {/* Extra controls slot */}
            {extraControls}

            {/* Reset */}
            <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground hover:text-destructive">
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;
