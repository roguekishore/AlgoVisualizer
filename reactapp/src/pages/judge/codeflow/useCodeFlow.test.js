import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { useCodeFlow } from "./useCodeFlow";
import { traceCode } from "../../../services/judgeApi";

// Tell React this is an act-aware environment so state updates are flushed
// synchronously inside act(...) without warnings.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Mock the judge API so run() resolves with a controllable steps array.
jest.mock("../../../services/judgeApi", () => ({
  traceCode: jest.fn(),
}));

/**
 * Minimal renderHook helper built on react-dom/client + act, since
 * @testing-library/react / react-test-renderer are not installed.
 */
function renderHook(hook) {
  const result = { current: undefined };
  let container;
  let root;

  function Probe() {
    result.current = hook();
    return null;
  }

  act(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    root.render(React.createElement(Probe));
  });

  return {
    result,
    unmount() {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

const traceResult = (count) => ({
  status: "OK",
  steps: Array.from({ length: count }, (_, i) => ({ index: i, blockId: "b0", line: 1 })),
});

describe("useCodeFlow playback edges", () => {
  beforeEach(() => {
    traceCode.mockReset();
  });

  test("run transitions status loading -> ready and resets step to 0", async () => {
    let resolveTrace;
    traceCode.mockReturnValue(
      new Promise((resolve) => {
        resolveTrace = resolve;
      }),
    );

    const { result, unmount } = renderHook(() => useCodeFlow());

    expect(result.current.status).toBe("idle");

    let runPromise;
    act(() => {
      runPromise = result.current.run({ language: "cpp", code: "int main(){}" });
    });

    // While the promise is unresolved the hook is in the loading state.
    expect(result.current.status).toBe("loading");
    expect(result.current.step).toBe(0);

    await act(async () => {
      resolveTrace(traceResult(3));
      await runPromise;
    });

    expect(result.current.status).toBe("ready");
    expect(result.current.totalSteps).toBe(3);
    expect(result.current.step).toBe(0);
    expect(traceCode).toHaveBeenCalledTimes(1);

    unmount();
  });

  test("run transitions to error and resets state on rejection", async () => {
    traceCode.mockRejectedValue(new Error("boom"));

    const { result, unmount } = renderHook(() => useCodeFlow());

    await act(async () => {
      await result.current.run({ language: "cpp", code: "bad" });
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error).toBe("boom");
    expect(result.current.totalSteps).toBe(0);
    expect(result.current.step).toBe(0);

    unmount();
  });

  test("stepForward at the last step is a no-op", async () => {
    traceCode.mockResolvedValue(traceResult(3));

    const { result, unmount } = renderHook(() => useCodeFlow());

    await act(async () => {
      await result.current.run({ language: "cpp", code: "x" });
    });

    // Advance to the last step (index 2).
    act(() => result.current.stepForward());
    act(() => result.current.stepForward());
    expect(result.current.step).toBe(2);

    // Forward at the last step does nothing.
    act(() => result.current.stepForward());
    expect(result.current.step).toBe(2);

    unmount();
  });

  test("stepBackward at step 0 is a no-op", async () => {
    traceCode.mockResolvedValue(traceResult(3));

    const { result, unmount } = renderHook(() => useCodeFlow());

    await act(async () => {
      await result.current.run({ language: "cpp", code: "x" });
    });

    expect(result.current.step).toBe(0);
    act(() => result.current.stepBackward());
    expect(result.current.step).toBe(0);

    unmount();
  });

  test("togglePlay toggles the playing flag", async () => {
    traceCode.mockResolvedValue(traceResult(3));

    const { result, unmount } = renderHook(() => useCodeFlow());

    await act(async () => {
      await result.current.run({ language: "cpp", code: "x" });
    });

    expect(result.current.playing).toBe(false);
    act(() => result.current.togglePlay());
    expect(result.current.playing).toBe(true);
    act(() => result.current.togglePlay());
    expect(result.current.playing).toBe(false);

    unmount();
  });

  test("reset returns to step 0 and stops playing", async () => {
    traceCode.mockResolvedValue(traceResult(5));

    const { result, unmount } = renderHook(() => useCodeFlow());

    await act(async () => {
      await result.current.run({ language: "cpp", code: "x" });
    });

    act(() => result.current.stepForward());
    act(() => result.current.togglePlay());
    expect(result.current.step).toBe(1);
    expect(result.current.playing).toBe(true);

    act(() => result.current.reset());
    expect(result.current.step).toBe(0);
    expect(result.current.playing).toBe(false);

    unmount();
  });

  test("auto-play advances one step per interval and stops at the last step", async () => {
    jest.useFakeTimers();
    try {
      traceCode.mockResolvedValue(traceResult(3));

      const { result, unmount } = renderHook(() => useCodeFlow());

      await act(async () => {
        await Promise.resolve(result.current.run({ language: "cpp", code: "x" }));
      });

      const speed = result.current.speed;

      act(() => result.current.togglePlay());
      expect(result.current.playing).toBe(true);
      expect(result.current.step).toBe(0);

      // First interval -> step 1.
      act(() => {
        jest.advanceTimersByTime(speed);
      });
      expect(result.current.step).toBe(1);

      // Second interval -> step 2 (last), playback stops.
      act(() => {
        jest.advanceTimersByTime(speed);
      });
      expect(result.current.step).toBe(2);
      expect(result.current.playing).toBe(false);

      unmount();
    } finally {
      jest.useRealTimers();
    }
  });
});
