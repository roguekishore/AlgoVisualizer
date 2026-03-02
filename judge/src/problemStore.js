const fs = require("fs");
const path = require("path");

const problemsDir = path.join(__dirname, "problems");
const problemsCache = new Map();

/**
 * Recursively collect all .js files under a directory.
 */
function collectJsFiles(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(collectJsFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Load all problem definitions from the problems directory (including subdirectories).
 */
function loadProblems() {
  problemsCache.clear();
  const files = collectJsFiles(problemsDir);
  for (const fullPath of files) {
    try {
      // Clear require cache so re-runs always pick up fresh content
      delete require.cache[require.resolve(fullPath)];
      const problem = require(fullPath);
      if (problem && problem.id) {
        problemsCache.set(problem.id, problem);
      } else {
        console.warn(`⚠  Skipping ${path.relative(problemsDir, fullPath)} — no 'id' field`);
      }
    } catch (err) {
      console.error(`✗  Failed to load ${path.relative(problemsDir, fullPath)}:`, err.message);
    }
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
