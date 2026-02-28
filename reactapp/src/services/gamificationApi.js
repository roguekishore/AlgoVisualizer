const API_BASE = (process.env.REACT_APP_API_URL || "http://localhost:8080") + "/api";

/**
 * Fetch current player's gamification stats.
 * Returns: { userId, coins, xp, level, title, xpForCurrentLevel, xpForNextLevel, currentStreak, longestStreak, battleRating }
 */
export async function fetchPlayerStats(userId) {
  const res = await fetch(`${API_BASE}/me/stats?userId=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch player stats");
  return res.json();
}

/**
 * Fetch public gamification stats for any user.
 */
export async function fetchPublicPlayerStats(userId) {
  const res = await fetch(`${API_BASE}/users/${userId}/stats`);
  if (!res.ok) throw new Error("Failed to fetch player stats");
  return res.json();
}

/**
 * Fetch paginated coin transaction history.
 * Returns a Spring Page object: { content: [...], totalPages, totalElements, ... }
 */
export async function fetchCoinHistory(userId, page = 0, size = 20) {
  const res = await fetch(`${API_BASE}/me/coin-history?userId=${userId}&page=${page}&size=${size}`);
  if (!res.ok) throw new Error("Failed to fetch coin history");
  return res.json();
}
