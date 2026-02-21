import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { fetchProblems } from "../../services/judgeApi";
import { ThemeToggle } from "../../components/theme-toggle";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Separator } from "../../components/ui/separator";
import {
  ArrowLeft,
  Code2,
  Loader2,
  Search,
  ChevronRight,
  AlertCircle,
  Server,
} from "lucide-react";
import "./Judge.css";

const difficultyVariant = {
  Easy: "success",
  Medium: "warning",
  Hard: "danger",
};

export default function ProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProblems()
      .then(setProblems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = problems.filter((p) => {
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase()) ||
      p.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesDifficulty =
      difficultyFilter === "All" || p.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="flex h-screen flex-col bg-background text-foreground pt-24 md:pt-28">
      {/* ── Header ──
      <header className="flex items-center justify-between h-12 px-4 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Separator orientation="vertical" className="h-5" />
          <Code2 className="h-5 w-5 text-[var(--color-accent-primary)]" />
          <h1 className="text-sm font-semibold">Online Judge</h1>
        </div>
        <ThemeToggle />
      </header> */}

      {/* ── Main Content ── */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto w-full h-full flex flex-col px-6 py-8">
          {/* Intro */}
          <div className="mb-6 flex-shrink-0">
            <h2 className="text-2xl font-bold tracking-tight mb-1">
              Problem Set
            </h2>
            <p className="text-sm text-muted-foreground">
              Pick a problem, write your solution in C++ or Java, and submit to
              run against test cases.
            </p>
          </div>

          {/* Filters bar */}
          <div className="flex items-center gap-3 mb-4 flex-shrink-0">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search problems…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            {/* Difficulty filter pills */}
            <div className="flex items-center gap-1">
              {["All", "Easy", "Medium", "Hard"].map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficultyFilter(d)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    difficultyFilter === d
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-3" />
              <span className="text-sm">Loading problems…</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground gap-3">
              <div className="h-12 w-12 rounded-full bg-[var(--color-danger-light)] flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-[var(--color-danger)]" />
              </div>
              <p className="text-sm font-medium text-foreground">
                Could not connect to judge server
              </p>
              <p className="text-xs text-muted-foreground">{error}</p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                <Server className="h-3 w-3" />
                <span>Make sure the judge backend is running</span>
              </div>
            </div>
          )}

          {/* Problems list */}
          {!loading && !error && (
            <ScrollArea className="flex-1 -mx-1">
              <div className="space-y-1 px-1">
                {filtered.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground text-sm">
                    No problems match your search
                  </div>
                )}
                {filtered.map((problem, idx) => (
                  <button
                    key={problem.id}
                    onClick={() => navigate(`/judge/${problem.id}`)}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-left transition-colors hover:bg-muted/50 group"
                  >
                    {/* Number */}
                    <span className="text-xs font-mono text-muted-foreground w-6 text-right flex-shrink-0">
                      {idx + 1}
                    </span>

                    {/* Title & tags */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground group-hover:text-[var(--color-accent-primary)] transition-colors truncate">
                          {problem.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {problem.category && (
                          <span className="text-xs text-muted-foreground">
                            {problem.category}
                          </span>
                        )}
                        {problem.tags?.length > 0 && (
                          <>
                            <span className="text-muted-foreground">·</span>
                            <div className="flex gap-1 flex-wrap">
                              {problem.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium"
                                >
                                  {tag}
                                </span>
                              ))}
                              {problem.tags.length > 3 && (
                                <span className="text-[10px] text-muted-foreground">
                                  +{problem.tags.length - 3}
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Difficulty */}
                    <Badge
                      variant={
                        difficultyVariant[problem.difficulty] || "secondary"
                      }
                      className="flex-shrink-0"
                    >
                      {problem.difficulty}
                    </Badge>

                    {/* Chevron */}
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}
