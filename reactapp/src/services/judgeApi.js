/**
 * Judge API Service
 * Connects the React frontend to the standalone judge backend.
 * 
 * Configuration:
 * - Set REACT_APP_JUDGE_URL in .env file (never commit .env to git)
 * - For local development: REACT_APP_JUDGE_URL=http://localhost:9000
 * - For production: REACT_APP_JUDGE_URL=http://your-server:9000
 */

const JUDGE_BASE_URL = process.env.REACT_APP_JUDGE_URL || "http://localhost:9000";

/**
 * Fetch all problems (summary)
 */


export async function fetchProblems() {
  const res = await fetch(`${JUDGE_BASE_URL}/api/problems`);
  if (!res.ok) throw new Error("Failed to fetch problems");
  return res.json();
}

/**
 * Fetch a single problem by ID (full details)
 */
export async function fetchProblem(id) {
  const res = await fetch(`${JUDGE_BASE_URL}/api/problems/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch problem: ${id}`);
  return res.json();
}

/**
 * Submit code for full evaluation against all test cases
 * @param {{ problemId: string, language: string, code: string }} payload
 */
export async function submitCode({ problemId, language, code }) {
  const res = await fetch(`${JUDGE_BASE_URL}/api/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ problemId, language, code }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Submission failed");
  }
  return res.json();
}

/**
 * Run code with custom input (single execution)
 * @param {{ language: string, code: string, input: string }} payload
 */
export async function runCode({ language, code, input }) {
  const res = await fetch(`${JUDGE_BASE_URL}/api/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language, code, input }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Run failed");
  }
  return res.json();
}
