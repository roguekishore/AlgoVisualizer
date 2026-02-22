import React from "react";
import { cn } from "../../lib/utils";

/**
 * StatsGrid — clean metric counters.
 *
 * Monochrome design: neutral cards, muted labels, foreground values.
 * No colored borders or rainbow accents.
 */

const StatsGrid = ({ stats = [] }) => {
  const cols =
    stats.length <= 2
      ? "grid-cols-2"
      : stats.length === 3
      ? "grid-cols-3"
      : "grid-cols-2 md:grid-cols-4";

  return (
    <div className={cn("grid gap-3", cols)}>
      {stats.map((stat, i) => (
        <div
          key={i}
          className="rounded-lg border bg-card p-3 flex flex-col gap-1"
        >
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="[&>svg]:h-3.5 [&>svg]:w-3.5 shrink-0">{stat.icon}</span>
            <span className="text-[11px] font-medium truncate">{stat.label}</span>
          </div>
          <p className="font-mono text-xl font-semibold text-foreground tabular-nums">
            {stat.value ?? 0}
          </p>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;
