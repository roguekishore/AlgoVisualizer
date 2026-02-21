/**
 * Worker Pool Manager
 * ───────────────────
 * Maintains a pool of long-lived Docker containers with g++/javac pre-loaded.
 * Each submission borrows an idle worker, sends code via `docker exec`, and
 * returns the worker to the pool when done.
 *
 * Architecture:
 *   ┌── Judge Server ──────────────────────────────────────┐
 *   │   request → acquire(lang) → worker → exec → release │
 *   │                                                      │
 *   │   Pool:  [ cpp-worker-1, cpp-worker-2 ]              │
 *   │          [ java-worker-1, java-worker-2 ]            │
 *   └──────────────────────────────────────────────────────┘
 *
 * Workers stay alive 24/7. No container spin-up per request.
 * If a worker dies, it's auto-restarted.
 */

const { execSync, execFileSync } = require("child_process");
const { v4: uuidv4 } = require("uuid");

// ─── Configuration ───
const POOL_SIZE = parseInt(process.env.WORKER_POOL_SIZE || "3", 10);
const MEMORY_LIMIT = process.env.WORKER_MEMORY || "256m";
const CPU_LIMIT = process.env.WORKER_CPU || "1";
const ACQUIRE_TIMEOUT = parseInt(process.env.ACQUIRE_TIMEOUT || "30000", 10); // ms to wait for a free worker

const IMAGES = {
  cpp: "vantage-sandbox-cpp",
  java: "vantage-sandbox-java",
};

/**
 * @typedef {Object} Worker
 * @property {string} id          - Container ID
 * @property {string} name        - Container name (e.g., "judge-cpp-0")
 * @property {string} language    - "cpp" | "java"
 * @property {boolean} busy       - Currently executing a submission
 * @property {number} execCount   - How many submissions this worker has handled
 */

/** @type {Map<string, Worker[]>}  language → Worker[] */
const pools = new Map();

/** @type {Map<string, Array<{resolve: Function, timer: NodeJS.Timeout}>>} */
const waitQueues = new Map();

let initialized = false;

// ─── Public API ───

/**
 * Boot the worker pool. Call once on server start.
 * Builds sandbox images if needed, then spins up POOL_SIZE containers per language.
 */
async function initPool() {
  if (initialized) return;

  console.log(`\n🏗️  Initializing worker pool (${POOL_SIZE} per language)...\n`);

  for (const lang of Object.keys(IMAGES)) {
    ensureImage(lang);
    pools.set(lang, []);
    waitQueues.set(lang, []);

    for (let i = 0; i < POOL_SIZE; i++) {
      const worker = startWorker(lang, i);
      pools.get(lang).push(worker);
    }

    console.log(`  ✅ ${lang}: ${POOL_SIZE} workers ready`);
  }

  initialized = true;
  console.log(`\n⚡ Worker pool ready — ${POOL_SIZE * Object.keys(IMAGES).length} total workers\n`);
}

/**
 * Acquire an idle worker for the given language.
 * If all workers are busy, waits up to ACQUIRE_TIMEOUT ms.
 *
 * @param {string} language - "cpp" | "java"
 * @returns {Promise<Worker>}
 */
function acquire(language) {
  const pool = pools.get(language);
  if (!pool) throw new Error(`No pool for language: ${language}`);

  // Try to find a free worker immediately
  const idle = pool.find((w) => !w.busy && isAlive(w));
  if (idle) {
    idle.busy = true;
    return Promise.resolve(idle);
  }

  // Check for dead workers and revive them
  for (let i = 0; i < pool.length; i++) {
    if (!isAlive(pool[i])) {
      console.log(`🔄 Reviving dead worker ${pool[i].name}`);
      killSafe(pool[i]);
      pool[i] = startWorker(language, i);
      pool[i].busy = true;
      return Promise.resolve(pool[i]);
    }
  }

  // All busy — queue the request
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const queue = waitQueues.get(language);
      const idx = queue.findIndex((item) => item.resolve === resolve);
      if (idx !== -1) queue.splice(idx, 1);
      reject(new Error(`Worker pool exhausted — all ${POOL_SIZE} ${language} workers busy. Try again later.`));
    }, ACQUIRE_TIMEOUT);

    waitQueues.get(language).push({ resolve, timer });
  });
}

/**
 * Release a worker back to the pool.
 * Cleans up /workspace inside the container so the next submission starts fresh.
 *
 * @param {Worker} worker
 */
function release(worker) {
  // Clean workspace inside the container
  try {
    execSync(`docker exec ${worker.name} sh -c "rm -rf /workspace/* /workspace/.* 2>/dev/null; true"`, {
      timeout: 5000,
      stdio: "ignore",
    });
  } catch {
    // If cleanup fails, the worker might be dead — it'll be revived on next acquire
  }

  worker.busy = false;
  worker.execCount++;

  // Wake up the next waiting request, if any
  const queue = waitQueues.get(worker.language);
  if (queue && queue.length > 0) {
    const next = queue.shift();
    clearTimeout(next.timer);
    worker.busy = true;
    next.resolve(worker);
  }
}

/**
 * Execute a command inside a worker container.
 *
 * @param {Worker} worker
 * @param {string} cmd - Shell command to run
 * @param {Object} opts
 * @param {string} [opts.input] - Stdin to pipe in
 * @param {number} [opts.timeout] - Timeout in ms
 * @returns {{ stdout: string, stderr: string, exitCode: number, killed: boolean }}
 */
function execInWorker(worker, cmd, opts = {}) {
  const timeout = opts.timeout || 10000;
  const args = ["exec"];

  if (opts.input !== undefined) {
    args.push("-i"); // keep stdin open
  }

  args.push(worker.name, "sh", "-c", cmd);

  try {
    const stdout = execFileSync("docker", args, {
      input: opts.input,
      timeout,
      maxBuffer: 10 * 1024 * 1024,
      stdio: ["pipe", "pipe", "pipe"],
    });
    return { stdout: stdout.toString(), stderr: "", exitCode: 0, killed: false };
  } catch (err) {
    return {
      stdout: err.stdout?.toString() || "",
      stderr: err.stderr?.toString() || "",
      exitCode: err.status || 1,
      killed: !!(err.killed || err.signal === "SIGTERM"),
    };
  }
}

/**
 * Write a file into the worker's /workspace.
 *
 * @param {Worker} worker
 * @param {string} filename - e.g., "solution.cpp"
 * @param {string} content
 */
function writeToWorker(worker, filename, content) {
  // Use docker exec with stdin to write file — no temp files on host needed
  execInWorker(worker, `cat > /workspace/${filename}`, {
    input: content,
    timeout: 5000,
  });
}

/**
 * Get pool status for health/monitoring endpoints.
 */
function getPoolStatus() {
  const status = {};
  for (const [lang, pool] of pools) {
    status[lang] = {
      total: pool.length,
      idle: pool.filter((w) => !w.busy).length,
      busy: pool.filter((w) => w.busy).length,
      waiting: waitQueues.get(lang)?.length || 0,
      workers: pool.map((w) => ({
        name: w.name,
        busy: w.busy,
        alive: isAlive(w),
        execCount: w.execCount,
      })),
    };
  }
  return status;
}

/**
 * Graceful shutdown — stop all workers.
 */
function shutdownPool() {
  console.log("\n🛑 Shutting down worker pool...");
  for (const [lang, pool] of pools) {
    for (const worker of pool) {
      killSafe(worker);
    }
    console.log(`  ⏹️  ${lang}: ${pool.length} workers stopped`);
  }
  initialized = false;
}

// ─── Internal helpers ───

function ensureImage(language) {
  const img = IMAGES[language];
  try {
    execSync(`docker image inspect ${img}`, { stdio: "ignore", timeout: 10000 });
  } catch {
    console.log(`📦 Building sandbox image: ${img} ...`);
    const contextPath = require("path").join(__dirname, "..", "sandboxes", language);
    execSync(`docker build -t ${img} "${contextPath}"`, {
      stdio: "inherit",
      timeout: 300000,
    });
    console.log(`✅ ${img} built`);
  }
}

function startWorker(language, index) {
  const name = `judge-${language}-${index}`;
  const img = IMAGES[language];

  // Kill any leftover container with the same name
  try { execSync(`docker rm -f ${name}`, { stdio: "ignore", timeout: 10000 }); } catch { /* noop */ }

  // Start a long-lived container
  const dockerCmd = [
    "docker", "run", "-d",
    "--name", name,
    "--network", "none",
    `--memory=${MEMORY_LIMIT}`,
    `--memory-swap=${MEMORY_LIMIT}`,
    `--cpus=${CPU_LIMIT}`,
    "--pids-limit", "64",
    img
  ];

  execSync(dockerCmd.join(" "), { stdio: "ignore", timeout: 30000 });

  return {
    id: name,
    name,
    language,
    busy: false,
    execCount: 0,
  };
}

function isAlive(worker) {
  try {
    const out = execSync(`docker inspect -f "{{.State.Running}}" ${worker.name}`, {
      timeout: 5000,
      stdio: ["pipe", "pipe", "pipe"],
    });
    return out.toString().trim() === "true";
  } catch {
    return false;
  }
}

function killSafe(worker) {
  try { execSync(`docker rm -f ${worker.name}`, { stdio: "ignore", timeout: 10000 }); } catch { /* noop */ }
}

module.exports = {
  initPool,
  acquire,
  release,
  execInWorker,
  writeToWorker,
  getPoolStatus,
  shutdownPool,
};
