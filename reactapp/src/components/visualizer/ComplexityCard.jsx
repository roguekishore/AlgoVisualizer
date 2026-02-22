import React from "react";
import { cn } from "../../lib/utils";
import { Clock, Zap, Cpu, Lightbulb } from "lucide-react";
import { Separator } from "../ui/separator";

/**
 * ComplexityCard — time/space complexity analysis.
 *
 * Clean card, no shadow. Uses consistent typography hierarchy.
 */
const ComplexityCard = ({ time = [], space = [], insights, fullWidth = true }) => {
  return (
    <div className={cn("rounded-lg border bg-card", fullWidth && "lg:col-span-3")}>
      <div className="flex items-center gap-2 px-4 py-2.5">
        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[13px] font-medium text-foreground">Complexity Analysis</span>
      </div>
      <Separator />

      <div className="grid md:grid-cols-2 gap-5 p-4">
        {/* Time */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <Zap className="h-3 w-3" /> Time Complexity
          </div>
          {time.map((t, i) => (
            <div key={i} className="rounded-md border bg-muted/30 px-3 py-2">
              <code className="text-[13px] font-mono font-medium text-foreground">
                {t.label ? `${t.label}: ` : ""}
                {t.value}
              </code>
              {t.description && (
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                  {t.description}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Space */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <Cpu className="h-3 w-3" /> Space Complexity
          </div>
          {space.map((s, i) => (
            <div key={i} className="rounded-md border bg-muted/30 px-3 py-2">
              <code className="text-[13px] font-mono font-medium text-foreground">
                {s.value}
              </code>
              {s.description && (
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                  {s.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Key Insights */}
      {insights && insights.length > 0 && (
        <>
          <Separator />
          <div className="p-4">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground mb-2">
              <Lightbulb className="h-3 w-3" /> Key Insights
            </div>
            <ul className="space-y-1">
              {insights.map((insight, i) => (
                <li
                  key={i}
                  className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5"
                >
                  <span className="text-foreground/30 mt-px">•</span>
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default ComplexityCard;
