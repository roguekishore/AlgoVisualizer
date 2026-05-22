/**
 * Shared constants for the trace pipeline (Code Flow Visualizer).
 *
 * Size limits mirror the values enforced by the existing submission route
 * (`judge/src/routes/submission.js`) so the `/api/trace` endpoint validates
 * payloads identically to `/api/run` and `/api/submit`.
 */

/**
 * Maximum number of trace steps stored in a `TraceResult`. Events beyond this
 * cap are counted (for `meta.totalSteps` / `meta.truncated`) but not stored,
 * bounding both the response payload size and instrumented runtime.
 * @type {number}
 */
const STEP_CAP = 10000;

/**
 * Maximum accepted source code size: 64 KB.
 * Reused from `submission.js` (`MAX_CODE_SIZE = 64 * 1024`).
 * @type {number}
 */
const MAX_CODE_SIZE = 64 * 1024; // 64 KB

/**
 * Maximum accepted stdin input size: 1 MB.
 * Reused from `submission.js` (`MAX_INPUT_SIZE = 1024 * 1024`).
 * @type {number}
 */
const MAX_INPUT_SIZE = 1024 * 1024; // 1 MB

module.exports = {
  STEP_CAP,
  MAX_CODE_SIZE,
  MAX_INPUT_SIZE,
};
