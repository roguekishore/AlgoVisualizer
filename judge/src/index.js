const express = require("express");
const cors = require("cors");
const submissionRouter = require("./routes/submission");
const problemsRouter = require("./routes/problems");
const { detectMode } = require("./executor");
const pool = require("./workerPool");

const app = express();
const PORT = process.env.PORT || 9000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "5mb" }));

// Routes
app.use("/api", submissionRouter);
app.use("/api", problemsRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", mode: detectMode(), timestamp: Date.now() });
});

// Worker pool status (Docker mode only)
app.get("/api/pool", (_req, res) => {
  if (detectMode() !== "docker") {
    return res.json({ mode: "host", message: "Worker pool not active in host mode" });
  }
  res.json(pool.getPoolStatus());
});

// Start server (init pool if in Docker mode)
async function start() {
  const mode = detectMode();

  if (mode === "docker") {
    await pool.initPool();
  }

  app.listen(PORT, () => {
    console.log(`⚡ Judge server running on http://localhost:${PORT} (mode: ${mode})`);
  });
}

// Graceful shutdown
process.on("SIGINT", () => {
  if (detectMode() === "docker") pool.shutdownPool();
  process.exit(0);
});
process.on("SIGTERM", () => {
  if (detectMode() === "docker") pool.shutdownPool();
  process.exit(0);
});

// Catch unhandled errors to prevent silent crashes
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  if (detectMode() === "docker") pool.shutdownPool();
  process.exit(1);
});

start().catch((err) => {
  console.error("Failed to start judge server:", err);
  process.exit(1);
});
