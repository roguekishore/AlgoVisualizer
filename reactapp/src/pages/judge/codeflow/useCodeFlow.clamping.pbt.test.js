/**
 * Property test for Code Flow Visualizer — step clamping.
 *
 * Property 8: Step clamping — after ANY sequence of step / play / reset
 * actions, the current step index stays within `[0, max(0, totalSteps - 1)]`.
 *
 * **Validates: Requirements 5.1**
 */

import React from "react";
import { createRoot } from "react-dom/client";
import fc from "fast-check";

// Mock the API service so `run()` produces a deterministic, controllable
// `totalSteps` without any network access.
jest.mock("../../../services/judgeApi", () => ({
  traceCode: jest.fn(),
}));

import { traceCode } from "../../../services/judgeApi";
import { useCodeFlow } from "./useCodeFlow";

// React 19 exposes `act` directly; this is the supported test entry point.
const act = React.act;

// Tell React this is an act-aware environment so state updates are flushed
// synchronously inside act(...) without warnings.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

/**
 * Test harness that renders the hook and exposes its latest return value
 * through a ref, so the test can invoke actions imperatively.
 */
function makeHarness() {
  const api = { current: null };

  function Harness() {
    api.current = useCodeFlow();
    return null;
  }

  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  return { api, container, root, element: React.createElement(Harness) };
}

/**
 * Drive a trace with a given number of steps, then apply a sequence of
 * playback actions, asserting the clamp invariant after every action.
 */
async function runScenario(totalSteps, actions, playAdvanceTicks) {
  // Mock the trace payload: a steps array of the requested length.
  traceCode.mockResolvedValue({
    status: "OK",
    steps: Array.from({ length: totalSteps }, (_, i) => ({ index: i })),
  });

  const { api, container, root, element } = makeHarness();

  const assertInvariant = (label) => {
    const { step } = api.current;
    const max = Math.max(0, totalSteps - 1);
    expect(Number.isInteger(step)).toBe(true);
    expect(step).toBeGreaterThanOrEqual(0);
    expect(step).toBeLessThanOrEqual(max);
    if (step < 0 || step > max) {
      throw new Error(`Clamp violated after ${label}: step=${step}, totalSteps=${totalSteps}`);
    }
  };

  try {
    // Initial render.
    await act(async () => {
      root.render(element);
    });
    assertInvariant("initial render");

    // Load the trace (sets totalSteps, resets step to 0).
    await act(async () => {
      await api.current.run({ language: "cpp", code: "int main(){}", input: "" });
    });
    assertInvariant("run");

    // Apply each action and re-check the invariant.
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      // eslint-disable-next-line no-await-in-loop
      await act(async () => {
        switch (action) {
          case "forward":
            api.current.stepForward();
            break;
          case "backward":
            api.current.stepBackward();
            break;
          case "reset":
            api.current.reset();
            break;
          case "play":
            api.current.togglePlay();
            // Let the auto-play timer fire a few times so playback advances.
            jest.advanceTimersByTime(playAdvanceTicks);
            break;
          default:
            break;
        }
      });
      assertInvariant(`action[${i}]=${action}`);
    }
  } finally {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  }
}

describe("useCodeFlow — Property 8: step clamping (Requirements 5.1)", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    traceCode.mockReset();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("keeps step within [0, max(0, totalSteps - 1)] after any action sequence", async () => {
    await fc.assert(
      fc.asyncProperty(
        // totalSteps: cover empty traces (0), single-step (1), and many.
        fc.integer({ min: 0, max: 30 }),
        // a random sequence of playback actions
        fc.array(fc.constantFrom("forward", "backward", "reset", "play"), {
          minLength: 0,
          maxLength: 40,
        }),
        // how far to advance fake timers per `play` action (in 200ms ticks)
        fc.integer({ min: 0, max: 10 }),
        async (totalSteps, actions, ticks) => {
          await runScenario(totalSteps, actions, ticks * 200);
        }
      ),
      // Keep run count modest: each example mounts/unmounts a React root.
      { numRuns: 40 }
    );
  });
});
