import { useCallback, useEffect, useRef, useState } from "react";
import { traceCode } from "../../../services/judgeApi";

/**
 * @typedef {"idle" | "loading" | "ready" | "error"} FlowStatus
 */

/** Default auto-play interval in milliseconds (lower = faster). */
const DEFAULT_SPEED_MS = 200;

/**
 * Clamp a step index into the valid range `[0, max(0, totalSteps - 1)]`.
 * @param {number} step
 * @param {number} totalSteps
 * @returns {number}
 */
function clampStep(step, totalSteps) {
  const max = Math.max(0, totalSteps - 1);
  if (!Number.isFinite(step)) return 0;
  if (step < 0) return 0;
  if (step > max) return max;
  return step;
}

/**
 * useCodeFlow — owns the trace payload and playback state for the Code Flow
 * Visualizer. Mirrors the formal specification in design.md:
 *
 *  - `step` is always within `[0, max(0, totalSteps - 1)]`.
 *  - `stepForward` is a no-op at the last step; `stepBackward` a no-op at 0.
 *  - `run` transitions status loading → ready (or error) and resets step to 0.
 *  - Auto-play advances exactly one step per `speed` ms and stops at the last step.
 *
 * @returns {{
 *   trace: object | null,
 *   status: FlowStatus,
 *   step: number,
 *   totalSteps: number,
 *   playing: boolean,
 *   speed: number,
 *   error: string | null,
 *   run: (req: { language: string, code: string, input?: string }) => Promise<void>,
 *   reset: () => void,
 *   stepForward: () => void,
 *   stepBackward: () => void,
 *   togglePlay: () => void,
 *   setSpeed: (ms: number) => void,
 * }}
 */
export function useCodeFlow() {
  const [trace, setTrace] = useState(null);
  const [status, setStatus] = useState(/** @type {FlowStatus} */ ("idle"));
  const [step, setStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeedState] = useState(DEFAULT_SPEED_MS);
  const [error, setError] = useState(/** @type {string | null} */ (null));

  // Guards against state updates from a stale `run` after another run started.
  const runIdRef = useRef(0);

  const stepForward = useCallback(() => {
    setStep((prev) => clampStep(prev + 1, totalSteps));
  }, [totalSteps]);

  const stepBackward = useCallback(() => {
    setStep((prev) => clampStep(prev - 1, totalSteps));
  }, [totalSteps]);

  const reset = useCallback(() => {
    setPlaying(false);
    setStep(0);
  }, []);

  const togglePlay = useCallback(() => {
    // Cannot meaningfully play when there is at most one step.
    if (totalSteps <= 1) return;
    setPlaying((prev) => {
      // If we're at the last step, restart from 0 when (re)starting playback.
      if (!prev && step >= totalSteps - 1) {
        setStep(0);
      }
      return !prev;
    });
  }, [totalSteps, step]);

  const setSpeed = useCallback((ms) => {
    const next = Number(ms);
    if (Number.isFinite(next) && next > 0) {
      setSpeedState(next);
    }
  }, []);

  const run = useCallback(async (req) => {
    const runId = runIdRef.current + 1;
    runIdRef.current = runId;

    setPlaying(false);
    setStatus("loading");
    setError(null);
    setStep(0);

    try {
      const result = await traceCode(req);
      // Ignore if a newer run superseded this one.
      if (runIdRef.current !== runId) return;

      const steps = Array.isArray(result?.steps) ? result.steps : [];
      setTrace(result);
      setTotalSteps(steps.length);
      setStep(0);
      setStatus("ready");
    } catch (err) {
      if (runIdRef.current !== runId) return;
      setTrace(null);
      setTotalSteps(0);
      setStep(0);
      setStatus("error");
      setError(err?.message || "Trace failed");
    }
  }, []);

  // Keep `step` clamped if `totalSteps` changes (e.g. after a new trace).
  useEffect(() => {
    setStep((prev) => clampStep(prev, totalSteps));
  }, [totalSteps]);

  // Auto-play timer: advance one step per `speed` ms, stop at the last step.
  useEffect(() => {
    if (!playing) return undefined;
    if (totalSteps <= 1 || step >= totalSteps - 1) {
      setPlaying(false);
      return undefined;
    }
    const timer = setTimeout(() => {
      setStep((prev) => {
        const next = clampStep(prev + 1, totalSteps);
        if (next >= totalSteps - 1) {
          setPlaying(false);
        }
        return next;
      });
    }, speed);
    return () => clearTimeout(timer);
  }, [playing, step, totalSteps, speed]);

  return {
    trace,
    status,
    step,
    totalSteps,
    playing,
    speed,
    error,
    run,
    reset,
    stepForward,
    stepBackward,
    togglePlay,
    setSpeed,
  };
}

export default useCodeFlow;
