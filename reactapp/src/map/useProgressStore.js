import { create } from 'zustand';

/**
 * ============================================
 * DSA CONQUEST MAP - PROGRESS STORE
 * ============================================
 * 
 * Backend is the SINGLE SOURCE OF TRUTH for user progress.
 * This store is a client-side cache that:
 *   1. Fetches progress from the backend on map load
 *   2. Sends completions to the backend
 *   3. Provides derived helpers (locked/available/completed/current)
 * 
 * NO localStorage persistence — all state comes from the backend.
 * 
 * ID MAPPING:
 *   Frontend IDs are strings like 'stage1-1', 'stage4-2'
 *   Backend PIDs are integers 1, 2, 3, ... 164
 *   Both lists are in the SAME insertion order, so:
 *     backendPid = ALL_PROBLEMS.indexOf(problem) + 1
 */

// Import all data from the unified source
import {
  ALL_PROBLEMS,
  STAGES,
  STAGE_ORDER,
  TOPICS,
  ROADMAP_ORDER,
  FULL_ROADMAP,
  ALL_COUNTRY_IDS,
  COUNTRY_NAME_TO_CODE,
  CODE_TO_COUNTRY_NAME,
  PROBLEM_TO_COUNTRY,
  COUNTRY_TO_PROBLEM,
  getProblemById,
  getProblemsByStage,
  getProblemsByTopic,
  getCountryForProblem,
  getProblemForCountry,
  isPlaceholderCountry,
  getLeetCodeUrl,
  getLeetCodeUrlForProblem,
  getVisualizerRoute,
  getNewProblems,
  getProblemsWithVisualizers,
  getProblemsWithLeetCode,
  hasJudgeProblem,
  getJudgeRoute,
  getJudgeId,
  getProblemsWithJudge,
  getConquestIdByJudgeId,
  Difficulty,
  STATS,
} from '../data/dsa-conquest-map';

// Re-export everything from the data source for backward compatibility
export {
  ALL_PROBLEMS,
  STAGES,
  STAGE_ORDER,
  TOPICS,
  ROADMAP_ORDER,
  FULL_ROADMAP,
  ALL_COUNTRY_IDS,
  COUNTRY_NAME_TO_CODE,
  CODE_TO_COUNTRY_NAME,
  PROBLEM_TO_COUNTRY,
  COUNTRY_TO_PROBLEM,
  getProblemById,
  getProblemsByStage,
  getProblemsByTopic,
  getCountryForProblem,
  getProblemForCountry,
  isPlaceholderCountry,
  getLeetCodeUrl,
  getLeetCodeUrlForProblem,
  getVisualizerRoute,
  getNewProblems,
  getProblemsWithVisualizers,
  getProblemsWithLeetCode,
  hasJudgeProblem,
  getJudgeRoute,
  getJudgeId,
  getProblemsWithJudge,
  getConquestIdByJudgeId,
  Difficulty,
  STATS,
};

// =============================================================================
// ID MAPPING: Frontend string ID <-> Backend integer PID
// =============================================================================

const _frontendIdToPid = {};
const _pidToFrontendId = {};
ALL_PROBLEMS.forEach((p, index) => {
  const pid = index + 1; // backend auto-increment starts at 1
  _frontendIdToPid[p.id] = pid;
  _pidToFrontendId[pid] = p.id;
});

/** Convert frontend ID ('stage1-1') to backend PID (1) */
export const toBackendPid = (frontendId) => _frontendIdToPid[frontendId] ?? null;

/** Convert backend PID (1) to frontend ID ('stage1-1') */
export const toFrontendId = (backendPid) => _pidToFrontendId[backendPid] ?? null;

// =============================================================================
// API helpers
// =============================================================================

const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:8080') + '/api';

async function apiFetchProgress(userId) {
  const res = await fetch(`${API_BASE}/progress?userId=${userId}`);
  if (!res.ok) throw new Error('Failed to fetch progress');
  return res.json();
}

async function apiMarkSolved(userId, backendPid) {
  const res = await fetch(`${API_BASE}/progress/${backendPid}/solve?userId=${userId}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to mark solved');
  return res.json();
}

async function apiMarkAttempted(userId, backendPid) {
  const res = await fetch(`${API_BASE}/progress/${backendPid}/attempt?userId=${userId}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to mark attempted');
  return res.json();
}

// =============================================================================
// ZUSTAND STORE (no persistence — backend is truth)
// =============================================================================

const useProgressStore = create((set, get) => ({
  // Cache of completed frontend problem IDs (e.g. ['stage1-1', 'stage2-3'])
  completedProblems: [],

  // Loading flag for UI
  isLoading: false,

  // ─── Load from backend ──────────────────────────────────────────────

  /**
   * Fetch all progress from backend and populate the store.
   * Call on WorldMap mount / after login.
   */
  loadProgress: async (userId) => {
    if (!userId) return;
    // Clear stale data immediately — backend is always the source of truth
    set({ isLoading: true, completedProblems: [] });
    try {
      const progressMap = await apiFetchProgress(userId);
      const solvedFrontendIds = Object.values(progressMap)
        .filter(p => p.status === 'SOLVED')
        .map(p => toFrontendId(p.pid))
        .filter(Boolean);
      set({ completedProblems: solvedFrontendIds });
    } catch (err) {
      console.warn('Failed to load progress from backend:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  // ─── Live SSE subscription ─────────────────────────────────────────

  /** @type {EventSource|null} */
  _eventSource: null,

  /**
   * Open an SSE connection to receive real-time progress updates.
   * Call once on map mount; the stream auto-reconnects on disconnect.
   * Returns a cleanup function for useEffect teardown.
   */
  subscribeToLiveUpdates: (userId) => {
    if (!userId) return () => {};

    // Tear down any previous connection
    get()._eventSource?.close();

    const es = new EventSource(`${API_BASE}/progress/stream?userId=${userId}`);
    set({ _eventSource: es });

    es.addEventListener('connected', () => {
      console.log('[ProgressStore] SSE connected for userId', userId);
    });

    es.addEventListener('progress-update', (e) => {
      try {
        const event = JSON.parse(e.data);
        const frontendId = toFrontendId(event.pid);
        if (!frontendId) return;

        const { completedProblems } = get();

        if (event.status === 'SOLVED') {
          // Add to completed if not already there
          if (!completedProblems.includes(frontendId)) {
            console.log('[ProgressStore] Live update: SOLVED', frontendId, event.slug);
            set({ completedProblems: [...completedProblems, frontendId] });

            // Also refresh user rating in localStorage
            try {
              const user = JSON.parse(localStorage.getItem('user'));
              if (user?.uid) {
                fetch(`${API_BASE}/users/${user.uid}`)
                  .then(r => r.ok ? r.json() : null)
                  .then(profile => {
                    if (profile) {
                      localStorage.setItem('user', JSON.stringify({ ...user, rating: profile.rating }));
                    }
                  })
                  .catch(() => {});
              }
            } catch { /* non-critical */ }
          }
        } else if (event.status === 'ATTEMPTED') {
          console.log('[ProgressStore] Live update: ATTEMPTED', frontendId, event.slug, 'x' + event.attemptCount);
          // ATTEMPTED doesn't add to completedProblems (only SOLVED does),
          // but components can listen to the store's state if we want to show attempt badges later.
        }
      } catch (err) {
        console.warn('[ProgressStore] Failed to parse SSE event:', err);
      }
    });

    es.onerror = () => {
      console.warn('[ProgressStore] SSE connection error — will auto-reconnect');
    };

    // Return cleanup function
    return () => {
      es.close();
      set({ _eventSource: null });
      console.log('[ProgressStore] SSE disconnected');
    };
  },

  /**
   * Close the SSE connection. Call on unmount or logout.
   */
  unsubscribeFromLiveUpdates: () => {
    get()._eventSource?.close();
    set({ _eventSource: null });
  },

  // ─── Mark complete (calls backend, then updates cache) ─────────────

  /**
   * Complete a problem: validates unlock, calls backend, updates cache.
   * Returns { success, nextProblem }.
   */
  completeProblem: async (problemId) => {
    const { completedProblems, isProblemUnlocked } = get();

    if (!isProblemUnlocked(problemId)) return { success: false, nextProblem: null };
    if (completedProblems.includes(problemId)) return { success: false, nextProblem: null };

    // Determine next problem BEFORE updating
    const currentIndex = FULL_ROADMAP.findIndex(p => p.id === problemId);
    const nextProblem = FULL_ROADMAP[currentIndex + 1] || null;

    // Get user
    let user = null;
    try { user = JSON.parse(localStorage.getItem('user')); } catch { /* ignore */ }
    if (!user?.uid) return { success: false, nextProblem: null };

    const backendPid = toBackendPid(problemId);
    if (!backendPid) return { success: false, nextProblem: null };

    try {
      await apiMarkSolved(user.uid, backendPid);

      // Update local cache
      set({ completedProblems: [...completedProblems, problemId] });

      // Refresh user rating in localStorage
      try {
        const profileRes = await fetch(`${API_BASE.replace('/api', '')}/api/users/${user.uid}`);
        if (profileRes.ok) {
          const profile = await profileRes.json();
          localStorage.setItem('user', JSON.stringify({ ...user, rating: profile.rating }));
        }
      } catch { /* non-critical */ }

      return { success: true, nextProblem };
    } catch (err) {
      console.error('Failed to mark problem as solved:', err);
      return { success: false, nextProblem: null };
    }
  },

  /**
   * Mark a problem as attempted (wrong answer / runtime error / etc).
   * Fire-and-forget — doesn't block the UI.
   * Accepts a conquest-map ID (e.g. 'stage1-1').
   */
  markProblemAttempted: async (problemId) => {
    let user = null;
    try { user = JSON.parse(localStorage.getItem('user')); } catch { /* ignore */ }
    if (!user?.uid) return;

    const backendPid = toBackendPid(problemId);
    if (!backendPid) return;

    try {
      await apiMarkAttempted(user.uid, backendPid);
      console.log('[ProgressStore] Marked attempted:', problemId);
    } catch (err) {
      console.warn('Failed to mark problem as attempted:', err);
    }
  },

  // ─── Derived helpers ────────────────────────────────────────────────

  isProblemCompleted: (problemId) => {
    return get().completedProblems.includes(problemId);
  },

  isProblemUnlocked: (problemId) => {
    const { completedProblems } = get();
    const problem = getProblemById(problemId);
    if (!problem) return false;

    // A solved problem is always considered unlocked
    if (completedProblems.includes(problemId)) return true;

    // First problem in any stage is always unlocked
    if (problem.order === 1) return true;

    const stageProblems = getProblemsByStage(problem.stage);

    // Standard rule: previous problem in the stage must be completed
    const prevProblem = stageProblems.find(p => p.order === problem.order - 1);
    if (prevProblem && completedProblems.includes(prevProblem.id)) return true;

    // LC-sync rule: if ANY later problem in this stage is already solved,
    // all earlier problems in the stage are unlocked (user jumped ahead)
    const hasLaterSolve = stageProblems.some(
      p => p.order > problem.order && completedProblems.includes(p.id)
    );
    if (hasLaterSolve) return true;

    return false;
  },

  getProblemState: (problemId) => {
    const { completedProblems, isProblemUnlocked } = get();
    // Completed always takes priority (even if the sequential lock says otherwise)
    if (completedProblems.includes(problemId)) return 'completed';
    if (isProblemUnlocked(problemId)) return 'available';
    return 'locked';
  },

  getCurrentRoadmapProblem: () => {
    const { completedProblems } = get();
    return FULL_ROADMAP.find(p => !completedProblems.includes(p.id)) || null;
  },

  getRoadmapIndex: () => {
    const { completedProblems } = get();
    const currentProblem = FULL_ROADMAP.find(p => !completedProblems.includes(p.id));
    return currentProblem ? FULL_ROADMAP.indexOf(currentProblem) : FULL_ROADMAP.length;
  },

  getNextRoadmapProblem: () => {
    const index = get().getRoadmapIndex();
    return FULL_ROADMAP[index + 1] || null;
  },

  // Debug/testing only
  markStageComplete: (stage) => {
    const { completedProblems } = get();
    const stageProblems = getProblemsByStage(stage);
    const newCompleted = [...new Set([...completedProblems, ...stageProblems.map(p => p.id)])];
    set({ completedProblems: newCompleted });
  },

  getStageProgress: (stage) => {
    const { completedProblems } = get();
    const stageProblems = getProblemsByStage(stage);
    const completed = stageProblems.filter(p => completedProblems.includes(p.id)).length;
    return {
      completed,
      total: stageProblems.length,
      percentage: stageProblems.length > 0 ? Math.round((completed / stageProblems.length) * 100) : 0,
      isComplete: completed === stageProblems.length,
    };
  },

  getTopicProgress: (topic) => {
    const { completedProblems } = get();
    const topicProblems = getProblemsByTopic(topic);
    const completed = topicProblems.filter(p => completedProblems.includes(p.id)).length;
    return {
      completed,
      total: topicProblems.length,
      percentage: topicProblems.length > 0 ? Math.round((completed / topicProblems.length) * 100) : 0,
      isComplete: completed === topicProblems.length,
    };
  },

  getTotalProgress: () => {
    const { completedProblems } = get();
    return {
      completed: completedProblems.length,
      total: ALL_PROBLEMS.length,
      percentage: Math.round((completedProblems.length / ALL_PROBLEMS.length) * 100),
    };
  },

  resetProgress: () => {
    set({ completedProblems: [] });
  },

  clearForLogout: () => {
    get().unsubscribeFromLiveUpdates();
    set({ completedProblems: [] });
  },
}));

export default useProgressStore;
