import React, { useState, useCallback, useEffect } from "react";
import { ArrowLeft, Play, RotateCw, Pause, SkipBack, SkipForward, Layers } from "lucide-react";
import useModeHistorySwitch from "../../../hooks/useModeHistorySwitch";

const MinStack = () => {
  const [animSpeed, setAnimSpeed] = useState(1000);
  const [isPlaying, setIsPlaying] = useState(false);

  const {
    mode,
    history,
    currentStep,
    setMode,
    setHistory,
    setCurrentStep,
    goToPrevStep,
    goToNextStep,
  } = useModeHistorySwitch();

  const generateMinStackHistory = useCallback(() => {
    const hist = [];
    const stack = [];
    const minStack = [];

    hist.push({
      stack: [],
      minStack: [],
      operation: "init",
      message: "MinStack initialized. It supports push, pop, top, and getMin in O(1) time",
      phase: "init"
    });

    // Example operations
    const operations = [
      { op: "push", val: 5 },
      { op: "push", val: 3 },
      { op: "push", val: 7 },
      { op: "getMin" },
      { op: "pop" },
      { op: "push", val: 2 },
      { op: "getMin" },
      { op: "push", val: 1 },
      { op: "getMin" },
      { op: "pop" },
      { op: "getMin" },
    ];

    operations.forEach(({ op, val }) => {
      if (op === "push") {
        stack.push(val);
        const currentMin = minStack.length === 0 ? val : Math.min(val, minStack[minStack.length - 1]);
        minStack.push(currentMin);

        hist.push({
          stack: [...stack],
          minStack: [...minStack],
          operation: "push",
          value: val,
          currentMin,
          message: `push(${val}): Added ${val} to stack. Current min: ${currentMin}`,
          phase: "push"
        });
      } else if (op === "pop") {
        const popped = stack.pop();
        minStack.pop();

        hist.push({
          stack: [...stack],
          minStack: [...minStack],
          operation: "pop",
          poppedValue: popped,
          currentMin: minStack.length > 0 ? minStack[minStack.length - 1] : null,
          message: `pop(): Removed ${popped} from stack. ${minStack.length > 0 ? `Current min: ${minStack[minStack.length - 1]}` : 'Stack is empty'}`,
          phase: "pop"
        });
      } else if (op === "getMin") {
        const min = minStack[minStack.length - 1];
        hist.push({
          stack: [...stack],
          minStack: [...minStack],
          operation: "getMin",
          minValue: min,
          message: `getMin(): Minimum element is ${min}`,
          phase: "getMin"
        });
      }
    });

    return hist;
  }, []);

  const handleStart = () => {
    setMode("visualizing");
    const hist = generateMinStackHistory();
    setHistory(hist);
    setCurrentStep(0);
  };

  const handleReset = () => {
    setMode("input");
    setHistory([]);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  useEffect(() => {
    let interval;
    if (isPlaying && mode === "visualizing") {
      interval = setInterval(() => {
        if (currentStep < history.length - 1) {
          goToNextStep();
        } else {
          setIsPlaying(false);
        }
      }, animSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, history.length, animSpeed, mode, goToNextStep]);

  const step = history[currentStep] || {};
  const { stack = [], minStack = [], message = "", phase = "init", currentMin, minValue } = step;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-theme-primary p-8">
      <header className="mb-8">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-accent-primary hover:text-accent-primary100 transition-colors mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Design
        </button>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-accent-primary500 to-accent-primary600 rounded-xl shadow-lg">
            <Layers className="h-8 w-8 text-theme-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">Min Stack</h1>
            <p className="text-accent-primary200 mt-1">LeetCode #155 - Medium</p>
          </div>
        </div>
        <p className="text-theme-secondary text-lg leading-relaxed max-w-4xl">
          Design a stack that supports push, pop, top, and retrieving the minimum element in <strong>constant time</strong>.
          Implement the MinStack class with <code className="px-2 py-1 bg-theme-tertiary rounded">push(val)</code>,{" "}
          <code className="px-2 py-1 bg-theme-tertiary rounded">pop()</code>,{" "}
          <code className="px-2 py-1 bg-theme-tertiary rounded">top()</code>, and{" "}
          <code className="px-2 py-1 bg-theme-tertiary rounded">getMin()</code> operations.
        </p>
      </header>

      {mode === "input" && (
        <section className="bg-theme-tertiary/50 backdrop-blur-sm rounded-2xl border border-theme-primary p-6 mb-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-accent-primary">Demo Operations</h2>
          <p className="text-theme-secondary mb-4">
            Click Start to see a demonstration of MinStack operations with push, pop, and getMin.
          </p>
          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-accent-primary600 to-accent-primary700 hover:from-accent-primary700 hover:to-accent-primary800 rounded-lg font-semibold transition-all shadow-lg shadow-blue-500/30"
          >
            <Play className="h-4 w-4" />
            Start Visualization
          </button>
        </section>
      )}

      {mode === "visualizing" && (
        <section className="bg-theme-tertiary/50 backdrop-blur-sm rounded-2xl border border-theme-primary p-6 mb-8 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-3 bg-gradient-to-r from-accent-primary600 to-accent-primary600 hover:from-accent-primary700 hover:to-accent-primary700 rounded-lg transition-all shadow-lg"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
              <button onClick={goToPrevStep} disabled={currentStep === 0} className="p-3 bg-theme-elevated hover:bg-theme-elevated rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <SkipBack className="h-5 w-5" />
              </button>
              <button onClick={goToNextStep} disabled={currentStep >= history.length - 1} className="p-3 bg-theme-elevated hover:bg-theme-elevated rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <SkipForward className="h-5 w-5" />
              </button>
              <button onClick={handleReset} className="flex items-center gap-2 px-4 py-3 bg-danger-hover hover:bg-danger-hover rounded-lg transition-colors">
                <RotateCw className="h-5 w-5" />
                Reset
              </button>
            </div>
            <div className="text-center">
              <div className="text-sm text-theme-tertiary">Step</div>
              <div className="text-2xl font-bold text-accent-primary">{currentStep + 1} / {history.length}</div>
            </div>
            <div>
              <label className="block text-sm text-theme-tertiary mb-2">Animation Speed</label>
              <select value={animSpeed} onChange={(e) => setAnimSpeed(Number(e.target.value))} className="px-4 py-2 bg-theme-secondary/80 border border-theme-primary rounded-lg text-theme-primary">
                <option value={1500}>Slow</option>
                <option value={1000}>Normal</option>
                <option value={500}>Fast</option>
              </select>
            </div>
          </div>
        </section>
      )}

      {mode === "visualizing" && message && (
        <div className={`mb-6 p-4 rounded-xl border ${
          phase === "getMin" 
            ? "bg-success900/30 border-success text-success200"
            : phase === "push"
            ? "bg-accent-primary900/30 border-accent-primary text-accent-primary200"
            : "bg-purple900/30 border-purple text-purple200"
        }`}>
          <p className="text-center font-medium">{message}</p>
        </div>
      )}

      {mode === "visualizing" && history.length > 0 && (
        <section className="bg-theme-tertiary/50 backdrop-blur-sm rounded-2xl border border-theme-primary p-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Main Stack */}
            <div>
              <h3 className="text-2xl font-bold text-accent-primary mb-4 text-center">Main Stack</h3>
              <div className="flex flex-col-reverse items-center gap-2 min-h-[400px] justify-end">
                {stack.length === 0 ? (
                  <div className="text-theme-muted text-center py-8">Empty Stack</div>
                ) : (
                  stack.map((value, index) => (
                    <div
                      key={index}
                      className={`w-48 h-16 flex items-center justify-center rounded-xl font-bold text-2xl transition-all duration-300 ${
                        index === stack.length - 1
                          ? "bg-gradient-to-br from-accent-primary500 to-accent-primary700 text-theme-primary shadow-lg shadow-blue-500/50 scale-105"
                          : "bg-theme-elevated text-theme-primary"
                      }`}
                    >
                      {value}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Min Stack */}
            <div>
              <h3 className="text-2xl font-bold text-success mb-4 text-center">Min Stack (Helper)</h3>
              <div className="flex flex-col-reverse items-center gap-2 min-h-[400px] justify-end">
                {minStack.length === 0 ? (
                  <div className="text-theme-muted text-center py-8">Empty Stack</div>
                ) : (
                  minStack.map((value, index) => (
                    <div
                      key={index}
                      className={`w-48 h-16 flex items-center justify-center rounded-xl font-bold text-2xl transition-all duration-300 ${
                        index === minStack.length - 1
                          ? "bg-gradient-to-br from-success500 to-success700 text-theme-primary shadow-lg shadow-green-500/50 scale-105"
                          : "bg-theme-elevated text-theme-primary"
                      }`}
                    >
                      {value}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Current Min Display */}
          {(currentMin !== undefined || minValue !== undefined) && (
            <div className="mt-8 p-6 bg-success900/30 rounded-xl border-2 border-success">
              <div className="text-center">
                <div className="text-sm text-success mb-2">Current Minimum</div>
                <div className="text-5xl font-black text-success200">{currentMin !== undefined ? currentMin : minValue}</div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="mt-8 p-4 bg-theme-secondary/50 rounded-xl border border-theme-primary">
            <div className="text-sm text-theme-secondary">
              <strong>Algorithm:</strong> We maintain two stacks - the main stack stores all elements, 
              while the min stack stores the minimum element at each level. This allows O(1) getMin() operation.
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default MinStack;
