/**
 * ProblemsTable — Shared LeetCode-style problem table.
 * Used by both /problems (Spring-backed) and /judge (Node-backed).
 *
 * Features:
 *   • Status column (solved / attempted / not started) with icons
 *   • Fixed-width columns matching LeetCode layout
 *   • Sortable headers, search, filters, pagination
 *   • Detail dialog on row click
 *   • Dual-theme compatible
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUp, ArrowDown, ArrowUpDown, Search, ChevronLeft, ChevronRight,
  ExternalLink, X, Loader2, Filter, RotateCcw, CheckCircle2, Circle,
  CircleDot, BookOpen, Code2,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from "./ui/select";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "./ui/table";
import {
  Dialog, DialogContent,
} from "./ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

/* ── Constants ────────────────────────────────────────────────────── */

const LC_BASE = "https://leetcode.com/problems";

const DIFF_STYLE = {
  BASIC:  { color: "text-foreground/50",   label: "Basic"  },
  EASY:   { color: "text-emerald-500",     label: "Easy"   },
  MEDIUM: { color: "text-amber-500",       label: "Medium" },
  HARD:   { color: "text-rose-500",        label: "Hard"   },
  // lowercase variants for judge data
  Easy:   { color: "text-emerald-500",     label: "Easy"   },
  Medium: { color: "text-amber-500",       label: "Medium" },
  Hard:   { color: "text-rose-500",        label: "Hard"   },
};

const STATUS_CFG = {
  SOLVED:      { icon: CheckCircle2, color: "text-emerald-500",    label: "Solved" },
  ATTEMPTED:   { icon: CircleDot,    color: "text-amber-500",      label: "Attempted" },
  NOT_STARTED: { icon: Circle,       color: "text-muted-foreground/30", label: "Todo" },
};

/* ── Sortable column header ───────────────────────────────────────── */

function SortHeader({ label, field, current, onSort }) {
  const [f, d] = (current || "").split(",");
  const active = f === field;
  const Icon = active ? (d === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <button
      onClick={() => onSort(active && d === "asc" ? `${field},desc` : `${field},asc`)}
      className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-medium text-muted-foreground hover:text-foreground transition-colors"
    >
      {label}
      <Icon className={`h-3 w-3 ${active ? "text-foreground" : "opacity-30"}`} />
    </button>
  );
}

/* ── Status icon cell ─────────────────────────────────────────────── */

function StatusIcon({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.NOT_STARTED;
  const Icon = cfg.icon;
  return (
    <span title={cfg.label}>
      <Icon className={`h-[15px] w-[15px] ${cfg.color}`} strokeWidth={2.2} />
    </span>
  );
}

/* ── Page number range helper ─────────────────────────────────────── */

function pageNums(cur, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const r = [0];
  if (cur > 2) r.push("…");
  for (let i = Math.max(1, cur - 1); i <= Math.min(total - 2, cur + 1); i++) r.push(i);
  if (cur < total - 3) r.push("…");
  r.push(total - 1);
  return r;
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * @param {Object}   props
 * @param {"spring"|"judge"} props.source     - Data source: "spring" for paginated backend, "judge" for client-side
 * @param {Function} props.fetchList          - Fetches the problem list. For spring: ({page,size,sort,stage,tag,status,keyword}) → Page<DTO>.
 *                                              For judge: () → Problem[]
 * @param {Function} [props.fetchDetail]      - Fetches a single problem detail by id
 * @param {Function} [props.fetchStages]      - Fetches stage names for the filter dropdown
 * @param {Object}   [props.progressMap]      - Map<pid, {status}> from backend (for spring source)
 * @param {string}   [props.title]            - Page title
 * @param {string}   [props.subtitle]         - Page subtitle
 * @param {React.ElementType} [props.icon]    - Header icon component
 * @param {Function} [props.onRowClick]       - Custom row click handler (pid, problem) → void. If omitted, opens detail dialog.
 * @param {boolean}  [props.showLeetCode]     - Show LC link column (default true)
 * @param {boolean}  [props.showStage]        - Show stage column (default true for spring, false for judge)
 */
export default function ProblemsTable({
  source = "spring",
  fetchList,
  fetchDetail,
  fetchStages: fetchStagesFn,
  progressMap = {},
  title = "Problems",
  subtitle,
  icon: HeaderIcon = BookOpen,
  onRowClick,
  showLeetCode = true,
  showStage = source === "spring",
}) {
  const navigate = useNavigate();

  /* ── Spring pagination state ──────────────────────────────────── */
  const [problems, setProblems]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [page, setPage]                   = useState(0);
  const [size, setSize]                   = useState(20);
  const [totalPages, setTotalPages]       = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sort, setSort]                   = useState("pid,asc");

  /* ── Filters ──────────────────────────────────────────────────── */
  const [stageFilter, setStageFilter]     = useState("");
  const [tagFilter, setTagFilter]         = useState("");
  const [statusFilter, setStatusFilter]   = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [debounced, setDebounced]         = useState("");
  const [stages, setStages]               = useState([]);

  /* ── Detail dialog ────────────────────────────────────────────── */
  const [selected, setSelected]       = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [dialogOpen, setDialogOpen]   = useState(false);

  /* ── Judge-only: client-side filter state ─────────────────────── */
  const [judgeDiffFilter, setJudgeDiffFilter] = useState("All");

  /* ── Debounce search ──────────────────────────────────────────── */
  useEffect(() => {
    const t = setTimeout(() => { setDebounced(searchKeyword); setPage(0); }, 300);
    return () => clearTimeout(t);
  }, [searchKeyword]);

  /* ── Fetch list (spring) ──────────────────────────────────────── */
  const loadSpring = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await fetchList({
        page, size, sort,
        stage: stageFilter || undefined,
        tag: tagFilter || undefined,
        status: statusFilter || undefined,
        keyword: debounced || undefined,
      });
      setProblems(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [fetchList, page, size, sort, stageFilter, tagFilter, statusFilter, debounced]);

  /* ── Fetch list (judge) ───────────────────────────────────────── */
  const loadJudge = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await fetchList();
      setProblems(data);
      setTotalElements(data.length);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [fetchList]);

  useEffect(() => {
    if (source === "spring") loadSpring();
    else loadJudge();
  }, [source, loadSpring, loadJudge]);

  /* ── Fetch stages once ────────────────────────────────────────── */
  useEffect(() => {
    if (fetchStagesFn) fetchStagesFn().then(setStages).catch(() => {});
  }, [fetchStagesFn]);

  /* ── Judge: client-filtered list ──────────────────────────────── */
  const filteredJudge = useMemo(() => {
    if (source !== "judge") return [];
    return problems.filter((p) => {
      const matchSearch = !debounced ||
        p.title?.toLowerCase().includes(debounced.toLowerCase()) ||
        p.topic?.toLowerCase().includes(debounced.toLowerCase()) ||
        p.category?.toLowerCase().includes(debounced.toLowerCase()) ||
        p.tags?.some(t => t.toLowerCase().includes(debounced.toLowerCase()));
      const matchDiff = judgeDiffFilter === "All" || p.difficulty === judgeDiffFilter;
      return matchSearch && matchDiff;
    });
  }, [source, problems, debounced, judgeDiffFilter]);

  const displayList = source === "spring" ? problems : filteredJudge;
  const displayTotal = source === "spring" ? totalElements : filteredJudge.length;

  /* ── Detail dialog ────────────────────────────────────────────── */
  const openDetail = async (id) => {
    if (!fetchDetail) return;
    setDialogOpen(true); setDetailLoading(true);
    try { setSelected(await fetchDetail(id)); }
    catch { setSelected(null); }
    finally { setDetailLoading(false); }
  };

  const handleRowClick = (problem) => {
    const id = problem.pid ?? problem.id;
    if (onRowClick) {
      onRowClick(id, problem);
    } else {
      openDetail(id);
    }
  };

  /* ── Clear all filters ────────────────────────────────────────── */
  const clearAll = () => {
    setSearchKeyword(""); setDebounced("");
    setStageFilter(""); setTagFilter(""); setStatusFilter("");
    setJudgeDiffFilter("All");
    setSort("pid,asc"); setPage(0);
  };

  const hasFilters = source === "spring"
    ? (stageFilter || tagFilter || statusFilter || debounced)
    : (debounced || judgeDiffFilter !== "All");

  const from = page * size + 1;
  const to   = Math.min((page + 1) * size, totalElements);

  /* ── Helpers for normalising data shape between spring & judge ── */
  const getDifficulty = (p) => p.tag || p.difficulty || "";
  const getTitle = (p) => p.title || "";
  const getId = (p) => p.pid ?? p.id;
  const getLcSlug = (p) => p.lcslug || p.lcSlug || null;
  const getStages = (p) => p.stages || [];
  const getCategory = (p) => p.category || p.topic || "";
  const getUserStatus = (p) => {
    // Spring backend provides userStatus directly
    if (p.userStatus) return p.userStatus;
    // Fallback: look up from the progressMap
    const id = getId(p);
    if (progressMap[id]) return progressMap[id].status || progressMap[id];
    return null;
  };

  /* ═══════════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-background text-foreground pt-24 md:pt-28">
      <main className="mx-auto max-w-[1100px] px-4 sm:px-6 pt-6 pb-16">

        {/* ── PAGE HEADER ────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 border border-primary/20">
            <HeaderIcon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {subtitle || `${displayTotal} problems`}
            </p>
          </div>
        </div>

        {/* ── STATUS TABS (spring only) ─────────────────────── */}
        {source === "spring" && (
          <Tabs value={statusFilter} onValueChange={(v) => { setStatusFilter(v === "ALL" ? "" : v); setPage(0); }} className="mb-5">
            <TabsList className="h-9 bg-muted/60 p-0.5 rounded-lg">
              <TabsTrigger value="ALL" className="text-xs px-3 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
                All
              </TabsTrigger>
              <TabsTrigger value="SOLVED" className="text-xs px-3 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                Solved
              </TabsTrigger>
              <TabsTrigger value="ATTEMPTED" className="text-xs px-3 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm gap-1.5">
                <CircleDot className="h-3 w-3 text-amber-500" />
                Attempted
              </TabsTrigger>
              <TabsTrigger value="NOT_STARTED" className="text-xs px-3 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm gap-1.5">
                <Circle className="h-3 w-3 text-muted-foreground/40" />
                Todo
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {/* ── SEARCH + FILTERS BAR ─────────────────────────── */}
        <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-3 sm:p-4 mb-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search problems…"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-9 pr-8 h-9 text-sm bg-background/80"
              />
              {searchKeyword && (
                <button
                  onClick={() => setSearchKeyword("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="hidden sm:block w-px h-7 bg-border" />

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Filter className="h-3 w-3" />
              </div>

              {/* Difficulty */}
              {source === "spring" ? (
                <>
                  <Select value={tagFilter} onValueChange={(v) => { setTagFilter(v === "__all__" ? "" : v); setPage(0); }}>
                    <SelectTrigger className="w-28 h-8 text-xs rounded-lg">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All levels</SelectItem>
                      <SelectItem value="EASY">Easy</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HARD">Hard</SelectItem>
                    </SelectContent>
                  </Select>

                  {showStage && stages.length > 0 && (
                    <Select value={stageFilter} onValueChange={(v) => { setStageFilter(v === "__all__" ? "" : v); setPage(0); }}>
                      <SelectTrigger className="w-40 h-8 text-xs rounded-lg">
                        <SelectValue placeholder="All stages" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64 overflow-y-auto">
                        <SelectItem value="__all__">All stages</SelectItem>
                        {stages.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}

                  <Select value={String(size)} onValueChange={(v) => { setSize(Number(v)); setPage(0); }}>
                    <SelectTrigger className="w-20 h-8 text-xs rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[10, 20, 50, 100].map(n => (
                        <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              ) : (
                /* Judge: simple difficulty pills */
                <div className="flex items-center gap-1">
                  {["All", "Easy", "Medium", "Hard"].map(d => (
                    <button
                      key={d}
                      onClick={() => setJudgeDiffFilter(d)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                        judgeDiffFilter === d
                          ? "bg-foreground/10 text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}

              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearAll} className="h-8 px-2.5 text-[11px] text-muted-foreground hover:text-foreground gap-1">
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ── ERROR ─────────────────────────────────────────── */}
        {error && (
          <div className="mb-5 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-400 flex items-center justify-between">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={source === "spring" ? loadSpring : loadJudge} className="text-xs text-rose-400 hover:text-rose-300 gap-1">
              <RotateCcw className="h-3 w-3" /> Retry
            </Button>
          </div>
        )}

        {/* ── TABLE ─────────────────────────────────────────── */}
        <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border/60">
                {/* Status */}
                <TableHead className="w-[52px] text-center py-3 px-0">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">⬤</span>
                </TableHead>
                {/* # */}
                <TableHead className="w-[56px] py-3 pl-0 pr-2">
                  {source === "spring" ? (
                    <SortHeader label="#" field="pid" current={sort} onSort={(s) => { setSort(s); setPage(0); }} />
                  ) : (
                    <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">#</span>
                  )}
                </TableHead>
                {/* Title */}
                <TableHead className="py-3">
                  {source === "spring" ? (
                    <SortHeader label="Title" field="title" current={sort} onSort={(s) => { setSort(s); setPage(0); }} />
                  ) : (
                    <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">Title</span>
                  )}
                </TableHead>
                {/* Category (judge) / Stage (spring) */}
                {(showStage || source === "judge") && (
                  <TableHead className="hidden lg:table-cell w-[160px] py-3">
                    <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
                      {source === "judge" ? "Topic" : "Stage"}
                    </span>
                  </TableHead>
                )}
                {/* Difficulty */}
                <TableHead className="w-[90px] py-3">
                  {source === "spring" ? (
                    <SortHeader label="Difficulty" field="tag" current={sort} onSort={(s) => { setSort(s); setPage(0); }} />
                  ) : (
                    <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">Difficulty</span>
                  )}
                </TableHead>
                {/* LC link */}
                {showLeetCode && (
                  <TableHead className="w-[48px] text-center hidden sm:table-cell py-3">
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground">LC</span>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                /* Skeleton rows */
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="hover:bg-transparent animate-pulse">
                    <TableCell className="text-center px-0"><div className="h-4 w-4 rounded-full bg-muted mx-auto" /></TableCell>
                    <TableCell className="pl-0 pr-2"><div className="h-3 w-6 rounded bg-muted" /></TableCell>
                    <TableCell><div className="h-3.5 w-48 rounded bg-muted" /></TableCell>
                    {(showStage || source === "judge") && <TableCell className="hidden lg:table-cell"><div className="h-3 w-20 rounded bg-muted" /></TableCell>}
                    <TableCell><div className="h-5 w-14 rounded-md bg-muted" /></TableCell>
                    {showLeetCode && <TableCell className="hidden sm:table-cell"><div className="h-3 w-3 rounded bg-muted mx-auto" /></TableCell>}
                  </TableRow>
                ))
              ) : displayList.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={10} className="h-52 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Search className="h-8 w-8 opacity-20" />
                      <span className="text-sm">
                        {hasFilters ? "No matching problems." : "No problems found."}
                      </span>
                      {hasFilters && (
                        <button onClick={clearAll} className="text-xs underline underline-offset-4 hover:text-foreground transition-colors">
                          Clear filters
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : displayList.map((p, i) => {
                const diff = getDifficulty(p);
                const style = DIFF_STYLE[diff] || { color: "text-muted-foreground", label: diff };
                const status = getUserStatus(p);
                const idx = source === "spring" ? from + i : i + 1;
                const slug = getLcSlug(p);

                return (
                  <TableRow
                    key={getId(p)}
                    className="group cursor-pointer border-b border-border/40 last:border-0 hover:bg-muted/40 transition-colors"
                    onClick={() => handleRowClick(p)}
                  >
                    {/* Status */}
                    <TableCell className="text-center px-0 py-3">
                      <StatusIcon status={status} />
                    </TableCell>

                    {/* # */}
                    <TableCell className="pl-0 pr-2 py-3 font-mono text-xs text-muted-foreground tabular-nums">
                      {idx}
                    </TableCell>

                    {/* Title */}
                    <TableCell className="py-3">
                      <span className="text-[13px] font-medium text-foreground group-hover:text-primary transition-colors">
                        {getTitle(p)}
                      </span>
                    </TableCell>

                    {/* Category / Stage */}
                    {(showStage || source === "judge") && (
                      <TableCell className="hidden lg:table-cell py-3">
                        <span className="text-xs text-muted-foreground truncate block max-w-[140px]">
                          {source === "judge" ? getCategory(p) : (getStages(p)[0] || "")}
                        </span>
                      </TableCell>
                    )}

                    {/* Difficulty */}
                    <TableCell className="py-3">
                      <span className={`text-xs font-semibold ${style.color}`}>
                        {style.label}
                      </span>
                    </TableCell>

                    {/* LC link */}
                    {showLeetCode && (
                      <TableCell className="text-center hidden sm:table-cell py-3" onClick={(e) => e.stopPropagation()}>
                        {slug ? (
                          <a
                            href={`${LC_BASE}/${slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5 inline" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground/15">—</span>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* ── PAGINATION (spring only) ─────────────────────── */}
        {source === "spring" && totalPages > 1 && (
          <div className="mt-5 flex items-center justify-between rounded-xl border border-border bg-card/80 backdrop-blur-sm px-4 py-2.5">
            <p className="text-[11px] text-muted-foreground tabular-nums">
              <span className="font-medium text-foreground">{from}–{to}</span> of {totalElements}
            </p>
            <div className="flex items-center gap-0.5">
              <PgBtn onClick={() => setPage(0)} disabled={page === 0}>First</PgBtn>
              <PgBtn onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
                <ChevronLeft className="h-3.5 w-3.5" />
              </PgBtn>
              {pageNums(page, totalPages).map((n, i) =>
                n === "…" ? (
                  <span key={`e${i}`} className="w-8 text-center text-[11px] text-muted-foreground/25 select-none">…</span>
                ) : (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`h-7 w-7 text-[11px] rounded-md transition-colors ${
                      n === page
                        ? "bg-foreground text-background font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {n + 1}
                  </button>
                )
              )}
              <PgBtn onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
                <ChevronRight className="h-3.5 w-3.5" />
              </PgBtn>
              <PgBtn onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}>Last</PgBtn>
            </div>
          </div>
        )}

        {/* ── Count (judge) ────────────────────────────────── */}
        {source === "judge" && !loading && !error && (
          <div className="mt-4 text-center">
            <span className="text-[11px] text-muted-foreground">
              {displayList.length} problem{displayList.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </main>

      {/* ── DETAIL DIALOG (spring only) ─────────────────────── */}
      {fetchDetail && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
            {detailLoading ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm">Loading…</span>
              </div>
            ) : selected ? (
              <div className="text-foreground">
                {/* header */}
                <div className="border-b border-border px-6 pt-6 pb-4">
                  <p className="text-[11px] text-muted-foreground mb-1 font-mono tracking-wide uppercase">
                    Problem #{selected.pid ?? selected.id}
                  </p>
                  <h2 className="text-base font-semibold leading-snug">{selected.title}</h2>
                </div>
                {/* body */}
                <div className="px-6 py-5 space-y-3.5">
                  <DetailRow label="Difficulty">
                    <span className={`text-sm font-semibold ${(DIFF_STYLE[selected.tag || selected.difficulty] || {}).color || ""}`}>
                      {(DIFF_STYLE[selected.tag || selected.difficulty] || {}).label || selected.tag || selected.difficulty}
                    </span>
                  </DetailRow>
                  {selected.userStatus && (
                    <DetailRow label="Status">
                      <div className="flex items-center gap-1.5">
                        <StatusIcon status={selected.userStatus} />
                        <span className="text-sm">{STATUS_CFG[selected.userStatus]?.label || selected.userStatus}</span>
                      </div>
                    </DetailRow>
                  )}
                  {selected.stages?.length > 0 && (
                    <DetailRow label="Stages">
                      <div className="flex flex-wrap gap-1.5">
                        {selected.stages.map(t => (
                          <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                        ))}
                      </div>
                    </DetailRow>
                  )}
                  {selected.hasVisualizer !== undefined && (
                    <DetailRow label="Visualizer">
                      <span className={`text-sm ${selected.hasVisualizer ? "text-emerald-500 font-medium" : "text-muted-foreground"}`}>
                        {selected.hasVisualizer ? "Available" : "—"}
                      </span>
                    </DetailRow>
                  )}
                  {selected.description && (
                    <DetailRow label="Description">
                      <p className="text-sm text-muted-foreground leading-relaxed">{selected.description}</p>
                    </DetailRow>
                  )}
                  {(getLcSlug(selected)) && (
                    <DetailRow label="LeetCode">
                      <a
                        href={`${LC_BASE}/${getLcSlug(selected)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-foreground hover:text-primary transition-colors underline underline-offset-4 decoration-border"
                      >
                        {getLcSlug(selected)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </DetailRow>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                Problem not found.
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

/* ── Small helpers ────────────────────────────────────────────────── */

function PgBtn({ children, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground disabled:opacity-25 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center rounded-md hover:bg-muted"
    >
      {children}
    </button>
  );
}

function DetailRow({ label, children }) {
  return (
    <div className="flex gap-4">
      <span className="w-20 shrink-0 text-[11px] text-muted-foreground pt-0.5 uppercase tracking-wide">{label}</span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
