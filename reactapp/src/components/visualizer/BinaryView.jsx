import React from "react";
import { cn } from "../../lib/utils";
import { Separator } from "../ui/separator";
import { Binary } from "lucide-react";

/**
 * BinaryView — bit-level binary display.
 *
 * Shows a number in binary with optional bit highlighting.
 */

const BinaryView = ({
  value = 0,
  bits = 8,
  highlightBits = [],
  label,
  showDecimal = true,
  className,
}) => {
  const binaryStr = (value >>> 0).toString(2).padStart(bits, "0");
  const bitArray = binaryStr.split("");

  return (
    <div className={cn("rounded-lg border bg-card", className)}>
      {/* header */}
      {label && (
        <>
          <div className="flex items-center gap-2 px-4 py-2.5">
            <Binary className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[13px] font-medium text-foreground">{label}</span>
            {showDecimal && (
              <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                = {value}
              </span>
            )}
          </div>
          <Separator />
        </>
      )}

      {/* bits */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-center gap-1">
          {bitArray.map((bit, i) => {
            const bitIndex = bits - 1 - i;
            const isHighlighted = highlightBits.includes(bitIndex);
            const isSet = bit === "1";

            return (
              <div key={i} className="flex flex-col items-center gap-1">
                {/* bit index label */}
                <span className="text-[9px] text-muted-foreground/60 tabular-nums">
                  {bitIndex}
                </span>

                {/* bit cell */}
                <div
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-md border text-sm font-mono font-semibold transition-colors",
                    isHighlighted
                      ? "bg-primary/15 border-primary text-primary"
                      : isSet
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                        : "bg-muted/30 border-border/60 text-muted-foreground"
                  )}
                >
                  {bit}
                </div>
              </div>
            );
          })}
        </div>

        {/* decimal display if no header */}
        {!label && showDecimal && (
          <p className="text-center text-xs text-muted-foreground mt-2 tabular-nums">
            Decimal: {value}
          </p>
        )}
      </div>
    </div>
  );
};

export default BinaryView;
