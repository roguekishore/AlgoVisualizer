import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Trophy, Target, CheckCircle, BarChart3,
  GraduationCap, Building2, Star, ArrowLeft, LogOut,
  Flame, Zap, TrendingUp, BookOpen, Lock, Clock,
  Coins, Sparkles, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { getStoredUser, fetchUserStats, fetchUserProfile } from "@/services/userApi";
import { fetchPlayerStats, fetchCoinHistory } from "@/services/gamificationApi";
import useGamificationStore from "@/stores/useGamificationStore";
import useProgressStore, {
  STAGES,
  STAGE_ORDER,
  ALL_PROBLEMS,
  Difficulty,
} from "@/map/useProgressStore";

/* ─── Rating tier config ─── */
const getRatingTier = (rating) => {
  if (rating >= 500) return { label: "Grandmaster", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30", icon: Flame };
  if (rating >= 300) return { label: "Master", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30", icon: Zap };
  if (rating >= 150) return { label: "Expert", color: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/30", icon: Star };
  if (rating >= 50) return { label: "Intermediate", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30", icon: TrendingUp };
  return { label: "Beginner", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: BookOpen };
};

/* ─── Difficulty breakdown from store's completed list ─── */
const getDifficultyBreakdown = (completedProblems) => {
  const solved = ALL_PROBLEMS.filter(p => completedProblems.includes(p.id));
  return {
    easy: solved.filter(p => p.difficulty === Difficulty.EASY).length,
    medium: solved.filter(p => p.difficulty === Difficulty.MEDIUM).length,
    hard: solved.filter(p => p.difficulty === Difficulty.HARD).length,
  };
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gamStats, setGamStats] = useState(null);
  const [coinHistory, setCoinHistory] = useState(null);
  const [coinPage, setCoinPage] = useState(0);

  const completedProblems = useProgressStore(s => s.completedProblems);
  const getStageProgress = useProgressStore(s => s.getStageProgress);
  const getTotalProgress = useProgressStore(s => s.getTotalProgress);
  const loadProgress = useProgressStore(s => s.loadProgress);

  const user = getStoredUser();
  const totalProgress = getTotalProgress();
  const diffBreakdown = useMemo(() => getDifficultyBreakdown(completedProblems), [completedProblems]);

  useEffect(() => {
    if (!user?.uid) {
      navigate("/login");
      return;
    }

    async function load() {
      try {
        // Always fetch fresh from backend — no caching
        const [profileData, statsData, gamData, coinData] = await Promise.all([
          fetchUserProfile(user.uid),
          fetchUserStats(user.uid),
          fetchPlayerStats(user.uid).catch(() => null),
          fetchCoinHistory(user.uid, 0, 10).catch(() => null),
          loadProgress(user.uid),
        ]);
        setProfile(profileData);
        setStats(statsData);
        setGamStats(gamData);
        setCoinHistory(coinData);
        // Update global store for navbar
        if (gamData) useGamificationStore.getState().loadStats(user.uid);
      } catch (err) {
        // If backend returns 404 / error, the user no longer exists (DB recreated)
        console.warn("Failed to load profile:", err);
        localStorage.removeItem("user");
        navigate("/login");
        return;
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = () => {
    localStorage.removeItem("user");
    useProgressStore.getState().clearForLogout();
    useGamificationStore.getState().clearStats();
    // Signal the Chrome extension (if installed) to drop its cached lcusername
    // so the next person who logs in doesn't see a stale "App Linked" value.
    window.postMessage({ type: "VANTAGE_LOGOUT" }, "*");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  const displayUser = profile || user;
  const rating = displayUser?.rating ?? 0;
  const tier = getRatingTier(rating);
  const TierIcon = tier.icon;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Top bar ── */}
      <header className=" top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <h1 className="text-sm font-semibold">Profile</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* ═══════════ HERO CARD ═══════════ */}
        <Card className="overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-[#5542FF] to-[#B28EF2]" />
          <CardContent className="relative pt-0 pb-6">
            {/* Avatar */}
            <div className="absolute -top-10 left-6">
              <div className="w-20 h-20 rounded-xl bg-background border-4 border-background shadow-lg grid place-items-center">
                <User size={32} className="text-muted-foreground" />
              </div>
            </div>

            <div className="pt-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">{displayUser?.username}</h2>
                <p className="text-sm text-muted-foreground">{displayUser?.email}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {displayUser?.institutionName && (
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Building2 size={12} /> {displayUser.institutionName}
                    </Badge>
                  )}
                  {displayUser?.graduationYear && (
                    <Badge variant="outline" className="gap-1 text-xs">
                      <GraduationCap size={12} /> {displayUser.graduationYear}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Rating badge */}
              <div className={cn("flex items-center gap-3 px-4 py-2.5 rounded-xl border", tier.bg, tier.border)}>
                <TierIcon size={24} className={tier.color} />
                <div className="text-right">
                  <p className={cn("text-2xl font-bold tabular-nums", tier.color)}>{rating}</p>
                  <p className={cn("text-[11px] font-medium uppercase tracking-wider", tier.color)}>{tier.label}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ═══════════ STATS GRID ═══════════ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={CheckCircle}
            label="Solved"
            value={stats?.solved ?? totalProgress.completed}
            color="text-emerald-500"
            bg="bg-emerald-500/10"
          />
          <StatCard
            icon={Clock}
            label="Attempted"
            value={stats?.attempted ?? 0}
            color="text-amber-500"
            bg="bg-amber-500/10"
          />
          <StatCard
            icon={Lock}
            label="Not Started"
            value={stats?.notStarted ?? (totalProgress.total - totalProgress.completed)}
            color="text-muted-foreground"
            bg="bg-muted/50"
          />
          <StatCard
            icon={Target}
            label="Total"
            value={stats?.total ?? totalProgress.total}
            color="text-blue-500"
            bg="bg-blue-500/10"
          />
        </div>

        {/* ═══════════ GAMIFICATION STATS ═══════════ */}
        {gamStats && (
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sparkles size={16} className="text-violet-500" />
                Gamification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Level */}
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20">
                    <Sparkles size={28} className="text-violet-500" />
                  </div>
                  <p className="text-3xl font-bold tabular-nums text-violet-600 dark:text-violet-400">
                    {gamStats.level}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {gamStats.title}
                  </p>
                </div>

                {/* XP Progress */}
                <div className="space-y-3 flex flex-col justify-center">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>XP</span>
                    <span className="tabular-nums">
                      {gamStats.xp.toLocaleString()} / {gamStats.xpForNextLevel.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(100, gamStats.xpForNextLevel > gamStats.xpForCurrentLevel
                          ? ((gamStats.xp - gamStats.xpForCurrentLevel) / (gamStats.xpForNextLevel - gamStats.xpForCurrentLevel)) * 100
                          : 100)}%`,
                        background: "linear-gradient(to right, #8b5cf6, #a78bfa)",
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground text-center">
                    {gamStats.xpForNextLevel - gamStats.xp > 0
                      ? `${(gamStats.xpForNextLevel - gamStats.xp).toLocaleString()} XP to next level`
                      : "Max level reached!"}
                  </p>
                </div>

                {/* Coins */}
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                    <Coins size={28} className="text-amber-500" />
                  </div>
                  <p className="text-3xl font-bold tabular-nums text-amber-600 dark:text-amber-400">
                    {gamStats.coins.toLocaleString()}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Coins
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ═══════════ DIFFICULTY BREAKDOWN ═══════════ */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 size={16} className="text-muted-foreground" />
              Difficulty Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <DifficultyBar
                label="Easy"
                count={diffBreakdown.easy}
                total={ALL_PROBLEMS.filter(p => p.difficulty === Difficulty.EASY).length}
                color="#22c55e"
              />
              <DifficultyBar
                label="Medium"
                count={diffBreakdown.medium}
                total={ALL_PROBLEMS.filter(p => p.difficulty === Difficulty.MEDIUM).length}
                color="#f59e0b"
              />
              <DifficultyBar
                label="Hard"
                count={diffBreakdown.hard}
                total={ALL_PROBLEMS.filter(p => p.difficulty === Difficulty.HARD).length}
                color="#ef4444"
              />
            </div>
          </CardContent>
        </Card>

        {/* ═══════════ OVERALL PROGRESS BAR ═══════════ */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Trophy size={16} className="text-amber-500" />
              Overall Conquest Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${totalProgress.percentage}%`,
                    background: "linear-gradient(to right, #5542FF, #B28EF2)",
                  }}
                />
              </div>
              <span className="text-sm font-semibold tabular-nums text-muted-foreground">
                {totalProgress.percentage}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {totalProgress.completed} of {totalProgress.total} problems conquered
            </p>
          </CardContent>
        </Card>

        {/* ═══════════ COIN HISTORY ═══════════ */}
        {coinHistory && coinHistory.content && coinHistory.content.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Coins size={16} className="text-amber-500" />
                Coin History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 text-xs font-medium text-muted-foreground">Source</th>
                      <th className="pb-2 text-xs font-medium text-muted-foreground text-right">Amount</th>
                      <th className="pb-2 text-xs font-medium text-muted-foreground text-right">Balance</th>
                      <th className="pb-2 text-xs font-medium text-muted-foreground text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coinHistory.content.map((tx) => (
                      <tr key={tx.id} className="border-b border-border/50 last:border-0">
                        <td className="py-2">
                          <Badge variant="outline" className="text-[10px]">
                            {tx.source.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className={cn(
                          "py-2 text-right font-bold tabular-nums",
                          tx.amount > 0 ? "text-emerald-500" : "text-red-500"
                        )}>
                          {tx.amount > 0 ? "+" : ""}{tx.amount}
                        </td>
                        <td className="py-2 text-right tabular-nums text-muted-foreground">
                          {tx.balanceAfter}
                        </td>
                        <td className="py-2 text-right text-xs text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {coinHistory.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-4">
                  <button
                    onClick={async () => {
                      if (coinPage > 0) {
                        const newPage = coinPage - 1;
                        setCoinPage(newPage);
                        const data = await fetchCoinHistory(user.uid, newPage, 10);
                        setCoinHistory(data);
                      }
                    }}
                    disabled={coinPage === 0}
                    className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    Page {coinPage + 1} of {coinHistory.totalPages}
                  </span>
                  <button
                    onClick={async () => {
                      if (coinPage < coinHistory.totalPages - 1) {
                        const newPage = coinPage + 1;
                        setCoinPage(newPage);
                        const data = await fetchCoinHistory(user.uid, newPage, 10);
                        setCoinHistory(data);
                      }
                    }}
                    disabled={coinPage >= coinHistory.totalPages - 1}
                    className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ═══════════ STAGE PROGRESS ═══════════ */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Target size={16} className="text-muted-foreground" />
              Stage Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {STAGE_ORDER.map((key) => {
                const stage = STAGES[key];
                const prog = getStageProgress(key);
                return (
                  <div
                    key={key}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors",
                      prog.isComplete
                        ? "border-[#5542FF]/30 bg-[#5542FF]/5 dark:bg-[#5542FF]/10"
                        : "border-border bg-card"
                    )}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="flex-1 text-xs font-medium text-foreground truncate">
                      {stage.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${prog.percentage}%`,
                            backgroundColor: prog.isComplete ? "#5542FF" : stage.color,
                          }}
                        />
                      </div>
                      <span className="text-[10px] tabular-nums text-muted-foreground font-mono w-7 text-right">
                        {prog.completed}/{prog.total}
                      </span>
                    </div>
                    {prog.isComplete && (
                      <CheckCircle size={12} className="text-[#5542FF] dark:text-[#B28EF2] shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

/* ─── Stat Card ─── */
function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={cn("grid place-items-center w-10 h-10 rounded-lg", bg)}>
          <Icon size={20} className={color} />
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums">{value}</p>
          <p className="text-[11px] text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Difficulty Bar ─── */
function DifficultyBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="text-center space-y-2">
      <p className="text-2xl font-bold tabular-nums" style={{ color }}>{count}</p>
      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-[11px] text-muted-foreground">
        {label} <span className="tabular-nums">({count}/{total})</span>
      </p>
    </div>
  );
}

export default ProfilePage;
