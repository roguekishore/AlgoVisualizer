import { create } from "zustand";
import { fetchPlayerStats } from "@/services/gamificationApi";
import { getStoredUser } from "@/services/userApi";

/**
 * Global gamification store — coins, XP, level, streaks.
 * Loaded once on app start for logged-in users.
 * Updated optimistically after problem solves.
 */
const useGamificationStore = create((set, get) => ({
  /* ── state ── */
  stats: null,       // PlayerStatsDTO from backend
  loading: false,
  error: null,

  /* ── actions ── */

  /** Fetch stats from backend and update store. */
  loadStats: async (userId) => {
    const uid = userId ?? getStoredUser()?.uid;
    if (!uid) return;
    set({ loading: true, error: null });
    try {
      const data = await fetchPlayerStats(uid);
      set({ stats: data, loading: false });
    } catch (err) {
      console.warn("Failed to load gamification stats:", err);
      set({ error: err.message, loading: false });
    }
  },

  /**
   * Optimistic update after a problem solve.
   * Adds approximate reward locally so the UI feels instant.
   * The next loadStats() call will reconcile with the real backend values.
   */
  optimisticSolve: (tag, isFirstAttempt = false) => {
    const { stats } = get();
    if (!stats) return;

    const coinTable = { BASIC: 3, EASY: 5, MEDIUM: 15, HARD: 30 };
    const xpTable   = { BASIC: 5, EASY: 10, MEDIUM: 25, HARD: 50 };
    
    let coins = coinTable[tag] || 5;
    const xp = xpTable[tag] || 10;

    if (isFirstAttempt) {
      coins = Math.ceil(coins * 1.2);
    }

    set({
      stats: {
        ...stats,
        coins: stats.coins + coins,
        xp: stats.xp + xp,
      },
    });
  },

  /** Clear store on logout. */
  clearStats: () => set({ stats: null, loading: false, error: null }),
}));

export default useGamificationStore;
