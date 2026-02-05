import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Code,
  CheckCircle,
  BarChart3,
  Clock,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Zap,
  Cpu,
  Calculator,
  Grid,
  Layers,
  TrendingUp,
  Maximize2,
  Target,
  Gauge,
} from "lucide-react";
import { useModeHistorySwitch } from "../../../hooks/useModeHistorySwitch";

// Pointer Component
const Pointer = ({ index, containerId, color, label }) => {
  const [position, setPosition] = useState({ left: 0, top: 0 });

  useEffect(() => {
    const updatePosition = () => {
      const container = document.getElementById(containerId);
      const element = document.getElementById(`${containerId}-element-${index}`);

      if (container && element) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();

        setPosition({
          left: elementRect.left - containerRect.left + elementRect.width / 2,
          top: elementRect.bottom - containerRect.top + 8,
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    
    return () => window.removeEventListener('resize', updatePosition);
  }, [index, containerId]);

  const colors = {
    red: { bg: "bg-danger", text: "text-danger" },
    blue: { bg: "bg-accent-primary", text: "text-accent-primary" },
    green: { bg: "bg-success", text: "text-success" },
  };

  return (
    <div
      className="absolute transition-all duration-500 ease-out z-10"
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
        transform: "translateX(-50%)",
      }}
    >
      <div
        className={`w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent ${colors[color].bg}`}
        style={{ 
          borderBottomColor: color === "red" ? "#ef4444" : 
                          color === "blue" ? "#3b82f6" : "#10b981" 
        }}
      />
      <div
        className={`text-xs font-bold mt-1 text-center ${colors[color].text}`}
      >
        {label}
      </div>
    </div>
  );
};

const SlidingWindowMaximum = () => {
  const [mode, setMode] = useState("optimal");
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [numsInput, setNumsInput] = useState("1,3,-1,-3,5,3,6,7");
  const [kInput, setKInput] = useState("3");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [windowStyle, setWindowStyle] = useState({});
  const visualizerRef = useRef(null);

  const generateBruteForceHistory = useCallback((nums, k) => {
    const newHistory = [];
    const result = [];
    let stepCount = 0;

    const addState = (props) => {
      newHistory.push({
        nums,
        k,
        result: [...result],
        windowStart: null,
        windowEnd: null,
        currentMax: null,
        comparingIndex: null,
        explanation: "",
        step: stepCount++,
        ...props,
      });
    };

    addState({
      line: 3,
      explanation: `Starting brute force approach. Array has ${nums.length} elements, window size k = ${k}`,
    });

    for (let i = 0; i <= nums.length - k; i++) {
      addState({
        line: 4,
        windowStart: i,
        windowEnd: i + k - 1,
        currentIndex: i,
        explanation: `Checking window from index ${i} to ${i + k - 1}`,
      });

      let maxVal = -Infinity;
      addState({
        line: 5,
        windowStart: i,
        windowEnd: i + k - 1,
        currentMax: null,
        currentIndex: i,
        comparingIndex: i,
        explanation: `Initialize max for this window.`,
      });

      for (let j = i; j < i + k; j++) {
        addState({
          line: 6,
          windowStart: i,
          windowEnd: i + k - 1,
          currentMax: maxVal === -Infinity ? null : maxVal,
          currentIndex: i,
          comparingIndex: j,
          explanation: `Comparing: current max = ${
            maxVal === -Infinity ? "-∞" : maxVal
          }, nums[${j}] = ${nums[j]}`,
        });

        if (nums[j] > maxVal) {
          maxVal = nums[j];
          addState({
            line: 7,
            windowStart: i,
            windowEnd: i + k - 1,
            currentMax: maxVal,
            currentIndex: i,
            comparingIndex: j,
            explanation: `Found new max: ${maxVal} at index ${j}`,
          });
        }
      }

      result.push(maxVal);
      addState({
        line: 9,
        windowStart: i,
        windowEnd: i + k - 1,
        currentMax: maxVal,
        currentIndex: i,
        explanation: `Window maximum is ${maxVal}. Added to result.`,
        justAddedToResult: true,
      });
    }

    addState({
      line: 11,
      finished: true,
      explanation: `Completed! Result: [${result.join(", ")}]`,
    });

    setHistory(newHistory);
    setCurrentStep(0);
    setIsLoaded(true);
  }, []);

  const generateOptimalHistory = useCallback((nums, k) => {
    const newHistory = [];
    const result = [];
    const deque = [];
    let stepCount = 0;

    const addState = (props) => {
      newHistory.push({
        nums,
        k,
        result: [...result],
        deque: [...deque],
        windowStart: null,
        windowEnd: null,
        currentIndex: null,
        explanation: "",
        step: stepCount++,
        ...props,
      });
    };

    addState({
      line: 3,
      explanation: `Starting optimal approach using Deque. Array has ${nums.length} elements, window size k = ${k}`,
    });

    for (let i = 0; i < nums.length; i++) {
      addState({
        line: 5,
        currentIndex: i,
        windowStart: Math.max(0, i - k + 1),
        windowEnd: i,
        explanation: `Processing index ${i}, value = ${nums[i]}`,
      });

      addState({
        line: 7,
        currentIndex: i,
        windowStart: Math.max(0, i - k + 1),
        windowEnd: i,
        explanation: `Check if deque front is outside window (i - k + 1 = ${
          i - k + 1
        })`,
      });

      while (deque.length > 0 && deque[0] < i - k + 1) {
        const removed = deque.shift();
        addState({
          line: 8,
          currentIndex: i,
          windowStart: Math.max(0, i - k + 1),
          windowEnd: i,
          removedFromFront: removed,
          explanation: `Removed index ${removed} from deque front (outside window)`,
        });
      }

      addState({
        line: 11,
        currentIndex: i,
        windowStart: Math.max(0, i - k + 1),
        windowEnd: i,
        explanation: `Remove elements smaller than or equal to ${nums[i]} from deque back`,
      });

      while (deque.length > 0 && nums[deque[deque.length - 1]] <= nums[i]) {
        const removed = deque.pop();
        addState({
          line: 12,
          currentIndex: i,
          windowStart: Math.max(0, i - k + 1),
          windowEnd: i,
          removedFromBack: removed,
          explanation: `Removed index ${removed} (value ${nums[removed]}) from back because ${nums[i]} is larger or equal`,
        });
      }

      deque.push(i);
      addState({
        line: 15,
        currentIndex: i,
        windowStart: Math.max(0, i - k + 1),
        windowEnd: i,
        justAddedToDeque: i,
        explanation: `Added index ${i} to deque back. Deque now: [${deque.join(
          ", "
        )}]`,
      });

      if (i >= k - 1) {
        const maxVal = nums[deque[0]];
        result.push(maxVal);
        addState({
          line: 18,
          currentIndex: i,
          windowStart: i - k + 1,
          windowEnd: i,
          justAddedToResult: true,
          explanation: `Window [${
            i - k + 1
          }, ${i}] complete. Maximum = ${maxVal} at index ${deque[0]}`,
        });
      }
    }

    addState({
      line: 21,
      finished: true,
      explanation: `Completed! Result: [${result.join(", ")}]`,
    });

    setHistory(newHistory);
    setCurrentStep(0);
    setIsLoaded(true);
  }, []);

  const resetVisualization = () => {
    setHistory([]);
    setCurrentStep(-1);
    setIsLoaded(false);
    setIsPlaying(false);
  };

  const stepForward = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, history.length - 1));
  }, [history.length]);

  const stepBackward = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleSpeedChange = (e) => {
    setSpeed(Number(e.target.value));
  };

  const playAnimation = useCallback(() => {
    if (currentStep >= history.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
  }, [currentStep, history.length]);

  const pauseAnimation = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const loadArray = () => {
    const nums = numsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);
    const k = parseInt(kInput, 10);

    if (nums.some(isNaN) || nums.length === 0) {
      alert("Invalid array input. Please use comma-separated numbers.");
      return;
    }

    if (isNaN(k) || k <= 0 || k > nums.length) {
      alert(`Invalid k value. Must be between 1 and ${nums.length}`);
      return;
    }

    setIsLoaded(true);
    if (mode === "brute-force") {
      generateBruteForceHistory(nums, k);
    } else {
      generateOptimalHistory(nums, k);
    }
  };

  const generateRandomArray = () => {
    const length = Math.floor(Math.random() * 5) + 8; // 8-15 elements
    const array = Array(length)
      .fill()
      .map(() => Math.floor(Math.random() * 20) - 5); // Values between -5 and 15
    
    setNumsInput(array.join(','));
    setKInput(Math.floor(Math.random() * 4) + 2); // k between 2-6
    resetVisualization();
  };

  const parseInput = useCallback(() => {
    const nums = numsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);
    const k = parseInt(kInput, 10);
    if (nums.some(isNaN) || isNaN(k) || k <= 0) throw new Error("Invalid input");
    return { nums, k };
  }, [numsInput, kInput]);

  const handleModeChange = useModeHistorySwitch({
    mode,
    setMode,
    isLoaded,
    parseInput,
    generators: {
      "brute-force": ({ nums, k }) => generateBruteForceHistory(nums, k),
      optimal: ({ nums, k }) => generateOptimalHistory(nums, k),
    },
    setCurrentStep,
    onError: () => {},
  });

  // Auto-play
  useEffect(() => {
    let timer;
    if (isPlaying && currentStep < history.length - 1) {
      timer = setTimeout(() => {
        stepForward();
      }, speed);
    } else if (currentStep >= history.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, history.length, stepForward, speed]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isLoaded) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          stepBackward();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          stepForward();
        } else if (e.key === " ") {
          e.preventDefault();
          if (isPlaying) {
            pauseAnimation();
          } else {
            playAnimation();
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoaded, isPlaying, stepBackward, stepForward, playAnimation, pauseAnimation]);

  const state = history[currentStep] || {};

  useEffect(() => {
    if (isLoaded && state.windowStart !== null && state.windowEnd !== null) {
      const container = document.getElementById("array-container");
      const startEl = document.getElementById(
        `array-container-element-${state.windowStart}`
      );
      const endEl = document.getElementById(
        `array-container-element-${state.windowEnd}`
      );

      if (container && startEl && endEl) {
        const containerRect = container.getBoundingClientRect();
        const startRect = startEl.getBoundingClientRect();
        const endRect = endEl.getBoundingClientRect();

        setWindowStyle({
          position: "absolute",
          top: "-8px",
          bottom: "-8px",
          left: `${startRect.left - containerRect.left - 8}px`,
          width: `${endRect.right - startRect.left + 16}px`,
          backgroundColor: "rgba(56, 189, 248, 0.1)",
          border: "2px solid rgba(56, 189, 248, 0.5)",
          borderRadius: "12px",
          transition: "all 300ms ease-out",
          opacity: 1,
        });
      }
    } else {
      setWindowStyle({ opacity: 0 });
    }
  }, [currentStep, isLoaded, state.windowStart, state.windowEnd]);

  const CodeLine = ({ lineNum, content }) => (
    <div
      className={`block rounded-md transition-all duration-300 ${
        state.line === lineNum
          ? "bg-accent-primary-light border-l-4 border-accent-primary shadow-lg"
          : "hover:bg-theme-elevated/30"
      }`}
    >
      <span className="text-theme-muted select-none inline-block w-8 text-right mr-3">
        {lineNum}
      </span>
      <span className={state.line === lineNum ? "text-accent-primary font-semibold" : "text-theme-secondary"}>
        {content}
      </span>
    </div>
  );

  const bruteForceCode = [
    { line: 1, content: "vector<int> maxSlidingWindow(vector<int>& nums, int k) {" },
    { line: 2, content: "    vector<int> result;" },
    { line: 3, content: "    int n = nums.size();" },
    { line: 4, content: "    for (int i = 0; i <= n - k; i++) {" },
    { line: 5, content: "        int maxVal = nums[i];" },
    { line: 6, content: "        for (int j = i; j < i + k; j++) {" },
    { line: 7, content: "            maxVal = max(maxVal, nums[j]);" },
    { line: 8, content: "        }" },
    { line: 9, content: "        result.push_back(maxVal);" },
    { line: 10, content: "    }" },
    { line: 11, content: "    return result;" },
    { line: 12, content: "}" },
  ];

  const optimalCode = [
    { line: 1, content: "vector<int> maxSlidingWindow(vector<int>& nums, int k) {" },
    { line: 2, content: "    vector<int> result;" },
    { line: 3, content: "    deque<int> dq;" },
    { line: 4, content: "    int n = nums.size();" },
    { line: 5, content: "    for (int i = 0; i < n; i++) {" },
    { line: 6, content: "        // Remove out-of-window elements" },
    { line: 7, content: "        while (!dq.empty() && dq.front() < i - k + 1) {" },
    { line: 8, content: "            dq.pop_front();" },
    { line: 9, content: "        }" },
    { line: 10, content: "        // Remove smaller elements" },
    { line: 11, content: "        while (!dq.empty() && nums[dq.back()] <= nums[i]) {" },
    { line: 12, content: "            dq.pop_back();" },
    { line: 13, content: "        }" },
    { line: 14, content: "        // Add current index" },
    { line: 15, content: "        dq.push_back(i);" },
    { line: 16, content: "        // Add to result if window is complete" },
    { line: 17, content: "        if (i >= k - 1) {" },
    { line: 18, content: "            result.push_back(nums[dq.front()]);" },
    { line: 19, content: "        }" },
    { line: 20, content: "    }" },
    { line: 21, content: "    return result;" },
    { line: 22, content: "}" },
  ];

  const getCellColor = (index) => {
    const num = state.nums?.[index];
    const isComparing = state.comparingIndex === index;
    const isCurrentMax = mode === "brute-force" && 
                        num === state.currentMax && 
                        index <= state.comparingIndex;
    const isDequeIndex = mode === "optimal" && state.deque?.includes(index);
    const isDequeFront = mode === "optimal" && state.deque?.[0] === index;
    const isCurrentIndex = state.currentIndex === index;
    const isInWindow = index >= state.windowStart && index <= state.windowEnd;

    if (isCurrentIndex) {
      return "bg-gradient-to-br from-warning to-orange500 text-theme-primary border-warning shadow-lg shadow-warning/50";
    } else if (isDequeFront) {
      return "bg-gradient-to-br from-success400 to-success500 text-theme-primary border-success shadow-lg shadow-green-500/50";
    } else if (isDequeIndex) {
      return "bg-gradient-to-br from-teal400 to-accent-primary500 text-theme-primary border-teal400 shadow-lg shadow-cyan-500/50";
    } else if (isCurrentMax || isComparing) {
      return "bg-gradient-to-br from-pink400 to-pink500 text-theme-primary border-pink shadow-lg shadow-pink-500/50";
    } else if (isInWindow) {
      return "bg-theme-elevated border-accent-primary shadow-lg";
    }
    return "bg-theme-elevated/50 border-theme-primary hover:bg-theme-elevated/50";
  };

  return (
    <div
      ref={visualizerRef}
      tabIndex={0}
      className="p-4 max-w-7xl mx-auto focus:outline-none"
    >
      <header className="text-center mb-6">
        <h1 className="text-5xl font-bold text-accent-primary flex items-center justify-center gap-3">
          <Maximize2 size={28} />
          Sliding Window Maximum
        </h1>
        <p className="text-lg text-theme-tertiary mt-2">
          Find the maximum value in each sliding window of size k (LeetCode #239)
        </p>
      </header>

      {/* Enhanced Controls Section */}
      <div className="bg-theme-tertiary/50 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-theme-primary/50 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 flex-grow">
          <div className="flex items-center gap-4 flex-grow">
            <label htmlFor="array-input" className="font-medium text-theme-secondary font-mono hidden md:block">
              Array:
            </label>
            <input
              id="array-input"
              type="text"
              value={numsInput}
              onChange={(e) => setNumsInput(e.target.value)}
              disabled={isLoaded}
              placeholder="e.g., 1,3,-1,-3,5,3,6,7"
              className="font-mono flex-grow bg-theme-secondary border border-theme-primary rounded-lg p-3 focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
          <div className="flex items-center gap-4">
            <label htmlFor="k-input" className="font-medium text-theme-secondary font-mono">
              k:
            </label>
            <input
              id="k-input"
              type="number"
              value={kInput}
              onChange={(e) => setKInput(e.target.value)}
              disabled={isLoaded}
              className="font-mono bg-theme-secondary border border-theme-primary rounded-lg p-3 w-20 focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
          {!isLoaded ? (
            <>
              <button
                onClick={loadArray}
                className="bg-accent-primary hover:bg-accent-primary-hover text-theme-primary font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer"
              >
                Load & Visualize
              </button>
              <button
                onClick={generateRandomArray}
                className="bg-purplehover hover:bg-purple700 text-theme-primary font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer"
              >
                Random Array
              </button>
            </>
          ) : (
            <>
              <div className="flex gap-2">
                <button
                  onClick={stepBackward}
                  disabled={currentStep <= 0}
                  className="bg-theme-elevated hover:bg-theme-elevated p-3 rounded-lg disabled:opacity-50 transition-all duration-300 cursor-pointer"
                >
                  <SkipBack size={20} />
                </button>
                
                {!isPlaying ? (
                  <button
                    onClick={playAnimation}
                    disabled={currentStep >= history.length - 1}
                    className="bg-success hover:bg-success-hover p-3 rounded-lg disabled:opacity-50 transition-all duration-300 cursor-pointer"
                  >
                    <Play size={20} />
                  </button>
                ) : (
                  <button
                    onClick={pauseAnimation}
                    className="bg-warning hover:bg-warning-hover p-3 rounded-lg transition-all duration-300 cursor-pointer"
                  >
                    <Pause size={20} />
                  </button>
                )}

                <button
                  onClick={stepForward}
                  disabled={currentStep >= history.length - 1}
                  className="bg-theme-elevated hover:bg-theme-elevated p-3 rounded-lg disabled:opacity-50 transition-all duration-300 cursor-pointer"
                >
                  <SkipForward size={20} />
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-theme-tertiary text-sm">Speed:</label>
                  <select
                    value={speed}
                    onChange={handleSpeedChange}
                    className="bg-theme-elevated border border-theme-primary rounded-lg px-3 py-2 text-theme-primary text-sm cursor-pointer"
                  >
                    <option value={1500}>Slow</option>
                    <option value={1000}>Medium</option>
                    <option value={500}>Fast</option>
                    <option value={250}>Very Fast</option>
                  </select>
                </div>

                <div className="font-mono px-4 py-2 bg-theme-secondary border border-theme-primary rounded-lg text-center min-w-20">
                  {currentStep + 1}/{history.length}
                </div>
              </div>

              <button
                onClick={resetVisualization}
                className="bg-danger-hover hover:bg-danger-hover font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <RotateCcw size={16} />
                Reset
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mode Selection */}
      <div className="flex border-b-2 border-theme-primary mb-6">
        <div
          onClick={() => handleModeChange("brute-force")}
          className={`cursor-pointer p-4 px-8 border-b-4 transition-all font-semibold ${
            mode === "brute-force"
              ? "border-accent-primary text-accent-primary bg-accent-primary-light"
              : "border-transparent text-theme-tertiary hover:text-theme-secondary"
          }`}
        >
          Brute Force O(n·k)
        </div>
        <div
          onClick={() => handleModeChange("optimal")}
          className={`cursor-pointer p-4 px-8 border-b-4 transition-all font-semibold ${
            mode === "optimal"
              ? "border-accent-primary text-accent-primary bg-accent-primary-light"
              : "border-transparent text-theme-tertiary hover:text-theme-secondary"
          }`}
        >
          Optimal O(n) - Deque
        </div>
      </div>

      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pseudocode Panel */}
          <div className="lg:col-span-1 bg-theme-tertiary/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-theme-primary/50">
            <h3 className="font-bold text-xl text-accent-primary mb-4 border-b border-theme-primary/50 pb-3 flex items-center gap-2">
              <Code size={20} />
              {mode === "brute-force" ? "Brute Force Code" : "Optimal Code"}
            </h3>
            <div className="overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <pre className="text-sm">
                <code className="font-mono leading-relaxed block">
                  {(mode === "brute-force" ? bruteForceCode : optimalCode).map((codeLine) => (
                    <CodeLine 
                      key={codeLine.line} 
                      lineNum={codeLine.line} 
                      content={codeLine.content}
                    />
                  ))}
                </code>
              </pre>
            </div>
          </div>

          {/* Enhanced Visualization Panels */}
          <div className="lg:col-span-2 space-y-6">
            {/* Array Visualization */}
            <div className="bg-theme-tertiary/50 backdrop-blur-sm p-6 rounded-xl border border-theme-primary/50 shadow-2xl">
              <h3 className="font-bold text-lg text-theme-secondary mb-6 flex items-center gap-2">
                <Grid size={20} />
                Array Visualization
                {state.nums?.length > 0 && (
                  <span className="text-sm text-theme-tertiary ml-2">
                    ({state.nums.length} elements, k = {state.k})
                  </span>
                )}
              </h3>
              
              <div className="flex flex-col items-center space-y-6">
                {/* Array with indices */}
                <div className="relative" id="array-container">
                  {/* Column headers */}
                  <div className="flex gap-2 mb-2 justify-center">
                    {state.nums?.map((_, index) => (
                      <div key={index} className="w-14 text-center text-xs text-theme-muted font-mono">
                        {index}
                      </div>
                    ))}
                  </div>
                  
                  {/* Array elements */}
                  <div className="flex gap-2 justify-center">
                    {state.nums?.map((num, index) => (
                      <div
                        key={index}
                        id={`array-container-element-${index}`}
                        className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center font-bold text-xl transition-all duration-500 transform ${getCellColor(index)} ${
                          (index >= state.windowStart && index <= state.windowEnd) ? 'scale-110' : 'scale-100'
                        }`}
                      >
                        {num}
                      </div>
                    ))}
                  </div>

                  {/* Window overlay */}
                  <div style={windowStyle} />

                  {/* Pointers */}
                  {state.windowStart !== null && (
                    <Pointer
                      index={state.windowStart}
                      containerId="array-container"
                      color="red"
                      label="start"
                    />
                  )}
                  {state.currentIndex !== null && (
                    <Pointer
                      index={state.currentIndex}
                      containerId="array-container"
                      color="green"
                      label="current"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Deque Visualization (Optimal Mode) */}
            {mode === "optimal" && (
              <div className="bg-gradient-to-br from-accent-primary900/40 to-teal900/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-accent-primary700/50">
                <h3 className="font-bold text-lg text-accent-primary mb-3 flex items-center gap-2">
                  <Layers size={20} />
                  Deque (Front → Back)
                </h3>
                <div className="flex gap-3 min-h-[4rem] bg-theme-secondary/50 p-4 rounded-lg flex-wrap items-center justify-center">
                  {state.deque?.length > 0 ? (
                    state.deque.map((idx, pos) => (
                      <div key={pos} className="flex flex-col items-center">
                        <div
                          className={`w-16 h-16 flex flex-col items-center justify-center font-mono font-bold rounded-lg shadow-lg border-2 transition-all ${
                            pos === 0
                              ? "bg-gradient-to-br from-success400 to-success500 border-success scale-110 text-theme-primary"
                              : "bg-gradient-to-br from-teal400 to-accent-primary500 border-teal400 text-theme-primary"
                          }`}
                        >
                          <span className="text-xs opacity-80">idx</span>
                          <span className="text-lg">{idx}</span>
                        </div>
                        <span className="text-xs text-theme-secondary mt-1">
                          val: {state.nums[idx]}
                        </span>
                        {pos === 0 && (
                          <span className="text-xs text-success font-bold mt-1">
                            MAX
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <span className="text-theme-tertiary italic text-sm">
                      Deque is empty
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Result Array */}
            <div className="bg-gradient-to-br from-purple900/40 to-accent-primary900/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-purple700/50">
              <h3 className="font-bold text-lg text-purple mb-3 flex items-center gap-2">
                <TrendingUp size={20} />
                Result Array
              </h3>
              <div className="flex gap-3 min-h-[4rem] bg-theme-secondary/50 p-4 rounded-lg flex-wrap items-center justify-center">
                {state.result?.length > 0 ? (
                  state.result.map((val, index) => (
                    <div
                      key={index}
                      className={`w-14 h-14 flex items-center justify-center font-mono text-lg font-bold rounded-lg shadow-lg border-2 transition-all ${
                        state.justAddedToResult && index === state.result.length - 1
                          ? "bg-gradient-to-br from-pink400 to-pink500 border-pink scale-110 text-theme-primary animate-bounce"
                          : "bg-gradient-to-br from-purple400 to-accent-primary500 border-purple text-theme-primary"
                      }`}
                    >
                      {val}
                    </div>
                  ))
                ) : (
                  <span className="text-theme-tertiary italic text-sm">
                    No results yet
                  </span>
                )}
              </div>
            </div>

            {/* Status and Explanation Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-accent-primary900/40 to-teal900/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-accent-primary700/50">
                <h3 className="font-bold text-lg text-accent-primary mb-3 flex items-center gap-2">
                  <Calculator size={20} />
                  Current State
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    Window Start: <span className="font-mono font-bold text-orange">
                      {state.windowStart ?? "N/A"}
                    </span>
                  </p>
                  <p>
                    Current Index: <span className="font-mono font-bold text-warning">
                      {state.currentIndex ?? "N/A"}
                    </span>
                  </p>
                  {mode === "brute-force" && state.comparingIndex !== null && (
                    <p>
                      Comparing Index: <span className="font-mono font-bold text-teal">
                        {state.comparingIndex}
                      </span>
                    </p>
                  )}
                  {mode === "brute-force" && (
                    <p>
                      Current Max: <span className="font-mono font-bold text-pink">
                        {state.currentMax ?? "N/A"}
                      </span>
                    </p>
                  )}
                  <p>
                    Result Size: <span className="font-mono font-bold text-success">
                      {state.result?.length ?? 0}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-theme-primary/50">
                <h3 className="font-bold text-lg text-theme-secondary mb-3 flex items-center gap-2">
                  <BarChart3 size={20} />
                  Step Explanation
                </h3>
                <div className="text-theme-secondary text-sm h-20 overflow-y-auto scrollbar-thin">
                  {state.explanation || "Processing..."}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Complexity Analysis */}
          <div className="lg:col-span-3 bg-theme-tertiary/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-theme-primary/50">
            <h3 className="font-bold text-xl text-accent-primary mb-4 border-b border-theme-primary/50 pb-3 flex items-center gap-2">
              <Clock size={20} /> Complexity Analysis
            </h3>
            {mode === "brute-force" ? (
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-4">
                  <h4 className="font-semibold text-accent-primary flex items-center gap-2">
                    <Zap size={16} />
                    Time Complexity
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-theme-secondary/50 p-3 rounded-lg border border-theme-primary">
                      <strong className="text-teal300 font-mono block mb-1">O(n · k)</strong>
                      <p className="text-theme-tertiary text-sm">
                        For each of the (n - k + 1) windows, we iterate through k
                        elements to find the maximum. This results in approximately
                        n · k operations for large arrays.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-accent-primary flex items-center gap-2">
                    <Cpu size={16} />
                    Space Complexity
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-theme-secondary/50 p-3 rounded-lg border border-theme-primary">
                      <strong className="text-teal300 font-mono block mb-1">O(1)</strong>
                      <p className="text-theme-tertiary text-sm">
                        We only use a constant amount of extra space (excluding the
                        result array) - just variables for tracking the maximum
                        value and loop indices.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-4">
                  <h4 className="font-semibold text-accent-primary flex items-center gap-2">
                    <Zap size={16} />
                    Time Complexity
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-theme-secondary/50 p-3 rounded-lg border border-theme-primary">
                      <strong className="text-teal300 font-mono block mb-1">O(n)</strong>
                      <p className="text-theme-tertiary text-sm">
                        Each element is added to the deque exactly once and removed
                        at most once. This gives us 2n operations in total, which
                        simplifies to O(n) linear time complexity.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-accent-primary flex items-center gap-2">
                    <Cpu size={16} />
                    Space Complexity
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-theme-secondary/50 p-3 rounded-lg border border-theme-primary">
                      <strong className="text-teal300 font-mono block mb-1">O(k)</strong>
                      <p className="text-theme-tertiary text-sm">
                        The deque will store at most k elements at any time. The
                        result array also stores n - k + 1 elements. Thus, the space
                        complexity is O(k).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-theme-tertiary/50 rounded-xl border border-theme-primary/50">
          <div className="text-theme-muted text-lg mb-4">
            Enter an array and k value to start the visualization
          </div>
          <div className="text-theme-muted text-sm max-w-2xl mx-auto space-y-2">
            <div className="flex items-center justify-center gap-4 text-xs mb-4">
              <span className="bg-accent-primary-light text-accent-primary px-3 py-1 rounded-full">Array Format: 1,3,-1,-3,5,3,6,7</span>
              <span className="bg-success-light text-success px-3 py-1 rounded-full">k: window size</span>
            </div>
            <p>
              <strong>Example:</strong> Array: "1,3,-1,-3,5,3,6,7", k: 3 → Returns [3,3,5,5,6,7]
            </p>
            <p className="text-theme-muted">
              Find the maximum value in each sliding window of size k as it moves through the array.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlidingWindowMaximum;