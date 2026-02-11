const fs = require("fs");
const path = require("path");

const problemsDir = path.join(__dirname, "problems");
const problemsCache = new Map();

/**
 * Load all problem definitions from the problems directory
 */
function loadProblems() {
  problemsCache.clear();
  const files = fs.readdirSync(problemsDir).filter((f) => f.endsWith(".js"));
  for (const file of files) {
    const problem = require(path.join(problemsDir, file));
    problemsCache.set(problem.id, problem);
  }
  console.log(`📚 Loaded ${problemsCache.size} problem(s)`);
}

/**
 * Get all problems (summary list)
 */
function getAllProblems() {
  return Array.from(problemsCache.values()).map((p) => ({
    id: p.id,
    title: p.title,
    difficulty: p.difficulty,
    category: p.category,
    tags: p.tags,
  }));
}

/**
 * Get a single problem by ID (full details)
 */
function getProblem(id) {
  return problemsCache.get(id) || null;
}

// Load problems on startup
loadProblems();

module.exports = { getAllProblems, getProblem, loadProblems };
