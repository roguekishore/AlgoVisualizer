const fs = require("fs");
const path = require("path");
const serverlessExpress = require("@codegenie/serverless-express");
const { createApp } = require("./app");

const server = serverlessExpress({ app: createApp() });

const TEMP_DIR = path.join(require("os").tmpdir(), "vantage-judge");
const STALE_MS = 5 * 60 * 1000;

function sweepTmp() {
  try {
    if (!fs.existsSync(TEMP_DIR)) return;
    const now = Date.now();
    for (const entry of fs.readdirSync(TEMP_DIR)) {
      const full = path.join(TEMP_DIR, entry);
      try {
        const stat = fs.statSync(full);
        if (now - stat.mtimeMs > STALE_MS) {
          fs.rmSync(full, { recursive: true, force: true });
        }
      } catch { /* best-effort per entry */ }
    }
  } catch { /* best-effort */ }
}

/**
 * Lambda entrypoint.
 *
 * Warm pings arrive from EventBridge as a bare `{"warmup": true}` payload -
 * NOT as an HTTP event - so they are answered here and never reach Express.
 * That keeps a ping at a few milliseconds of billed duration instead of
 * running a full request through the router.
 */
exports.handler = async (event, context) => {
  sweepTmp();
  if (event && event.warmup === true) {
    return { warmed: true };
  }
  return server(event, context);
};
