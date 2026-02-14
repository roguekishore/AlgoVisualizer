/**
 * Problem API Service
 * Connects the React frontend to the Spring Boot backend for problem listing,
 * filtering, pagination, sorting, and detail retrieval.
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

/**
 * Fetch paginated problems with optional filters.
 * @param {Object} params
 * @param {number} params.page - Page number (0-indexed)
 * @param {number} params.size - Page size
 * @param {string} params.sort - Sort field and direction e.g. "title,asc"
 * @param {string} [params.topic] - Filter by topic name
 * @param {string} [params.tag] - Filter by difficulty (EASY, MEDIUM, HARD)
 * @param {string} [params.keyword] - Search by title keyword
 * @returns {Promise<Object>} Spring Boot Page response
 */
export async function fetchProblems({ page = 0, size = 20, sort = "pid,asc", topic, tag, keyword } = {}) {
  // If keyword is provided, use the search endpoint
  if (keyword && keyword.trim()) {
    const params = new URLSearchParams({ keyword: keyword.trim(), page, size, sort });
    const res = await fetch(`${API_BASE_URL}/api/problems/search?${params}`);
    if (!res.ok) throw new Error("Failed to search problems");
    return res.json();
  }

  const params = new URLSearchParams({ page, size, sort });
  if (topic) params.append("topic", topic);
  if (tag) params.append("tag", tag);

  const res = await fetch(`${API_BASE_URL}/api/problems?${params}`);
  if (!res.ok) throw new Error("Failed to fetch problems");
  return res.json();
}

/**
 * Fetch a single problem by ID.
 * @param {number} id - Problem ID
 * @returns {Promise<Object>} ProblemResponseDTO
 */
export async function fetchProblemById(id) {
  const res = await fetch(`${API_BASE_URL}/api/problems/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch problem: ${id}`);
  return res.json();
}

/**
 * Fetch all topic names.
 * @returns {Promise<string[]>} Sorted list of topic names
 */
export async function fetchTopics() {
  const res = await fetch(`${API_BASE_URL}/api/topics`);
  if (!res.ok) throw new Error("Failed to fetch topics");
  return res.json();
}
