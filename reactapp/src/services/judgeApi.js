import { API_BASE, authFetch } from "./api";

const json = () => ({ "Content-Type": "application/json" });

export async function fetchProblems() {
  const res = await authFetch(`${API_BASE}/judge/problems`);
  if (!res.ok) throw new Error("Failed to fetch problems");
  return res.json();
}

export async function fetchProblem(id) {
  const res = await authFetch(`${API_BASE}/judge/problems/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch problem: ${id}`);
  return res.json();
}

export async function submitCode({ problemId, language, code }) {
  const res = await authFetch(`${API_BASE}/judge/submit`, {
    method: "POST",
    headers: json(),
    body: JSON.stringify({ problemId, language, code }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Submission failed");
  }
  return res.json();
}

export async function runCode({ language, code, input }) {
  const res = await authFetch(`${API_BASE}/judge/run`, {
    method: "POST",
    headers: json(),
    body: JSON.stringify({ language, code, input }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Run failed");
  }
  return res.json();
}

export async function traceCode(payload) {
  const { language, code, input = "" } = payload || {};
  const res = await authFetch(`${API_BASE}/judge/trace`, {
    method: "POST",
    headers: json(),
    body: JSON.stringify({ language, code, input }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Trace failed");
  }
  return res.json();
}
