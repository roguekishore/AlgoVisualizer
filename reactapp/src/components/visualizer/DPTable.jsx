import React from "react";
import { cn } from "../../lib/utils";
import { Table } from "lucide-react";
import { Separator } from "../ui/separator";

/**
 * DPTable — 2D table for dynamic programming visualizations.
 *
 * Clean card, table uses border-collapse, subtle cell styling.
 */
const DPTable = ({
  table = [],
  rowHeaders,
  colHeaders,
  getCellClass,
  title = "DP Table",
}) => {
  if (!table.length) return null;

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center gap-2 px-4 py-2.5">
        <Table className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[13px] font-medium text-foreground">{title}</span>
      </div>
      <Separator />

      <div className="p-4 overflow-auto">
        <table className="border-collapse mx-auto">
          {/* Column headers */}
          {colHeaders && (
            <thead>
              <tr>
                {rowHeaders && <th className="p-0" />}
                {colHeaders.map((h, c) => (
                  <th
                    key={c}
                    className="w-10 h-8 text-center text-[10px] font-mono font-semibold text-muted-foreground border border-border bg-muted/30"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {table.map((row, r) => (
              <tr key={r}>
                {/* Row header */}
                {rowHeaders && (
                  <th className="w-10 h-10 text-center text-[10px] font-mono font-semibold text-muted-foreground border border-border bg-muted/30">
                    {rowHeaders[r]}
                  </th>
                )}
                {row.map((cell, c) => (
                  <td
                    key={c}
                    className={cn(
                      "w-10 h-10 text-center border border-border text-xs font-mono font-medium transition-colors",
                      getCellClass?.(r, c) || "bg-card text-foreground"
                    )}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DPTable;
