import React from "react";
import { cn } from "../../lib/utils";
import { Grid3X3 } from "lucide-react";
import { Separator } from "../ui/separator";

/**
 * GridBoard — interactive 2D grid for pathfinding, sudoku, n-queens, flood fill.
 *
 * Clean card, no shadow, thin cell borders.
 */
const GridBoard = ({
  rows,
  cols,
  getCellContent,
  getCellClass,
  onCellClick,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  cellSize = 36,
  title = "Grid",
  legend,
}) => {
  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center gap-2 px-4 py-2.5">
        <Grid3X3 className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[13px] font-medium text-foreground">{title}</span>
      </div>
      <Separator />

      <div className="p-4 overflow-auto">
        <div className="flex justify-center">
          <div
            className="inline-grid border border-border rounded-md overflow-hidden"
            style={{
              gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
            }}
            onMouseUp={onMouseUp}
          >
            {Array.from({ length: rows }, (_, r) =>
              Array.from({ length: cols }, (_, c) => (
                <div
                  key={`${r}-${c}`}
                  className={cn(
                    "flex items-center justify-center border border-border/40 text-xs font-mono font-medium transition-colors cursor-default",
                    getCellClass?.(r, c)
                  )}
                  style={{ width: cellSize, height: cellSize }}
                  onClick={() => onCellClick?.(r, c)}
                  onMouseDown={() => onMouseDown?.(r, c)}
                  onMouseEnter={() => onMouseEnter?.(r, c)}
                >
                  {getCellContent?.(r, c)}
                </div>
              ))
            )}
          </div>
        </div>

        {legend && <div className="mt-3">{legend}</div>}
      </div>
    </div>
  );
};

export default GridBoard;
