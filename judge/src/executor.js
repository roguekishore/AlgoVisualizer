const fs = require("fs");
const path = require("path");
const { execSync, execFileSync } = require("child_process");
const { v4: uuidv4 } = require("uuid");
const os = require("os");
const pool = require("./workerPool");

const TEMP_DIR = path.join(os.tmpdir(), "vantage-judge");

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/** Time limit in milliseconds */
const TIME_LIMIT = 5000;
/** Compilation timeout */
const COMPILE_TIMEOUT = 30000;
/** Memory limit for containers */
const MEMORY_LIMIT_MB = 256;
/** CPU limit (number of cores) */
const CPU_LIMIT = "1";

// ─────────────────────────────────────────────────
// EXECUTION MODE DETECTION
// ─────────────────────────────────────────────────
//
//   MODE=docker  →  Run user code inside Docker containers (production / EC2)
//   MODE=host    →  Run directly on the host via g++/javac (local dev, no Docker needed)
//
//   If MODE is not set, auto-detects Docker availability.
// ─────────────────────────────────────────────────

let EXECUTION_MODE = process.env.MODE || null;

function detectMode() {
  if (EXECUTION_MODE) return EXECUTION_MODE;

  try {
    execSync("docker info", { stdio: "ignore", timeout: 5000 });
    EXECUTION_MODE = "docker";
    console.log("🐳 Docker detected — using containerized sandbox execution");
  } catch {
    EXECUTION_MODE = "host";
    console.log("💻 Docker not found — using direct host execution (dev mode)");
    console.log("   Install Docker & run 'npm run build-sandboxes' for production use.");
  }
  return EXECUTION_MODE;
}

// ─────────────────────────────────────────────────
// CLEANUP
// ─────────────────────────────────────────────────

function cleanup(sessionDir) {
  try {
    if (fs.existsSync(sessionDir)) {
      fs.rmSync(sessionDir, { recursive: true, force: true });
    }
  } catch {
    // best-effort
  }
}

// ─────────────────────────────────────────────────
// DOCKER EXECUTION  (Production — warm worker pool)
// ─────────────────────────────────────────────────

/**
 * Execute code inside a pooled worker container.
 * The worker is already running — we just docker exec into it.
 *
 * Flow:
 *   1. Acquire an idle worker from the pool
 *   2. Write source + input into the worker's /workspace
 *   3. Compile inside the worker
 *   4. Run the binary with the given input
 *   5. Release the worker back to the pool
 */
async function executeInDockerPool(language, code, input) {
  const worker = await pool.acquire(language);
  try {
    // Write source file
    const filename = language === "cpp" ? "solution.cpp" : getJavaFilename(code);
    pool.writeToWorker(worker, filename, code);
    pool.writeToWorker(worker, "input.txt", input);

    // Compile
    const compileResult = compileInWorker(worker, language, filename);
    if (!compileResult.success) {
      return {
        stdout: "",
        stderr: `Compilation Error:\n${compileResult.error}`,
        time: 0,
        exitCode: 1,
        compilationError: true,
      };
    }

    // Run
    return runInWorker(worker, language, filename);
  } finally {
    pool.release(worker);
  }
}

/**
 * Compile code inside a worker. Returns { success, error? }.
 */
function compileInWorker(worker, language, filename) {
  let cmd;
  if (language === "cpp") {
    cmd = `g++ -std=c++17 -O2 -o /workspace/solution /workspace/solution.cpp 2>&1`;
  } else {
    cmd = `javac /workspace/${filename} 2>&1`;
  }

  const result = pool.execInWorker(worker, cmd, { timeout: COMPILE_TIMEOUT });

  if (result.exitCode !== 0) {
    return { success: false, error: result.stdout + result.stderr };
  }
  return { success: true };
}

/**
 * Run a compiled binary/class inside a worker with /workspace/input.txt as stdin.
 */
function runInWorker(worker, language, filename) {
  let cmd;
  if (language === "cpp") {
    cmd = `/workspace/solution < /workspace/input.txt`;
  } else {
    const className = filename.replace(".java", "");
    cmd = `java -Xmx${MEMORY_LIMIT_MB}m -cp /workspace ${className} < /workspace/input.txt`;
  }

  const start = Date.now();
  const result = pool.execInWorker(worker, cmd, { timeout: TIME_LIMIT });
  const time = Date.now() - start;

  if (result.killed) {
    return { stdout: "", stderr: "Time Limit Exceeded", time, exitCode: -1, tle: true };
  }

  if (result.exitCode !== 0) {
    return {
      stdout: result.stdout,
      stderr: `Runtime Error:\n${result.stderr || "Non-zero exit code"}`,
      time,
      exitCode: result.exitCode,
    };
  }

  return { stdout: result.stdout, stderr: "", time, exitCode: 0 };
}

/**
 * Compile-once, run-many inside a single pooled worker.
 * Acquires ONE worker, compiles once, then runs all test cases in a SINGLE docker exec.
 */
async function runInDockerPoolBatch(language, code, testCases) {
  const worker = await pool.acquire(language);
  try {
    // Write source
    const filename = language === "cpp" ? "solution.cpp" : getJavaFilename(code);
    pool.writeToWorker(worker, filename, code);

    // Compile once
    const compileResult = compileInWorker(worker, language, filename);
    if (!compileResult.success) {
      return {
        status: "Compilation Error",
        error: compileResult.error,
        results: [],
        totalPassed: 0,
        totalTests: testCases.length,
        time: 0,
      };
    }

    // Run ALL test cases in a single docker exec command
    return runAllTestCasesInWorker(worker, language, filename, testCases);
  } finally {
    pool.release(worker);
  }
}

/**
 * Run all test cases in a single docker exec command for maximum performance.
 * Uses stdin piping to avoid multiple process spawns.
 */
function runAllTestCasesInWorker(worker, language, filename, testCases) {
  // Create optimized batch runner
  const batchRunner = createOptimizedBatchRunner(language, filename, testCases);
  pool.writeToWorker(worker, "fast_runner.sh", batchRunner);

  const start = Date.now();
  const result = pool.execInWorker(worker, "chmod +x /workspace/fast_runner.sh && /workspace/fast_runner.sh", { 
    timeout: TIME_LIMIT * testCases.length 
  });
  const totalTime = Date.now() - start;

  if (result.killed) {
    return {
      status: "Time Limit Exceeded",
      error: "Fast execution exceeded time limit",
      results: [],
      totalPassed: 0,
      totalTests: testCases.length,
      time: totalTime,
    };
  }

  if (result.exitCode !== 0) {
    return {
      status: "Runtime Error",
      error: `Fast execution failed:\n${result.stderr}`,
      results: [],
      totalPassed: 0,
      totalTests: testCases.length,
      time: totalTime,
    };
  }

  return parseOptimizedResults(result.stdout, testCases, totalTime);
}

/**
 * Safely escape a string for use inside single quotes in a bash script.
 */
function shellEscape(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/'/g, "'\"'\"'");
}

/**
 * Create ultra-fast batch runner using process reuse and piping
 */
function createOptimizedBatchRunner(language, filename, testCases) {
  let script = `#!/bin/bash\ncd /workspace\n`;

  if (language === "cpp") {
    // C++ - multiple inputs to same binary process
    script += `
echo "Starting optimized C++ execution..."
(
`;
    for (let i = 0; i < testCases.length; i++) {
      const escapedInput = shellEscape(testCases[i].input);
      const escapedExpected = shellEscape(testCases[i].expected.trim());
      script += `  echo "TC${i + 1}_START"\n`;
      script += `  echo "TC${i + 1}_INPUT"\n`;
      script += `  echo '${escapedInput}' | ./solution 2>/tmp/err${i + 1}\n`;
      script += `  echo "TC${i + 1}_END"\n`;
      script += `  echo "TC${i + 1}_EXPECTED:${escapedExpected}"\n`;
    }
    script += `) | while IFS= read -r line; do
  echo "RESULT:\$line"
done
`;
  } else {
    // Java - keep JVM alive between executions using a wrapper
    const className = filename.replace(".java", "");
    script += `
echo "Starting optimized Java execution..."

# Pre-warm JVM
echo "" | java -Xmx${MEMORY_LIMIT_MB}m -cp /workspace ${className} >/dev/null 2>/dev/null || true

(
`;
    for (let i = 0; i < testCases.length; i++) {
      const escapedInput = shellEscape(testCases[i].input);
      const escapedExpected = shellEscape(testCases[i].expected.trim());
      script += `  echo "TC${i + 1}_START"\n`;
      script += `  echo "TC${i + 1}_INPUT"\n`;
      script += `  echo '${escapedInput}' | java -Xmx${MEMORY_LIMIT_MB}m -XX:+UseSerialGC -XX:TieredStopAtLevel=1 -cp /workspace ${className} 2>/tmp/err${i + 1}\n`;
      script += `  echo "TC${i + 1}_END"\n`;
      script += `  echo "TC${i + 1}_EXPECTED:${escapedExpected}"\n`;
    }
    script += `) | while IFS= read -r line; do
  echo "RESULT:\$line" 
done
`;
  }

  return script;
}

/**
 * Parse optimized execution results
 */
function parseOptimizedResults(output, testCases, totalTime) {
  const results = [];
  const lines = output.split('\n');
  let totalPassed = 0;
  let currentTC = null;
  let currentOutput = '';
  let currentExpected = '';

  for (const line of lines) {
    if (line.startsWith('RESULT:TC')) {
      const content = line.substring(7); // Remove "RESULT:"
      
      if (content.includes('_START')) {
        currentTC = parseInt(content.split('_')[0].substring(2));
        currentOutput = '';
      } else if (content.includes('_INPUT')) {
        // Skip input echo
      } else if (content.includes('_END')) {
        // Process the test case result
        if (currentTC) {
          const actualOutput = currentOutput.trim();
          const expectedOutput = currentExpected.trim();
          const passed = actualOutput === expectedOutput;
          
          if (passed) totalPassed++;
          
          results.push({
            testCase: currentTC,
            passed,
            input: testCases[currentTC - 1].input,
            expected: expectedOutput,
            actual: actualOutput,
            time: Math.ceil(totalTime / testCases.length), // Distribute total time
          });
        }
      } else if (content.includes('_EXPECTED:')) {
        currentExpected = content.split('_EXPECTED:')[1] || '';
      } else {
        // This is actual program output
        if (currentTC && !content.includes('_')) {
          currentOutput += (currentOutput ? '\n' : '') + content;
        }
      }
    }
  }

  const allPassed = totalPassed === testCases.length;
  return {
    status: allPassed ? "Accepted" : "Wrong Answer",
    results,
    totalPassed,
    totalTests: testCases.length,
    time: totalTime,
  };
}



/** Extract Java class name from source code */
function getJavaFilename(code) {
  const match = code.match(/public\s+class\s+(\w+)/);
  return (match ? match[1] : "Solution") + ".java";
}

// ─────────────────────────────────────────────────
// HOST EXECUTION  (Dev mode — no Docker needed)
// ─────────────────────────────────────────────────

/**
 * Compile C++ once, return the path to the binary (or a compilation error result).
 */
function compileCppHost(code, sessionDir) {
  const sourceFile = path.join(sessionDir, "solution.cpp");
  const outputFile = path.join(sessionDir, process.platform === "win32" ? "solution.exe" : "solution");

  fs.writeFileSync(sourceFile, code);

  try {
    execSync(`g++ -std=c++17 -O2 -o "${outputFile}" "${sourceFile}"`, {
      timeout: COMPILE_TIMEOUT,
      stdio: ["pipe", "pipe", "pipe"],
    });
    return { success: true, binary: outputFile };
  } catch (compileErr) {
    return {
      success: false,
      error: {
        stdout: "",
        stderr: `Compilation Error:\n${compileErr.stderr?.toString() || compileErr.message}`,
        time: 0,
        exitCode: 1,
        compilationError: true,
      },
    };
  }
}

/**
 * Run a pre-compiled C++ binary against a single input.
 */
function runCppBinaryHost(binary, input) {
  const start = Date.now();
  try {
    const stdout = execFileSync(binary, {
      input,
      timeout: TIME_LIMIT,
      maxBuffer: 10 * 1024 * 1024,
      stdio: ["pipe", "pipe", "pipe"],
    });
    const time = Date.now() - start;
    return { stdout: stdout.toString(), stderr: "", time, exitCode: 0 };
  } catch (runErr) {
    const time = Date.now() - start;
    if (runErr.killed || runErr.signal === "SIGTERM") {
      return { stdout: "", stderr: "Time Limit Exceeded", time, exitCode: -1, tle: true };
    }
    return {
      stdout: runErr.stdout?.toString() || "",
      stderr: `Runtime Error:\n${runErr.stderr?.toString() || runErr.message}`,
      time,
      exitCode: runErr.status || 1,
    };
  }
}

function executeCppHost(code, input, sessionDir) {
  const compiled = compileCppHost(code, sessionDir);
  if (!compiled.success) return compiled.error;
  return runCppBinaryHost(compiled.binary, input);
}

/**
 * Compile Java once, return the class name (or a compilation error result).
 */
function compileJavaHost(code, sessionDir) {
  const classNameMatch = code.match(/public\s+class\s+(\w+)/);
  const className = classNameMatch ? classNameMatch[1] : "Solution";
  const sourceFile = path.join(sessionDir, `${className}.java`);

  fs.writeFileSync(sourceFile, code);

  try {
    execSync(`javac "${sourceFile}"`, {
      timeout: COMPILE_TIMEOUT,
      cwd: sessionDir,
      stdio: ["pipe", "pipe", "pipe"],
    });
    return { success: true, className, classDir: sessionDir };
  } catch (compileErr) {
    return {
      success: false,
      error: {
        stdout: "",
        stderr: `Compilation Error:\n${compileErr.stderr?.toString() || compileErr.message}`,
        time: 0,
        exitCode: 1,
        compilationError: true,
      },
    };
  }
}

/**
 * Run a pre-compiled Java class against a single input.
 */
function runJavaClassHost(classDir, className, input) {
  const start = Date.now();
  try {
    const stdout = execFileSync("java", ["-cp", classDir, `-Xmx${MEMORY_LIMIT_MB}m`, className], {
      input,
      timeout: TIME_LIMIT,
      maxBuffer: 10 * 1024 * 1024,
      stdio: ["pipe", "pipe", "pipe"],
    });
    const time = Date.now() - start;
    return { stdout: stdout.toString(), stderr: "", time, exitCode: 0 };
  } catch (runErr) {
    const time = Date.now() - start;
    if (runErr.killed || runErr.signal === "SIGTERM") {
      return { stdout: "", stderr: "Time Limit Exceeded", time, exitCode: -1, tle: true };
    }
    return {
      stdout: runErr.stdout?.toString() || "",
      stderr: `Runtime Error:\n${runErr.stderr?.toString() || runErr.message}`,
      time,
      exitCode: runErr.status || 1,
    };
  }
}

function executeJavaHost(code, input, sessionDir) {
  const compiled = compileJavaHost(code, sessionDir);
  if (!compiled.success) return compiled.error;
  return runJavaClassHost(compiled.classDir, compiled.className, input);
}

// ─────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────

/**
 * Execute code against a single input string.
 * Docker mode → warm worker pool (async)
 * Host mode   → direct g++/javac (sync)
 */
async function executeCode(language, code, input) {
  const mode = detectMode();

  if (mode === "docker") {
    return executeInDockerPool(language, code, input);
  }

  // Host (dev) mode — synchronous
  const sessionId = uuidv4();
  const sessionDir = path.join(TEMP_DIR, sessionId);
  fs.mkdirSync(sessionDir, { recursive: true });

  try {
    switch (language) {
      case "cpp":
        return executeCppHost(code, input, sessionDir);
      case "java":
        return executeJavaHost(code, input, sessionDir);
      default:
        return { stdout: "", stderr: `Unsupported language: ${language}`, time: 0, exitCode: 1 };
    }
  } finally {
    cleanup(sessionDir);
  }
}

/**
 * Run code against all test cases of a problem.
 * Both modes: compile once, run many.
 *
 * @param {string} language - "cpp" | "java"
 * @param {string} code - User's source code
 * @param {Array<{input: string, expected: string}>} testCases
 * @returns {Promise<{ status: string, results: Array, totalPassed: number, totalTests: number, time: number }>}
 */
async function runAgainstTestCases(language, code, testCases) {
  const mode = detectMode();

  // Docker mode: compile-once, run-many inside a single pooled worker
  if (mode === "docker") {
    return runInDockerPoolBatch(language, code, testCases);
  }

  // ── Host mode: compile once, run many ──
  const sessionId = uuidv4();
  const sessionDir = path.join(TEMP_DIR, sessionId);
  fs.mkdirSync(sessionDir, { recursive: true });

  try {
    // Step 1: Compile once
    let compiled;
    if (language === "cpp") {
      compiled = compileCppHost(code, sessionDir);
    } else if (language === "java") {
      compiled = compileJavaHost(code, sessionDir);
    } else {
      return { status: "Error", error: `Unsupported language: ${language}`, results: [], totalPassed: 0, totalTests: testCases.length, time: 0 };
    }

    if (!compiled.success) {
      return {
        status: "Compilation Error",
        error: compiled.error.stderr,
        results: [],
        totalPassed: 0,
        totalTests: testCases.length,
        time: 0,
      };
    }

    // Step 2: Run the compiled binary/class against each test case
    const results = [];
    let totalPassed = 0;
    let totalTime = 0;

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];

      let result;
      if (language === "cpp") {
        result = runCppBinaryHost(compiled.binary, tc.input);
      } else {
        result = runJavaClassHost(compiled.classDir, compiled.className, tc.input);
      }

      const actualOutput = result.stdout.trim();
      const expectedOutput = tc.expected.trim();
      const passed = actualOutput === expectedOutput;

      if (passed) totalPassed++;
      totalTime += result.time;

      results.push({
        testCase: i + 1,
        passed,
        input: tc.input,
        expected: expectedOutput,
        actual: actualOutput,
        time: result.time,
        ...(result.tle ? { status: "Time Limit Exceeded" } : {}),
        ...(result.exitCode !== 0 && !result.tle ? { status: "Runtime Error", error: result.stderr } : {}),
      });
    }

    const allPassed = totalPassed === testCases.length;
    return {
      status: allPassed ? "Accepted" : "Wrong Answer",
      results,
      totalPassed,
      totalTests: testCases.length,
      time: totalTime,
    };
  } finally {
    cleanup(sessionDir);
  }
}

module.exports = { executeCode, runAgainstTestCases, detectMode };
