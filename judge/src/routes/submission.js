const express = require("express");
const router = express.Router();
const { executeCode, runAgainstTestCases } = require("../executor");
const { getProblem } = require("../problemStore");

const MAX_CODE_SIZE = 64 * 1024;   // 64 KB
const MAX_INPUT_SIZE = 1024 * 1024; // 1 MB

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

  if (typeof code !== "string" || code.length > MAX_CODE_SIZE) {
    return res.status(400).json({ error: `Code exceeds maximum size of ${MAX_CODE_SIZE / 1024} KB.` });
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

  if (typeof code !== "string" || code.length > MAX_CODE_SIZE) {
    return res.status(400).json({ error: `Code exceeds maximum size of ${MAX_CODE_SIZE / 1024} KB.` });
  }

  if (typeof input !== "string" || input.length > MAX_INPUT_SIZE) {
    return res.status(400).json({ error: `Input exceeds maximum size of ${MAX_INPUT_SIZE / 1024} KB.` });
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
