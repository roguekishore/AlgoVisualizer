const express = require("express");
const router = express.Router();
const { executeCode, runAgainstTestCases } = require("../executor");
const { getProblem } = require("../problemStore");

/**
 * POST /api/submit
 * Submit code for full evaluation against all test cases
 */
router.post("/submit", async (req, res) => {
  const { problemId, language, code } = req.body;

  if (!problemId || !language || !code) {
    return res.status(400).json({ error: "Missing required fields: problemId, language, code" });
  }

  if (!["cpp", "java"].includes(language)) {
    return res.status(400).json({ error: "Unsupported language. Use 'cpp' or 'java'." });
  }

  const problem = getProblem(problemId);
  if (!problem) {
    return res.status(404).json({ error: `Problem '${problemId}' not found.` });
  }

  try {
    const result = await runAgainstTestCases(language, code, problem.testCases);
    return res.json(result);
  } catch (err) {
    console.error("Submission error:", err);
    return res.status(500).json({ error: "Internal server error during code execution." });
  }
});

/**
 * POST /api/run
 * Run code with custom input (single execution, no test case comparison)
 */
router.post("/run", async (req, res) => {
  const { language, code, input = "" } = req.body;

  if (!language || !code) {
    return res.status(400).json({ error: "Missing required fields: language, code" });
  }

  if (!["cpp", "java"].includes(language)) {
    return res.status(400).json({ error: "Unsupported language. Use 'cpp' or 'java'." });
  }

  try {
    const result = await executeCode(language, code, input);
    return res.json({
      status: result.compilationError ? "Compilation Error" : result.tle ? "Time Limit Exceeded" : result.exitCode !== 0 ? "Runtime Error" : "Success",
      stdout: result.stdout,
      stderr: result.stderr,
      time: result.time,
    });
  } catch (err) {
    console.error("Run error:", err);
    return res.status(500).json({ error: "Internal server error during code execution." });
  }
});

module.exports = router;
