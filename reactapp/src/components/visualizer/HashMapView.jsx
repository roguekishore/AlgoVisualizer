import React from "react";
import { cn } from "../../lib/utils";
import { Hash } from "lucide-react";
import { Separator } from "../ui/separator";

/**
 * HashMapView — key→value map display.
 *
 * Clean card, mono font, subtle key→value pairs.
 */
const HashMapView = ({
  map = new Map(),
  getEntryClass,
  title = "Hash Map",
}) => {
  const entries = map instanceof Map
    ? Array.from(map.entries())
    : Object.entries(map);

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Hash className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[13px] font-medium text-foreground">{title}</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">
          {entries.length} entries
        </span>
      </div>
      <Separator />

      <div className="p-3 flex flex-wrap gap-2 min-h-[3rem]">
        {entries.length === 0 ? (
          <p className="text-xs text-muted-foreground w-full text-center py-3">Empty</p>
        ) : (
          entries.map(([key, value], i) => {
            const entryClass = getEntryClass ? getEntryClass(key, value) : "";
            return (
              <div
                key={i}
                className={cn(
                  "inline-flex items-center gap-0 rounded-md border overflow-hidden transition-colors",
                  entryClass
                )}
              >
                <span className="bg-muted px-2.5 py-1.5 text-xs font-mono font-semibold text-foreground border-r border-border">
                  {String(key)}
                </span>
                <span className="px-2.5 py-1.5 text-xs font-mono text-muted-foreground">
                  {String(value)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HashMapView;
