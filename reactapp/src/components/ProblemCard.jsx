import React from "react";
import { Clock, ChevronRight, Hash, Zap } from "lucide-react";
import { MagicCard } from "./magic-ui/magic-card.jsx";
import { useTheme } from "./theme-provider.jsx";
import { cn } from "../lib/utils";

const difficultyConfig = {
  Easy: {
    badge: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/25",
    dot: "bg-emerald-500",
    gradientFrom: "#10B981",
    gradientTo: "#34D399",
    accent: "#10B981",
  },
  Medium: {
    badge: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 border-amber-500/20 dark:border-amber-500/25",
    dot: "bg-amber-500",
    gradientFrom: "#F59E0B",
    gradientTo: "#FCD34D",
    accent: "#F59E0B",
  },
  Hard: {
    badge: "bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400 border-red-500/20 dark:border-red-500/25",
    dot: "bg-red-500",
    gradientFrom: "#EF4444",
    gradientTo: "#F87171",
    accent: "#EF4444",
  },
};

/**
 * ProblemCard — Horizontal row layout card for individual algorithm problems.
 */
export default function ProblemCard({ algo, onClick, fallbackIcon: FallbackIcon, index = 0 }) {
  const Icon = algo.icon || FallbackIcon || Hash;
  const diff = difficultyConfig[algo.difficulty] || difficultyConfig.Medium;
  const { theme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const gradientColor = isDark ? "#262626" : "#e5e7eb88";

  return (
    <div
      className="group/card cursor-pointer w-full"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <MagicCard
        className="w-full rounded-2xl"
        background="bg-white dark:bg-zinc-900"
        gradientSize={300}
        gradientColor={gradientColor}
        gradientFrom={diff.gradientFrom}
        gradientTo={diff.gradientTo}
      >
        <div className="flex items-center gap-4 px-5 py-4">

          {/* ── Icon ── */}
          <div
            className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 group-hover/card:scale-110"
            style={{
              background: `linear-gradient(135deg, ${diff.accent}20, ${diff.accent}08)`,
              border: `1px solid ${diff.accent}30`,
            }}
          >
            <Icon className="w-5 h-5" style={{ color: diff.accent }} />
          </div>

          {/* ── Title + Description ── */}
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-semibold text-zinc-800 dark:text-zinc-100 leading-tight tracking-tight group-hover/card:text-zinc-900 dark:group-hover/card:text-white transition-colors truncate">
              {algo.label}
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed line-clamp-1 group-hover/card:text-zinc-600 dark:group-hover/card:text-zinc-300 transition-colors">
              {algo.description}
            </p>
          </div>

          {/* ── Tags ── */}
          <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
            {algo.technique && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-violet-500/8 text-violet-600 dark:bg-violet-500/12 dark:text-violet-400 border border-violet-500/15 dark:border-violet-500/20 whitespace-nowrap">
                <Zap className="w-2.5 h-2.5" />
                {algo.technique}
              </span>
            )}
            {(algo.tags || []).slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60 whitespace-nowrap"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* ── Meta: number + difficulty + tier ── */}
          <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
            {algo.number && (
              <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                #{algo.number}
              </span>
            )}
            {algo.difficulty && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wide",
                  diff.badge
                )}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", diff.dot)} />
                {algo.difficulty}
              </span>
            )}
            {algo.tier && (
              <span className="hidden xl:inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                {algo.tier}
              </span>
            )}
          </div>

          {/* ── Time complexity ── */}
          {algo.timeComplexity && (
            <span className="hidden lg:inline-flex items-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-500 font-mono flex-shrink-0">
              <Clock className="w-3 h-3" />
              {algo.timeComplexity}
            </span>
          )}

          {/* ── Explore CTA ── */}
          <span className="flex-shrink-0 inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500 group-hover/card:text-zinc-700 dark:group-hover/card:text-zinc-200 transition-colors">
            Explore
            <ChevronRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/card:translate-x-0.5" />
          </span>

        </div>
      </MagicCard>
    </div>
  );
}
