const API_BASE = "http://localhost:8080/api";

/**
 * Get the current logged-in user from localStorage.
 * Returns null if not logged in.
 */
export function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Fetch user stats (solved, attempted, notStarted, total).
 */
export async function fetchUserStats(userId) {
  const res = await fetch(`${API_BASE}/progress/stats?userId=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch user stats");
  return res.json();
}

/**
 * Fetch user profile by ID.
 */
export async function fetchUserProfile(userId) {
  const res = await fetch(`${API_BASE}/users/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch user profile");
  return res.json();
}
