import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";
import PixelCard from "./PixelCard";
import { problems as PROBLEM_CATALOG } from "../search/catalog";
import { getCategoryByKey } from "../routes/config";
import { cn } from "../lib/utils";

/**
 * Difficulty badge color mapping
 */
const difficultyStyles = {
  Easy: {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  Medium: {
    bg: "bg-amber-500/10 dark:bg-amber-500/15",
    text: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  Hard: {
    bg: "bg-red-500/10 dark:bg-red-500/15",
    text: "text-red-600 dark:text-red-400",
    dot: "bg-red-500",
  },
};

/**
 * Map category spotlightColor to PixelCard colors
 */
function getPixelColors(hex) {
  // Create a subtle palette from the base color
  return `${hex}22,${hex}55,${hex}`;
}

/**
 * TopicPixelCard – A category card built on react-bits PixelCard.
 * Shows the topic name, description, and a list of problems inside.
 *
 * @param {{ category: object }} props
 */
export default function TopicPixelCard({ category }) {
  const navigate = useNavigate();
  const Icon = category.icon;

  const config = getCategoryByKey(category.page);
  const routePath = config?.path || `/${category.page.toLowerCase()}`;

  // Get problems for this category (max 5 shown)
  const categoryProblems = PROBLEM_CATALOG.filter(
    (p) => p.category === category.page
  ).slice(0, 5);

  const totalCount = PROBLEM_CATALOG.filter(
    (p) => p.category === category.page
  ).length;

  const remaining = totalCount - categoryProblems.length;

  return (
    <PixelCard
      variant="default"
      gap={7}
      speed={30}
      colors={getPixelColors(category.spotlightColor)}
      className="!w-full !aspect-auto group cursor-pointer"
    >
      {/* Content flows normally to define card height; canvas is behind as absolute bg */}
      <div
        className="flex flex-col p-5 transition-all duration-300"
        onClick={() => navigate(routePath)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            navigate(routePath);
          }
        }}
      >
        {/* ── Header ── */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl transition-transform duration-300 group-hover:scale-110"
            style={{
              background: `linear-gradient(135deg, ${category.spotlightColor}30, ${category.spotlightColor}10)`,
              border: `1px solid ${category.spotlightColor}40`,
            }}
          >
            <Icon
              className="w-5 h-5"
              style={{ color: category.spotlightColor }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-semibold text-zinc-800 dark:text-zinc-100 leading-tight tracking-tight truncate group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
              {category.name}
            </h3>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
              {category.description}
            </p>
          </div>
        </div>

        {/* ── Problem count pill ── */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{
              background: `${category.spotlightColor}15`,
              color: category.spotlightColor,
              border: `1px solid ${category.spotlightColor}30`,
            }}
          >
            {totalCount} problem{totalCount !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── Divider ── */}
        <div
          className="h-px w-full mb-3 opacity-20"
          style={{
            background: `linear-gradient(to right, transparent, ${category.spotlightColor}, transparent)`,
          }}
        />

        {/* ── Problem list ── */}
        <div className="flex-1 space-y-1.5 min-h-0 overflow-hidden rounded-xl bg-white/40 dark:bg-zinc-900/60 backdrop-blur-md p-2 border border-white/70 dark:border-white/[0.06] shadow-inner shadow-white/50 dark:shadow-none">
          {categoryProblems.map((problem, idx) => {
            const styles = difficultyStyles[problem.difficulty] || difficultyStyles.Medium;
            return (
              <div
                key={problem.subpage}
                className={cn(
                  "flex items-center gap-2 px-2.5 py-1.5 rounded-lg",
                  "bg-white/60 dark:bg-white/[0.06] hover:bg-white/90 dark:hover:bg-white/[0.1]",
                  "border border-white/80 dark:border-white/[0.06] hover:border-zinc-200/80 dark:hover:border-white/[0.12]",
                  "transition-all duration-200 group/problem"
                )}
                style={{
                  animationDelay: `${idx * 60}ms`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`${routePath}/${problem.subpage}`);
                }}
              >
                {/* Difficulty dot */}
                <span
                  className={cn(
                    "flex-shrink-0 w-1.5 h-1.5 rounded-full",
                    styles.dot
                  )}
                />

                {/* Problem name */}
                <span className="flex-1 text-[11px] text-zinc-700 dark:text-zinc-300 truncate group-hover/problem:text-zinc-900 dark:group-hover/problem:text-zinc-100 transition-colors">
                  {problem.label}
                </span>

                {/* Difficulty badge */}
                <span
                  className={cn(
                    "flex-shrink-0 text-[9px] font-medium px-1.5 py-0.5 rounded",
                    styles.bg,
                    styles.text
                  )}
                >
                  {problem.difficulty}
                </span>

                <ChevronRight className="flex-shrink-0 w-3 h-3 text-zinc-400 dark:text-zinc-600 group-hover/problem:text-zinc-600 dark:group-hover/problem:text-zinc-400 transition-colors" />
              </div>
            );
          })}

          {remaining > 0 && (
            <div className="flex items-center justify-center pt-1">
              <span className="text-[10px] text-zinc-500 dark:text-zinc-500">
                +{remaining} more problem{remaining !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* ── Footer CTA ── */}
        <div className="mt-auto pt-3">
          <div
            className={cn(
              "flex items-center justify-center gap-2 py-2 px-3 rounded-xl",
              "bg-white/40 dark:bg-zinc-900/60 backdrop-blur-md hover:bg-white/70 dark:hover:bg-white/[0.1]",
              "border border-white/70 dark:border-white/[0.06] hover:border-zinc-200/80 dark:hover:border-white/[0.12]",
              "transition-all duration-300 group/cta"
            )}
          >
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 group-hover/cta:text-zinc-900 dark:group-hover/cta:text-white transition-colors">
              Explore {category.name}
            </span>
            <ArrowRight
              className="w-3.5 h-3.5 transition-all duration-300 group-hover/cta:translate-x-0.5"
              style={{ color: category.spotlightColor }}
            />
          </div>
        </div>
      </div>
    </PixelCard>
  );
}
