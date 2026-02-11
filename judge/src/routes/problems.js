const express = require("express");
const router = express.Router();
const { getAllProblems, getProblem } = require("../problemStore");

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
  const { testCases, ...publicData } = problem;
  res.json({
    ...publicData,
    testCaseCount: testCases.length,
    sampleTestCases: testCases.slice(0, 2), // Show first 2 as examples
  });
});

module.exports = router;
