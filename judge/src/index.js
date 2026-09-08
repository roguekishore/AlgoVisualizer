const { createApp } = require("./app");
const { detectMode } = require("./executor");
const pool = require("./workerPool");

const app = createApp();
const PORT = process.env.PORT || 9000;

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
