 import React, { useState, useEffect } from "react";
import { ArrowLeft, Maximize2, Play, RotateCcw, Code, Zap, Clock, Cpu } from "lucide-react";

const FindMaxElement = ({ navigate, embedded = false, externalArray }) => {
  const [array, setArray] = useState(externalArray || [3, 1, 4, 1, 5, 9, 2, 6]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [isComplete, setIsComplete] = useState(false);
  const [algorithm, setAlgorithm] = useState("optimal"); // "bruteforce" or "optimal"
  const [comparisons, setComparisons] = useState(0);

  // Sync when externalArray changes (e.g. user clicks a test case)
  React.useEffect(() => {
    if (externalArray && externalArray.length > 0) {
      setArray(externalArray);
      resetAnimation();
    }
  }, [externalArray]);

  const resetAnimation = () => {
    setCurrentIndex(0);
    setMaxIndex(0);
    setIsPlaying(false);
    setIsComplete(false);
    setComparisons(0);
  };

  const startAnimation = () => {
    resetAnimation();
    setIsPlaying(true);
  };

  const generateNewArray = () => {
    const newArray = Array.from({ length: 8 }, () => Math.floor(Math.random() * 20) + 1);
    setArray(newArray);
    resetAnimation();
  };

  const loadDefaultArray = () => {
    setArray([3, 1, 4, 1, 5, 9, 2, 6]);
    resetAnimation();
  };

  // Optimal O(n) algorithm simulation
  useEffect(() => {
    let interval;
    if (isPlaying && currentIndex < array.length && algorithm === "optimal") {
      interval = setInterval(() => {
        setCurrentIndex(prev => {
          const nextIndex = prev + 1;
          setComparisons(c => c + 1);
          
          if (nextIndex < array.length && array[nextIndex] > array[maxIndex]) {
            setMaxIndex(nextIndex);
          }

          if (nextIndex >= array.length) {
            setIsPlaying(false);
            setIsComplete(true);
            return prev;
          }

          return nextIndex;
        });
      }, speed);
    }

    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, array, maxIndex, speed, algorithm]);

  /* ══════ Embedded mode — compact panel for Judge drawer ══════ */
  if (embedded) {
    return (
      <div className="flex flex-col h-full p-4 gap-3">
        {/* Controls row */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={startAnimation}
            disabled={isPlaying}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-medium transition-colors"
          >
            <Play className="h-3 w-3" />
            {isPlaying ? "Running…" : "Play"}
          </button>
          <button
            onClick={resetAnimation}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
          <button
            onClick={generateNewArray}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors"
          >
            Shuffle
          </button>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="h-7 px-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer"
          >
            <option value={1500}>Slow</option>
            <option value={1000}>Medium</option>
            <option value={500}>Fast</option>
            <option value={250}>Very Fast</option>
          </select>
          <span className="ml-auto text-[11px] text-zinc-500 dark:text-zinc-400 font-mono tabular-nums">
            Comparisons: {comparisons}
          </span>
        </div>

        {/* Compact array bars */}
        <div className="flex-1 flex items-end justify-center gap-1.5 min-h-0 pb-2">
          {array.map((value, index) => {
            const isChecking = index === currentIndex && !isComplete;
            const isMax = index === maxIndex;
            const isScanned = index < currentIndex;
            const isFound = isComplete && isMax;
            return (
              <div key={index} className="flex flex-col items-center gap-1 flex-1 max-w-[48px]">
                <span className="text-[10px] font-mono text-zinc-400">{value}</span>
                <div
                  className={[
                    "w-full rounded-sm transition-all duration-200",
                    isFound
                      ? "bg-emerald-500 ring-2 ring-emerald-400/50"
                      : isChecking
                      ? "bg-amber-400 dark:bg-amber-500"
                      : isMax
                      ? "bg-emerald-400 dark:bg-emerald-500"
                      : isScanned
                      ? "bg-indigo-300 dark:bg-indigo-500/60"
                      : "bg-zinc-200 dark:bg-zinc-700",
                  ].join(" ")}
                  style={{ height: `${Math.max(value * 12 + 16, 20)}px` }}
                />
                <span className="text-[9px] font-mono text-zinc-500">{index}</span>
              </div>
            );
          })}
        </div>

        {/* Status line */}
        <div className="text-center text-xs text-zinc-500 dark:text-zinc-400 flex-shrink-0">
          {isComplete ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              ✓ Maximum: {array[maxIndex]} at index [{maxIndex}]
            </span>
          ) : isPlaying ? (
            <span className="text-amber-600 dark:text-amber-400">
              Checking index [{currentIndex}]…
            </span>
          ) : (
            <span>Press Play to visualize the algorithm</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary p-6">
      {/* Navigation */}
      <div className="max-w-6xl mx-auto mb-8">
        <button
          onClick={() => navigate("home")}
          className="flex items-center gap-2 text-theme-secondary hover:text-theme-primary transition-colors mb-6 group cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          Back to Array Problems
        </button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Maximize2 className="h-12 w-12 text-success" />
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-success400 to-success400">
              Find Maximum Element
            </h1>
          </div>
          <p className="text-theme-tertiary text-lg max-w-2xl mx-auto">
            Visualizing the process of finding the largest element in an array
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Visualization */}
        <div className="lg:col-span-2 space-y-6">
          {/* Controls */}
          <div className="bg-theme-secondary/50 rounded-2xl p-6 border border-theme-secondary">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={loadDefaultArray}
                  className="flex items-center gap-2 px-4 py-2 bg-accent-primary hover:bg-accent-primary-hover rounded-xl font-medium transition-all cursor-pointer"
                >
                  Load & Visualize
                </button>
                
                <button
                  onClick={startAnimation}
                  disabled={isPlaying}
                  className="flex items-center gap-2 px-6 py-3 cursor-pointer bg-success hover:bg-success-hover disabled:bg-success/50 rounded-xl font-medium transition-all disabled:cursor-not-allowed"
                >
                  <Play className="h-4 w-4" />
                  {isPlaying ? "Running..." : "Start Animation"}
                </button>
                
                <button
                  onClick={resetAnimation}
                  className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-theme-elevated hover:bg-theme-elevated rounded-xl font-medium transition-all"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>

              <button
                onClick={generateNewArray}
                className="px-4 py-2 bg-purple cursor-pointer hover:bg-purplehover rounded-xl font-medium transition-all"
              >
                New Array
              </button>
            </div>

            <div className="flex items-center gap-4">
              <label className="text-theme-tertiary text-sm">Speed:</label>
              <select 
                value={speed} 
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="bg-theme-tertiary border border-theme-primary cursor-pointer rounded-lg px-3 py-2 text-theme-primary"
              >
                <option value={1500}>Slow</option>
                <option value={1000}>Medium</option>
                <option value={500}>Fast</option>
                <option value={250}>Very Fast</option>
              </select>

              <div className="flex items-center gap-2 ml-4">
                <Code className="h-4 w-4 text-accent-primary" />
                <span className="text-sm text-theme-secondary">Comparisons: {comparisons}</span>
              </div>
            </div>
          </div>

          {/* Array Visualization */}
          <div className="bg-theme-secondary/50 rounded-2xl p-8 border border-theme-secondary">
            <h3 className="text-xl font-bold text-theme-primary mb-6 text-center">Array Visualization</h3>
            
            <div className="flex justify-center items-end gap-4 mb-8 min-h-[200px]">
              {array.map((value, index) => (
                <div key={index} className="flex flex-col items-center gap-3">
                  <div className="text-theme-tertiary text-sm font-mono">[{index}]</div>
                  <div
                    className={`w-16 flex flex-col items-center justify-end rounded-lg border-2 transition-all duration-300 ${
                      index === currentIndex && !isComplete
                        ? "bg-warning-light border-warning scale-110 shadow-lg shadow-warning/25"
                        : index === maxIndex
                        ? "bg-success-light border-success scale-105 shadow-lg shadow-success/25"
                        : index < currentIndex
                        ? "bg-accent-primary-light border-accent-primary"
                        : "bg-theme-tertiary border-theme-primary"
                    } ${
                      isComplete && index === maxIndex
                        ? "bg-success/40 border-success animate-pulse shadow-2xl shadow-green-500/30"
                        : ""
                    }`}
                    style={{ height: `${value * 20 + 60}px` }}
                  >
                    <div className="flex-1 flex items-center justify-center">
                      <span className="text-theme-primary font-bold text-lg">{value}</span>
                    </div>
                    <div className={`w-full text-center py-1 text-xs font-bold ${
                      index === maxIndex ? "bg-success text-theme-primary" : "bg-theme-elevated text-theme-secondary"
                    }`}>
                      {index === maxIndex ? "MAX" : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Status */}
            <div className="text-center">
              {isComplete ? (
                <div className="flex items-center justify-center gap-3 text-2xl font-bold text-success animate-pulse">
                  <Maximize2 className="h-8 w-8" />
                  Maximum Element Found: {array[maxIndex]} at index {maxIndex}
                </div>
              ) : isPlaying ? (
                <div className="flex items-center justify-center gap-3 text-lg text-warning">
                  <Zap className="h-5 w-5" />
                  Checking element at index {currentIndex}...
                </div>
              ) : (
                <div className="text-theme-tertiary">
                  Click "Start Animation" to begin visualization
                </div>
              )}
            </div>
          </div>

          {/* Algorithm Steps */}
          <div className="bg-theme-secondary/50 rounded-2xl p-6 border border-theme-secondary">
            <h3 className="text-xl font-bold text-theme-primary mb-4">Algorithm Steps</h3>
            <div className="space-y-3 text-theme-secondary">
              <div className={`flex items-start gap-3 p-3 rounded-lg ${
                currentIndex >= 0 ? "bg-accent-primary-light border border-accent-primary/30" : ""
              }`}>
                <div className="w-6 h-6 bg-accent-primary rounded-full flex items-center justify-center text-xs font-bold mt-1">1</div>
                <p>Initialize <code className="bg-theme-tertiary px-2 py-1 rounded">max_index = 0</code></p>
              </div>
              <div className={`flex items-start gap-3 p-3 rounded-lg ${
                currentIndex > 0 ? "bg-accent-primary-light border border-accent-primary/30" : ""
              }`}>
                <div className="w-6 h-6 bg-accent-primary rounded-full flex items-center justify-center text-xs font-bold mt-1">2</div>
                <p>Traverse through each element in the array from index 1 to n-1</p>
              </div>
              <div className={`flex items-start gap-3 p-3 rounded-lg ${
                currentIndex > 0 ? "bg-accent-primary-light border border-accent-primary/30" : ""
              }`}>
                <div className="w-6 h-6 bg-accent-primary rounded-full flex items-center justify-center text-xs font-bold mt-1">3</div>
                <p>For each element, compare with current maximum: <code className="bg-theme-tertiary px-2 py-1 rounded">if (array[i] {">"} array[max_index])</code></p>
              </div>
              <div className={`flex items-start gap-3 p-3 rounded-lg ${
                isComplete ? "bg-success-light border border-success/30" : ""
              }`}>
                <div className="w-6 h-6 bg-accent-primary rounded-full flex items-center justify-center text-xs font-bold mt-1">4</div>
                <p>Update <code className="bg-theme-tertiary px-2 py-1 rounded">max_index = i</code> if current element is larger</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Code and Complexity */}
        <div className="space-y-6">
          {/* Algorithm Selection */}
          <div className="bg-theme-secondary/50 rounded-2xl p-6 border border-theme-secondary">
            <h3 className="text-xl font-bold text-theme-primary mb-4">Algorithm</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-success-light border border-success/30 rounded-lg">
                <Zap className="h-5 w-5 text-success" />
                <div>
                  <div className="font-bold text-theme-primary">Optimal O(n)</div>
                  <div className="text-sm text-theme-tertiary">Single pass through array</div>
                </div>
              </div>
            </div>
          </div>

          {/* Code Display */}
          <div className="bg-theme-secondary/50 rounded-2xl p-6 border border-theme-secondary">
            <h3 className="text-xl font-bold text-theme-primary mb-4">C++ Optimal Solution</h3>
            <div className="bg-theme-primary rounded-lg p-4 font-mono text-sm">
              <div className="text-accent-primary">int findMax(vector<span className="text-pink">{'<'}</span>int<span className="text-pink">{'>'}</span>& arr) {'{'}</div>
              <div className="text-success ml-4">int max_index = 0;</div>
              <div className="text-success ml-4">for (int i = 1; i {'<'} arr.size(); i++) {'{'}</div>
              <div className={`text-warning ml-8 ${currentIndex > 0 ? "bg-warning-light px-2 rounded" : ""}`}>
                if (arr[i] {'>'} arr[max_index]) {'{'}
              </div>
              <div className={`text-danger ml-12 ${maxIndex === currentIndex ? "bg-danger-light px-2 rounded" : ""}`}>
                max_index = i;
              </div>
              <div className="text-warning ml-8">{'}'}</div>
              <div className="text-success ml-4">{'}'}</div>
              <div className="text-success ml-4">return arr[max_index];</div>
              <div className="text-accent-primary">{'}'}</div>
            </div>
          </div>

          {/* Complexity Analysis */}
          <div className="bg-theme-secondary/50 rounded-2xl p-6 border border-theme-secondary">
            <h3 className="text-xl font-bold text-theme-primary mb-4">Complexity Analysis</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-accent-primary mt-1" />
                <div>
                  <div className="font-bold text-theme-primary">Time Complexity: O(N)</div>
                  <div className="text-sm text-theme-tertiary">
                    We make a single pass through the array, comparing each element with the current maximum. 
                    Each element is visited exactly once.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Cpu className="h-5 w-5 text-success mt-1" />
                <div>
                  <div className="font-bold text-theme-primary">Space Complexity: O(1)</div>
                  <div className="text-sm text-theme-tertiary">
                    We only use constant extra space for tracking the maximum index and loop variables. 
                    No additional arrays are required.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-theme-tertiary rounded-lg">
              <div className="text-sm text-theme-secondary">
                <strong>Key Insight:</strong> The maximum element can be found in linear time by maintaining 
                a running maximum while traversing the array once.
              </div>
            </div>
          </div>

          {/* Current Array Display */}
          <div className="bg-theme-secondary/50 rounded-2xl p-6 border border-theme-secondary">
            <h3 className="text-xl font-bold text-theme-primary mb-4">Current Array</h3>
            <div className="bg-theme-primary rounded-lg p-4">
              <div className="font-mono text-sm text-theme-secondary mb-2">
                [{array.join(", ")}]
              </div>
              <div className="text-xs text-theme-muted">
                Array length: {array.length} elements
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindMaxElement;