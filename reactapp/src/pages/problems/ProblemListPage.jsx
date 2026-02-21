import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUp, ArrowDown, ArrowUpDown, Search, ChevronLeft, ChevronRight,
  ExternalLink, X, Loader2, Eye
} from "lucide-react";
import { fetchProblems, fetchProblemById, fetchTopics } from "../../services/problemApi";
import { Badge } from "../../components/ui/badge";
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue
} from "../../components/ui/select";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "../../components/ui/table";
import {
  Dialog, DialogContent,
} from "../../components/ui/dialog";
import { ThemeToggle } from "../../components/theme-toggle";

const LC_BASE = "https://leetcode.com/problems";

const DIFF_COLOR = {
  BASIC:  "text-foreground/50",
  EASY:   "text-emerald-500",
  MEDIUM: "text-amber-500",
  HARD:   "text-red-500",
};
const DIFF_LABEL = { BASIC: "Basic", EASY: "Easy", MEDIUM: "Medium", HARD: "Hard" };

/* ── Sortable column header ────────────────────────────────────────── */
function SortHeader({ label, field, current, onSort }) {
  const [f, d] = (current || "").split(",");
  const active = f === field;
  const Icon = active ? (d === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <button
      onClick={() => onSort(active && d === "asc" ? `${field},desc` : `${field},asc`)}
      className="inline-flex items-center gap-1 text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
    >
      {label}
      <Icon className={`h-3 w-3 ${active ? "text-foreground" : "opacity-25"}`} />
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════════════════ */
export default function ProblemListPage() {
  const [problems, setProblems]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);

  const [page, setPage]                     = useState(0);
  const [size, setSize]                     = useState(20);
  const [totalPages, setTotalPages]         = useState(0);
  const [totalElements, setTotalElements]   = useState(0);

  const [sort, setSort]                     = useState("pid,asc");
  const [topicFilter, setTopicFilter]       = useState("");
  const [tagFilter, setTagFilter]           = useState("");
  const [searchKeyword, setSearchKeyword]   = useState("");
  const [debounced, setDebounced]           = useState("");

  const [selected, setSelected]             = useState(null);
  const [detailLoading, setDetailLoading]   = useState(false);
  const [dialogOpen, setDialogOpen]         = useState(false);
  const [topics, setTopics]                 = useState([]);

  /* debounce search ────────────────────────────────────────────────── */
  useEffect(() => {
    const t = setTimeout(() => { setDebounced(searchKeyword); setPage(0); }, 350);
    return () => clearTimeout(t);
  }, [searchKeyword]);

  /* fetch list ─────────────────────────────────────────────────────── */
  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const d = await fetchProblems({
        page, size, sort,
        topic: topicFilter || undefined,
        tag: tagFilter || undefined,
        keyword: debounced || undefined,
      });
      setProblems(d.content || []);
      setTotalPages(d.totalPages || 0);
      setTotalElements(d.totalElements || 0);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [page, size, sort, topicFilter, tagFilter, debounced]);

  useEffect(() => { load(); }, [load]);

  /* fetch topics once ──────────────────────────────────────────────── */
  useEffect(() => { fetchTopics().then(setTopics).catch(() => {}); }, []);

  /* open detail ────────────────────────────────────────────────────── */
  const openDetail = async (pid) => {
    setDialogOpen(true); setDetailLoading(true);
    try { setSelected(await fetchProblemById(pid)); }
    catch { setSelected(null); }
    finally { setDetailLoading(false); }
  };

  const clearAll = () => {
    setSearchKeyword(""); setDebounced("");
    setTopicFilter(""); setTagFilter("");
    setSort("pid,asc"); setPage(0);
  };

  const hasFilters = topicFilter || tagFilter || debounced;
  const from = page * size + 1;
  const to   = Math.min((page + 1) * size, totalElements);

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 md:pt-28">

      {/* ── HEADER ─────────────────────────────────────────────────
      <header className="sticky top-24 md:top-28 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between px-6">
          <div className="flex items-center gap-5">
            <Link to="/" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <div className="h-4 w-px bg-border" />
            <h1 className="text-[15px] font-semibold tracking-tight">Problems</h1>
          </div>
          <div className="flex items-center gap-5">
            <span className="text-[12px] text-muted-foreground tabular-nums tracking-wide">
              {totalElements} total
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header> */}

      <main className="mx-auto max-w-[1120px] px-6 pt-10 pb-16">

        {/* ── FILTERS ────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 mb-10">
          {/* search */}
          <div className="relative w-60">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search…"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="h-9 w-full border border-border bg-background pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-foreground/30 transition-colors"
            />
            {searchKeyword && (
              <button
                onClick={() => setSearchKeyword("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <Select value={topicFilter} onValueChange={(v) => { setTopicFilter(v === "__all__" ? "" : v); setPage(0); }}>
            <SelectTrigger className="w-48 h-9 text-xs">
              <SelectValue placeholder="All topics" _value={topicFilter || "All topics"} />
            </SelectTrigger>
            <SelectContent className="max-h-72 overflow-y-auto">
              <SelectItem value="__all__">All topics</SelectItem>
              {topics.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={tagFilter} onValueChange={(v) => { setTagFilter(v === "__all__" ? "" : v); setPage(0); }}>
            <SelectTrigger className="w-32 h-9 text-xs">
              <SelectValue placeholder="Difficulty" _value={tagFilter ? DIFF_LABEL[tagFilter] : "Difficulty"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All levels</SelectItem>
              <SelectItem value="EASY">Easy</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HARD">Hard</SelectItem>
            </SelectContent>
          </Select>

          <Select value={String(size)} onValueChange={(v) => { setSize(Number(v)); setPage(0); }}>
            <SelectTrigger className="w-[88px] h-9 text-xs">
              <SelectValue _value={`${size} rows`} />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map(n => (
                <SelectItem key={n} value={String(n)}>{n} rows</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <button
              onClick={clearAll}
              className="ml-1 text-[12px] text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 decoration-muted-foreground/40"
            >
              Reset
            </button>
          )}
        </div>

        {/* ── ERROR ──────────────────────────────────────────────── */}
        {error && (
          <div className="mb-8 border border-red-500/20 bg-red-500/5 px-5 py-3 text-sm text-red-400 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={load} className="text-xs underline underline-offset-4 hover:text-red-300">Retry</button>
          </div>
        )}

        {/* ── TABLE ──────────────────────────────────────────────── */}
        <div className="border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border">
                <TableHead className="w-14 pl-5 py-3">
                  <SortHeader label="#" field="pid" current={sort} onSort={(s) => { setSort(s); setPage(0); }} />
                </TableHead>
                <TableHead className="py-3">
                  <SortHeader label="Title" field="title" current={sort} onSort={(s) => { setSort(s); setPage(0); }} />
                </TableHead>
                <TableHead className="w-24 py-3">
                  <SortHeader label="Level" field="tag" current={sort} onSort={(s) => { setSort(s); setPage(0); }} />
                </TableHead>
                <TableHead className="hidden lg:table-cell py-3">
                  <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Topic</span>
                </TableHead>
                <TableHead className="w-12 text-center hidden sm:table-cell py-3">
                  <span className="text-[11px] uppercase tracking-widest text-muted-foreground">LC</span>
                </TableHead>
                <TableHead className="w-10 pr-5 py-3" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="h-72 text-center">
                    <Loader2 className="inline h-4 w-4 animate-spin text-muted-foreground mr-2" />
                    <span className="text-sm text-muted-foreground">Loading…</span>
                  </TableCell>
                </TableRow>
              ) : problems.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="h-72 text-center text-sm text-muted-foreground">
                    {hasFilters ? (
                      <>No matches. <button onClick={clearAll} className="underline underline-offset-4 hover:text-foreground">Clear filters</button></>
                    ) : "No problems found."}
                  </TableCell>
                </TableRow>
              ) : problems.map((p, i) => (
                <TableRow
                  key={p.pid}
                  className="group cursor-pointer border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  onClick={() => openDetail(p.pid)}
                >
                  <TableCell className="pl-5 font-mono text-[12px] text-muted-foreground tabular-nums">
                    {from + i}
                  </TableCell>

                  <TableCell className="py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-foreground">
                        {p.title}
                      </span>
                      {p.hasVisualizer && (
                        <span className="inline-block px-1.5 py-px text-[9px] uppercase tracking-widest font-semibold text-emerald-500 border border-emerald-500/25">
                          v
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className={`text-[12px] font-medium ${DIFF_COLOR[p.tag] || "text-muted-foreground"}`}>
                      {DIFF_LABEL[p.tag] || p.tag}
                    </span>
                  </TableCell>

                  <TableCell className="hidden lg:table-cell">
                    <span className="text-[12px] text-muted-foreground truncate block max-w-[200px]">
                      {p.topics?.[0] || ""}
                    </span>
                  </TableCell>

                  <TableCell className="text-center hidden sm:table-cell" onClick={(e) => e.stopPropagation()}>
                    {p.lcslug ? (
                      <a
                        href={`${LC_BASE}/${p.lcslug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="h-3 w-3 inline" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground/20"></span>
                    )}
                  </TableCell>

                  <TableCell className="pr-5">
                    <Eye className="h-3.5 w-3.5 text-transparent group-hover:text-muted-foreground transition-colors" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* ── PAGINATION ─────────────────────────────────────────── */}
        {totalPages > 0 && (
          <div className="mt-8 flex items-center justify-between">
            <p className="text-[12px] text-muted-foreground tabular-nums">
              {from}–{to} of {totalElements}
            </p>
            <div className="flex items-center gap-0.5">
              <PgBtn onClick={() => setPage(0)} disabled={page === 0}>First</PgBtn>
              <PgBtn onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
                <ChevronLeft className="h-3.5 w-3.5" />
              </PgBtn>

              {pageNums(page, totalPages).map((n, i) =>
                n === "…" ? (
                  <span key={`e${i}`} className="w-8 text-center text-[11px] text-muted-foreground/30 select-none">…</span>
                ) : (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`h-8 w-8 text-[12px] transition-colors ${
                      n === page
                        ? "bg-foreground text-background font-semibold"
                        : "text-muted-foreground hover:text-foreground"
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
      </main>

      {/* ── DETAIL DIALOG ────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
          {detailLoading ? (
            <div className="flex items-center justify-center h-52 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm">Loading…</span>
            </div>
          ) : selected ? (
            <div className="text-foreground">
              {/* header */}
              <div className="border-b border-border px-6 pt-6 pb-5">
                <p className="text-[11px] text-muted-foreground mb-1.5 font-mono tracking-wide">
                  PROBLEM #{selected.pid}
                </p>
                <h2 className="text-base font-semibold leading-snug text-foreground">
                  {selected.title}
                </h2>
              </div>

              {/* body */}
              <div className="px-6 py-5 space-y-4">
                <DetailRow label="Difficulty">
                  <span className={`text-sm font-medium ${DIFF_COLOR[selected.tag] || ""}`}>
                    {DIFF_LABEL[selected.tag] || selected.tag}
                  </span>
                </DetailRow>

                {selected.topics?.length > 0 && (
                  <DetailRow label="Topics">
                    <div className="flex flex-wrap gap-1.5">
                      {selected.topics.map(t => (
                        <Badge key={t} variant="secondary" className="text-[11px] text-secondary-foreground">{t}</Badge>
                      ))}
                    </div>
                  </DetailRow>
                )}

                <DetailRow label="Visualizer">
                  <span className={`text-sm ${selected.hasVisualizer ? "text-emerald-500" : "text-muted-foreground"}`}>
                    {selected.hasVisualizer ? "Available" : "—"}
                  </span>
                </DetailRow>

                {selected.description && (
                  <DetailRow label="Description">
                    <p className="text-sm text-muted-foreground leading-relaxed">{selected.description}</p>
                  </DetailRow>
                )}

                {selected.lcslug && (
                  <DetailRow label="LeetCode">
                    <a
                      href={`${LC_BASE}/${selected.lcslug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-foreground hover:text-muted-foreground transition-colors underline underline-offset-4 decoration-border"
                    >
                      {selected.lcslug}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </DetailRow>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-52 text-sm text-muted-foreground">
              Problem not found.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ── small pagination button ─────────────────────────────────────── */
function PgBtn({ children, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="h-8 px-2 text-[12px] text-muted-foreground hover:text-foreground disabled:opacity-25 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center"
    >
      {children}
    </button>
  );
}

/* ── dialog detail row ───────────────────────────────────────────── */
function DetailRow({ label, children }) {
  return (
    <div className="flex gap-4">
      <span className="w-24 shrink-0 text-[12px] text-muted-foreground pt-0.5">{label}</span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

/* ── page number range ───────────────────────────────────────────── */
function pageNums(cur, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const r = [0];
  if (cur > 2) r.push("…");
  for (let i = Math.max(1, cur - 1); i <= Math.min(total - 2, cur + 1); i++) r.push(i);
  if (cur < total - 3) r.push("…");
  r.push(total - 1);
  return r;
}
