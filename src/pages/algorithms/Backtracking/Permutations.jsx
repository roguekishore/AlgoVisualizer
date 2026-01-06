import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Code,
  CheckCircle,
  BarChart3,
  Clock,
  Repeat,
  GitBranch,
  List,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Zap,
  Cpu,
  Calculator,
  Layers,
} from "lucide-react";

// Main Visualizer Component
const PermutationsVisualizer = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [arrayInput, setArrayInput] = useState("1,2,3");
  const [isLoaded, setIsLoaded] = useState(false);
  const [active, setActive] = useState(false);
  const visualizerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [results, setResults] = useState([]);

  const generatePermutationsHistory = useCallback((initialArray) => {
    const nums = initialArray.map(num => {
      const numValue = parseInt(num);
      return isNaN(numValue) ? 0 : numValue; // Handle invalid numbers
    });
    const newHistory = [];
    const result = [];
    const n = nums.length;
    let stepCount = 0;

    const addState = (props) => {
      newHistory.push({
        nums: [...nums],
        currentPath: [...(props.currentPath || [])],
        used: [...(props.used || Array(n).fill(false))],
        depth: props.depth || 0,
        explanation: props.explanation || "",
        currentResults: [...result],
        step: stepCount++,
        ...props,
      });
    };

    const backtrack = (path, used, depth) => {
      addState({
        currentPath: [...path],
        used: [...used],
        depth,
        explanation: `Entering backtrack at depth ${depth}. Current path: [${path.join(', ') || 'empty'}]`,
        line: 2,
        focus: [depth],
      });

      if (path.length === n) {
        result.push([...path]);
        addState({
          currentPath: [...path],
          used: [...used],
          depth,
          explanation: `✓ Found a complete permutation: [${path.join(', ')}]`,
          currentResults: [...result],
          line: 3,
          foundResult: true,
          highlight: path.map((_, idx) => idx),
        });
        return;
      }

      for (let i = 0; i < n; i++) {
        if (!used[i]) {
          addState({
            currentPath: [...path],
            used: [...used],
            depth,
            explanation: `Trying number ${nums[i]} at position ${depth}. Marking it as used.`,
            currentIndex: i,
            line: 5,
            comparing: [i],
            focus: [depth],
          });

          used[i] = true;
          path.push(nums[i]);

          addState({
            currentPath: [...path],
            used: [...used],
            depth,
            explanation: `Added ${nums[i]} to path. Now exploring deeper...`,
            currentIndex: i,
            line: 6,
            comparing: [i],
            focus: [depth],
          });

          backtrack(path, used, depth + 1);

          addState({
            currentPath: [...path],
            used: [...used],
            depth,
            explanation: `Backtracking: Removing ${path[path.length - 1]} from path and marking as unused.`,
            currentIndex: i,
            line: 8,
            comparing: [i],
            focus: [depth],
          });

          path.pop();
          used[i] = false;
          
          addState({
            currentPath: [...path],
            used: [...used],
            depth,
            explanation: `Continuing to next number at depth ${depth}.`,
            line: 9,
            focus: [depth],
          });
        } else {
          addState({
            currentPath: [...path],
            used: [...used],
            depth,
            explanation: `Number ${nums[i]} is already used, skipping.`,
            currentIndex: i,
            line: 4,
            comparing: [i],
            skipped: true,
            focus: [depth],
          });
        }
      }

      addState({
        currentPath: [...path],
        used: [...used],
        depth,
        explanation: `Finished exploring all possibilities at depth ${depth}. Returning to previous level.`,
        line: 10,
        focus: [depth],
      });
    };

    // Initial call
    addState({
      explanation: "Starting permutation generation using backtracking...",
      line: 1,
    });

    backtrack([], Array(n).fill(false), 0);

    addState({
      explanation: `✓ All permutations generated! Total: ${result.length} permutations found.`,
      currentResults: [...result],
      line: 11,
      finished: true,
      highlight: Array.from({ length: n }, (_, i) => i),
    });

    setHistory(newHistory);
    setCurrentStep(0);
    setResults(result);
  }, []);

  const loadArray = () => {
    const localArray = arrayInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (localArray.length === 0) {
      alert("Please enter at least one number.");
      return;
    }

    // Validate numbers and limit input size
    const validNumbers = localArray.slice(0, 5).map(num => {
      const numValue = parseInt(num);
      return isNaN(numValue) ? 1 : Math.min(Math.abs(numValue), 99); // Limit to 2-digit numbers
    });

    if (validNumbers.length > 5) {
      alert("For optimal visualization, using first 5 numbers only.");
    }

    setArrayInput(validNumbers.join(","));
    setIsLoaded(true);
    generatePermutationsHistory(validNumbers);
  };

  const reset = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
    setResults([]);
    setIsPlaying(false);
  };

  const generateNewArray = () => {
    const n = Math.floor(Math.random() * 3) + 3; // 3-5 numbers
    const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 9) + 1); // 1-9
    setArrayInput(arr.join(","));
    reset();
  };

  const handleEnterKey = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      loadArray();
    }
  };

  const handleSpeedChange = (e) => {
    setSpeed(Number(e.target.value));
  };

  const playAnimation = () => {
    if (currentStep >= history.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
  };

  const pauseAnimation = () => {
    setIsPlaying(false);
  };

  const stepForward = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, history.length - 1));
  }, [history.length]);

  const stepBackward = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

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

  const state = history[currentStep] || {};
  const { 
    nums = [], 
    currentPath = [], 
    used = [], 
    currentResults = [], 
    line, 
    note, 
    comparing = [], 
    focus = [],
    finished,
    foundResult 
  } = state;

  const CodeLine = ({ lineNum, content, highlight }) => (
    <div
      className={`block rounded-md transition-all duration-300 ${
        line === lineNum
          ? "bg-purplelight border-l-4 border-purple shadow-lg"
          : "hover:bg-theme-elevated/30"
      }`}
    >
      <span className="text-theme-muted select-none inline-block w-8 text-right mr-3">
        {lineNum}
      </span>
      <span className={line === lineNum ? "text-purple font-semibold" : "text-theme-secondary"}>
        {content}
      </span>
    </div>
  );

  const permutationsCode = [
    { line: 1, content: "function permute(nums) {" },
    { line: 2, content: "  const result = [];" },
    { line: 3, content: "  backtrack([], Array(nums.length).fill(false));" },
    { line: 4, content: "  return result;" },
    { line: 5, content: "" },
    { line: 6, content: "  function backtrack(path, used) {" },
    { line: 7, content: "    if (path.length === nums.length) {" },
    { line: 8, content: "      result.push([...path]);" },
    { line: 9, content: "      return;" },
    { line: 10, content: "    }" },
    { line: 11, content: "" },
    { line: 12, content: "    for (let i = 0; i < nums.length; i++) {" },
    { line: 13, content: "      if (used[i]) continue;" },
    { line: 14, content: "" },
    { line: 15, content: "      used[i] = true;" },
    { line: 16, content: "      path.push(nums[i]);" },
    { line: 17, content: "      backtrack(path, used);" },
    { line: 18, content: "      path.pop();" },
    { line: 19, content: "      used[i] = false;" },
    { line: 20, content: "    }" },
    { line: 21, content: "  }" },
    { line: 22, content: "}" },
  ];

  return (
    <div
      ref={visualizerRef}
      tabIndex={0}
      className="p-4 max-w-7xl mx-auto focus:outline-none"
    >
      <header className="text-center mb-6">
        <h1 className="text-5xl font-bold text-purple flex items-center justify-center gap-3">
          <GitBranch size={28} />
          Permutations Visualizer
          <span className="text-lg bg-purplelight text-purple px-3 py-1 rounded-full">
            LeetCode #46
          </span>
        </h1>
        <p className="text-lg text-theme-tertiary mt-2">
          Generate all possible permutations using backtracking
        </p>
      </header>

      {/* Enhanced Controls Section */}
      <div className="bg-theme-tertiary/50 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-theme-primary/50 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-grow">
          <label htmlFor="array-input" className="font-medium text-theme-secondary font-mono hidden md:block">
            Numbers:
          </label>
          <input
            id="array-input"
            type="text"
            value={arrayInput}
            onChange={(e) => setArrayInput(e.target.value)}
            onKeyDown={handleEnterKey}
            disabled={isLoaded}
            placeholder="e.g., 1,2,3 (max 5 numbers)"
            className="font-mono flex-grow bg-theme-secondary border border-theme-primary rounded-lg p-3 focus:ring-2 focus:ring-purple focus:border-transparent transition-all"
          />
        </div>
        
        <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
          {!isLoaded ? (
            <>
              <button
                onClick={loadArray}
                className="bg-purple hover:bg-purplehover text-theme-primary font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Load & Visualize
              </button>
              <button
                onClick={generateNewArray}
                className="bg-accent-primary-hover hover:bg-accent-primary-hover text-theme-primary font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                New Array
              </button>
            </>
          ) : (
            <>
              <div className="flex gap-2">
                <button
                  onClick={stepBackward}
                  disabled={currentStep <= 0}
                  className="bg-theme-elevated hover:bg-theme-elevated p-3 rounded-lg disabled:opacity-50 transition-all duration-300"
                >
                  <SkipBack size={20} />
                </button>
                
                {!isPlaying ? (
                  <button
                    onClick={playAnimation}
                    disabled={currentStep >= history.length - 1}
                    className="bg-success hover:bg-success-hover p-3 rounded-lg disabled:opacity-50 transition-all duration-300"
                  >
                    <Play size={20} />
                  </button>
                ) : (
                  <button
                    onClick={pauseAnimation}
                    className="bg-warning hover:bg-warning-hover p-3 rounded-lg transition-all duration-300"
                  >
                    <Pause size={20} />
                  </button>
                )}

                <button
                  onClick={stepForward}
                  disabled={currentStep >= history.length - 1}
                  className="bg-theme-elevated hover:bg-theme-elevated p-3 rounded-lg disabled:opacity-50 transition-all duration-300"
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
                    className="bg-theme-elevated border border-theme-primary rounded-lg px-3 py-2 text-theme-primary text-sm"
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
            </>
          )}
          
          <button
            onClick={reset}
            className="bg-danger-hover hover:bg-danger-hover font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>

      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pseudocode Panel */}
          <div className="lg:col-span-1 bg-theme-tertiary/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-theme-primary/50">
            <h3 className="font-bold text-xl text-purple mb-4 border-b border-theme-primary/50 pb-3 flex items-center gap-2">
              <Code size={20} />
              Backtracking Code
            </h3>
            <div className="overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <pre className="text-sm">
                <code className="font-mono leading-relaxed block">
                  {permutationsCode.map((line) => (
                    <CodeLine 
                      key={line.line} 
                      lineNum={line.line} 
                      content={line.content}
                    />
                  ))}
                </code>
              </pre>
            </div>
          </div>

          {/* Enhanced Visualization Panels */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current State Visualization */}
            <div className="bg-theme-tertiary/50 backdrop-blur-sm p-6 rounded-xl border border-theme-primary/50 shadow-2xl">
              <h3 className="font-bold text-lg text-theme-secondary mb-6 flex items-center gap-2">
                <BarChart3 size={20} />
                Backtracking Process
              </h3>
              
              <div className="space-y-6">
                {/* Available Numbers with Enhanced Styling */}
                <div>
                  <h4 className="text-sm text-theme-tertiary mb-3 flex items-center gap-2">
                    <Layers size={16} />
                    Available Numbers
                  </h4>
                  <div className="flex gap-3 flex-wrap">
                    {nums.map((num, index) => (
                      <div
                        key={index}
                        className={`w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center font-bold transition-all duration-500 transform ${
                          used[index]
                            ? "bg-danger-light border-danger text-danger scale-95"
                            : comparing.includes(index)
                            ? "bg-teal/20 border-teal400 text-teal300 scale-110 shadow-lg shadow-cyan-500/30"
                            : "bg-theme-elevated border-theme-primary text-theme-secondary hover:scale-105"
                        }`}
                      >
                        <span className="text-xl">{num}</span>
                        <span className="text-xs text-theme-tertiary mt-1">[{index}]</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Current Path with Enhanced Visualization */}
                <div>
                  <h4 className="text-sm text-theme-tertiary mb-3 flex items-center gap-2">
                    <GitBranch size={16} />
                    Current Path (Depth: {currentPath.length})
                  </h4>
                  <div className="flex gap-3 flex-wrap min-h-20 items-center bg-theme-secondary/50 rounded-lg p-4">
                    {currentPath.length === 0 ? (
                      <div className="text-theme-muted italic text-center w-full">Empty path - start building permutation</div>
                    ) : (
                      currentPath.map((num, index) => (
                        <div
                          key={index}
                          className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center font-bold text-theme-primary text-lg shadow-lg transform transition-all duration-500 ${
                            focus.includes(index)
                              ? "bg-gradient-to-br from-purple500 to-pink500 border-purple scale-110 rotate-2"
                              : "bg-gradient-to-br from-accent-primary500 to-purple500 border-accent-primary scale-100"
                          }`}
                        >
                          {num}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Recursion Depth Indicator */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 border border-theme-primary">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-theme-tertiary flex items-center gap-2">
                      <Calculator size={16} />
                      Recursion Depth
                    </span>
                    <span className="font-mono text-teal text-lg">{state.depth || 0}/{nums.length}</span>
                  </div>
                  <div className="w-full bg-theme-elevated rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-teal500 to-accent-primary500 h-3 rounded-full transition-all duration-500 shadow-lg shadow-cyan-500/25"
                      style={{ width: `${((state.depth || 0) / nums.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Results Panel */}
            <div className="bg-theme-tertiary/50 backdrop-blur-sm p-6 rounded-xl border border-theme-primary/50 shadow-2xl">
              <h3 className="font-bold text-lg text-theme-secondary mb-4 flex items-center gap-2">
                <CheckCircle size={20} />
                Generated Permutations 
                <span className="text-success font-mono ml-2">({currentResults.length})</span>
              </h3>
              <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {currentResults.map((permutation, idx) => (
                    <div
                      key={idx}
                      className="bg-gradient-to-br from-success900/30 to-success900/30 border border-success/30 rounded-lg p-3 font-mono text-sm text-success text-center transition-all hover:scale-105 hover:bg-success-light shadow-lg"
                    >
                      [{permutation.join(", ")}]
                    </div>
                  ))}
                </div>
                {currentResults.length === 0 && (
                  <div className="text-theme-muted text-center py-6 italic bg-theme-secondary/30 rounded-lg">
                    No permutations generated yet...
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Explanation Panel */}
            <div className="bg-gradient-to-br from-purple900/20 to-pink900/20 backdrop-blur-sm p-4 rounded-xl border border-purple700/50 min-h-[5rem]">
              <h3 className="text-theme-tertiary text-sm mb-2 flex items-center gap-2">
                <Zap size={16} />
                Step Explanation
              </h3>
              <p className="text-theme-secondary text-lg leading-relaxed">
                {state.explanation || "Load an array to begin visualization."}
                {finished && (
                  <CheckCircle className="inline-block ml-2 text-success" size={20} />
                )}
              </p>
            </div>
          </div>

          {/* Enhanced Complexity Analysis */}
          <div className="lg:col-span-3 bg-theme-tertiary/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-theme-primary/50">
            <h3 className="font-bold text-xl text-purple mb-4 border-b border-theme-primary/50 pb-3 flex items-center gap-2">
              <Clock size={20} /> Complexity Analysis
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <h4 className="font-semibold text-purple flex items-center gap-2">
                  <Zap size={16} />
                  Time Complexity
                </h4>
                <div className="space-y-3">
                  <div className="bg-theme-secondary/50 p-3 rounded-lg border border-theme-primary">
                    <strong className="text-teal300 font-mono block mb-1">O(N × N!)</strong>
                    <p className="text-theme-tertiary text-sm">
                      There are N! permutations to generate. For each permutation, we spend O(N) time to build it.
                      The backtracking tree has N! leaves and about N nodes per path.
                    </p>
                  </div>
                  <div className="bg-theme-secondary/50 p-3 rounded-lg border border-theme-primary">
                    <strong className="text-teal300 font-mono block mb-1">Example Breakdown</strong>
                    <div className="text-theme-tertiary text-sm space-y-1">
                      <div>N=3: 3! = 6 permutations × 3 operations ≈ 18 operations</div>
                      <div>N=4: 4! = 24 permutations × 4 operations ≈ 96 operations</div>
                      <div>N=5: 5! = 120 permutations × 5 operations ≈ 600 operations</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-purple flex items-center gap-2">
                  <Cpu size={16} />
                  Space Complexity
                </h4>
                <div className="space-y-3">
                  <div className="bg-theme-secondary/50 p-3 rounded-lg border border-theme-primary">
                    <strong className="text-teal300 font-mono block mb-1">O(N)</strong>
                    <p className="text-theme-tertiary text-sm">
                      The recursion depth goes up to N (the length of the input array).
                      We also use O(N) space for the current path and used array.
                      The output space of N! permutations is not counted in auxiliary space complexity.
                    </p>
                  </div>
                  <div className="bg-theme-secondary/50 p-3 rounded-lg border border-theme-primary">
                    <strong className="text-teal300 font-mono block mb-1">Key Insight</strong>
                    <p className="text-theme-tertiary text-sm">
                      Backtracking efficiently reuses the same path array by pushing and popping,
                      avoiding the need to create new arrays at each step.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-theme-tertiary/50 rounded-xl border border-theme-primary/50">
          <div className="text-theme-muted text-lg mb-4">
            Enter numbers (1-5 recommended) and click "Load & Visualize" to start
          </div>
          <div className="text-theme-muted text-sm max-w-2xl mx-auto space-y-2">
            <div className="flex items-center justify-center gap-4 text-xs">
              <span className="bg-purplelight text-purple px-3 py-1 rounded-full">N=3 → 6 permutations</span>
              <span className="bg-accent-primary-light text-accent-primary px-3 py-1 rounded-full">N=4 → 24 permutations</span>
              <span className="bg-success-light text-success px-3 py-1 rounded-full">N=5 → 120 permutations</span>
            </div>
            <p className="mt-4">
              <strong>Note:</strong> Large inputs (N {">"} 5) are automatically limited for optimal visualization performance.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermutationsVisualizer;