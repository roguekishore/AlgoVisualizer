const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const { getAllProblems, getProblem } = require("../problemStore");

/**
 * Constant-time compare of the shared secret.
 * Returns false when JUDGE_TOKEN is unset so the internal route fails CLOSED
 * rather than serving hidden test cases to the public internet.
 */
function tokenOk(req) {
  const expected = process.env.JUDGE_TOKEN;
  if (!expected) return false;
  const a = Buffer.from(req.get("x-judge-token") || "", "utf8");
  const b = Buffer.from(expected, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * GET /api/problems
 * Returns summary list of all problems
 */
router.get("/problems", (_req, res) => {
  const problems = getAllProblems();
  res.json(problems);
});

/**
 * GET /api/problems/:id
 * Returns full problem details
 */
router.get("/problems/:id", (req, res) => {
  const problem = getProblem(req.params.id);
  if (!problem) {
    return res.status(404).json({ error: `Problem '${req.params.id}' not found.` });
  }

  // Return everything except raw test case expected outputs (for security)
  const { testCases, solution, ...publicData } = problem;
  res.json({
    ...publicData,
    testCaseCount: testCases.length,
    sampleTestCases: testCases.slice(0, 2), // Show first 2 as examples
  });
});

/**
 * GET /api/internal/problems/:id
 * Full test cases for the executor path. Token-guarded: this catalog is
 * reachable from the public internet, and these are the hidden expected
 * outputs. Only Spring holds the token.
 *
 * Returns just {id, testCases} — the reference `solution` never leaves here.
 */
router.get("/internal/problems/:id", (req, res) => {
  if (!tokenOk(req)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const problem = getProblem(req.params.id);
  if (!problem) {
    return res.status(404).json({ error: `Problem '${req.params.id}' not found.` });
  }
  res.json({ id: problem.id, testCases: problem.testCases });
});

module.exports = router;
