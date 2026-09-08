const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const submissionRouter = require("./routes/submission");
const problemsRouter = require("./routes/problems");
const { detectMode } = require("./executor");
const pool = require("./workerPool");

// Capture the token and immediately remove it from the environment so child
// processes and later require()s cannot observe it.
const TOKEN = process.env.JUDGE_TOKEN;
delete process.env.JUDGE_TOKEN;

/**
 * Build the Express app WITHOUT starting a listener or touching the worker pool.
 *
 * Kept separate from index.js so the Lambda handler can import a ready app
 * without side effects at require() time - index.js starts a server on load.
 */
function createApp() {
  const app = express();

  const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";
  app.use(cors({ origin: ALLOWED_ORIGIN }));
  app.use(express.json({ limit: "5mb" }));

  // Health check - registered before the token gate so warm pings and
  // uptime checks can reach it unauthenticated.
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", mode: detectMode(), timestamp: Date.now() });
  });

  // ── Shared-secret gate ──
  // The judge compiles and runs arbitrary submitted code. On Lambda it does so
  // in its own process (MODE=host), so the endpoint must not be openly callable.
  // Set JUDGE_TOKEN to require the header; leave it unset for local dev.
  if (TOKEN) {
    const tokenBuf = Buffer.from(TOKEN);
    app.use("/api", (req, res, next) => {
      const provided = req.get("x-judge-token") || "";
      const providedBuf = Buffer.from(provided);
      if (providedBuf.length === tokenBuf.length &&
          crypto.timingSafeEqual(providedBuf, tokenBuf)) {
        return next();
      }
      return res.status(401).json({ error: "Unauthorized" });
    });
  }

  app.use("/api", submissionRouter);
  app.use("/api", problemsRouter);

  // Worker pool status (Docker mode only)
  app.get("/api/pool", (_req, res) => {
    if (detectMode() !== "docker") {
      return res.json({ mode: "host", message: "Worker pool not active in host mode" });
    }
    res.json(pool.getPoolStatus());
  });

  return app;
}

module.exports = { createApp };
