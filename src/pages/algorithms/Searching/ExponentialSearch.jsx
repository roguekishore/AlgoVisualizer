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
  Target,
  Gauge,
  Search,
  ArrowRight,
  AlertCircle,
  Sparkles,
  TrendingUp,
  MousePointer,
  List,
  Binary,
  Infinity,
  FastForward,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

// Enhanced Pointer Component for Exponential Search
const Pointer = ({ index, containerId, color, label, isFound = false, isBoundary = false }) => {
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
    green: { bg: "bg-success", text: "text-success", glow: "shadow-green-500/50" },
    teal: { bg: "bg-teal", text: "text-teal", glow: "shadow-teal-500/50" },
    emerald: { bg: "bg-success", text: "text-success", glow: "shadow-emerald-500/50" },
    amber: { bg: "bg-orange", text: "text-orange", glow: "shadow-orange/50" },
    orange: { bg: "bg-orange", text: "text-orange", glow: "shadow-orange-500/50" },
  };

  return (
    <div
      className="absolute transition-all duration-500 ease-out z-20 animate-pulse"
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
        transform: "translateX(-50%)",
      }}
    >
      <div className="relative">
        <div
          className={`w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent ${colors[color].bg} ${isFound ? 'animate-bounce' : ''} ${isBoundary ? 'animate-ping' : ''}`}
          style={{ 
            borderBottomColor: color === "green" ? "#10b981" : 
                             color === "teal" ? "#14b8a6" : 
                             color === "emerald" ? "#10b981" :
                             color === "orange" ? "#f97316" : "#f59e0b"
          }}
        />
        {isFound && (
          <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-warning animate-spin" />
        )}
      </div>
      <div
        className={`text-xs font-bold mt-1 text-center px-2 py-1 rounded-full bg-theme-secondary/90 backdrop-blur-sm border ${colors[color].text} border-current ${colors[color].glow} shadow-lg`}
      >
        {label}
        {isFound && " 🎉"}
      </div>
    </div>
  );
};

// Main Exponential Search Component
const ExponentialSearch = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [arrayInput, setArrayInput] = useState("2, 3, 4, 10, 15, 18, 23, 35, 42, 55, 68, 79, 81, 88, 95");
  const [targetInput, setTargetInput] = useState("55");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [searchStats, setSearchStats] = useState({ comparisons: 0, checks: 0, phase: "exponential" });
  const visualizerRef = useRef(null);

  const generateHistory = useCallback(() => {
    const localArray = arrayInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "")
      .map(Number);
    const localTarget = parseInt(targetInput, 10);

    if (localArray.some(isNaN) || isNaN(localTarget)) {
      alert("Please enter valid numbers separated by commas for the array and a valid target number.");
      return;
    }

    if (localArray.length === 0) {
      alert("Array cannot be empty. Please enter some numbers.");
      return;
    }

    // Check if array is sorted
    for (let i = 1; i < localArray.length; i++) {
      if (localArray[i] < localArray[i - 1]) {
        alert("Array must be sorted in ascending order for exponential search to work correctly.");
        return;
      }
    }

    const newHistory = [];
    let stepCount = 0;
    let foundIndex = -1;
    let comparisons = 0;
    let checks = 0;
    let phase = "exponential";
    let boundStart = 0;
    let boundEnd = localArray.length - 1;
    let currentRange = [0, 0];
    let currentIndex = -1;
    let exponentialIndex = 1;

    const addState = (explanation = "", line = null, extraProps = {}) => {
      newHistory.push({
        array: [...localArray],
        currentIndex,
        target: localTarget,
        foundIndex,
        step: stepCount++,
        explanation,
        line,
        comparisons,
        checks,
        phase,
        boundStart,
        boundEnd,
        currentRange: [...currentRange],
        exponentialIndex,
        ...extraProps,
      });
    };

    // Initial setup
    addState("Starting Exponential Search Algorithm", 1);
    addState(`Target value: ${localTarget} in sorted array of ${localArray.length} elements`, 2);
    addState("Phase 1: Exponential Range Finding - Doubling index to find search range", 3);

    // Check first element
    checks++;
    currentIndex = 0;
    if (localArray[0] === localTarget) {
      foundIndex = 0;
      addState(`Target found at first element! Index: 0`, 4, { isMatch: true });
    } else {
      addState(`First element (${localArray[0]}) ≠ ${localTarget}. Starting exponential search...`, 4);

      // Exponential phase - find range
      let i = 1;
      while (i < localArray.length && localArray[i] <= localTarget) {
        currentIndex = i;
        checks++;
        comparisons++;
        boundStart = Math.floor(i / 2);
        currentRange = [boundStart, Math.min(i, localArray.length - 1)];
        exponentialIndex = i;
        
        addState(`Exponential: Checking index ${i}, value ${localArray[i]}`, 5);
        addState(`Current range: [${boundStart}, ${Math.min(i, localArray.length - 1)}]`, 6);
        
        if (localArray[i] === localTarget) {
          foundIndex = i;
          addState(`Target found during exponential phase at index ${i}`, 7, { isMatch: true });
          break;
        }
        
        addState(`Doubling search range from ${i} to ${i * 2}`, 8);
        i *= 2;
      }

      // If not found in exponential phase, set bounds for binary search
      if (foundIndex === -1) {
        boundStart = Math.floor(i / 2);
        boundEnd = Math.min(i, localArray.length - 1);
        currentRange = [boundStart, boundEnd];
        currentIndex = -1;
        phase = "binary";
        
        addState(`Range identified: [${boundStart}, ${boundEnd}]`, 9);
        addState(`Switching to Binary Search phase within the identified range`, 10);

        // Binary Search Phase
        let left = boundStart;
        let right = boundEnd;
        let mid = -1;

        addState(`Starting binary search between indices ${left} and ${right}`, 11);

        while (left <= right) {
          mid = Math.floor((left + right) / 2);
          currentIndex = mid;
          currentRange = [left, right];
          checks++;
          comparisons++;
          
          addState(`Binary: Checking middle index ${mid}, value ${localArray[mid]}`, 12);
          addState(`Search window: [${left}, ${right}]`, 13);

          if (localArray[mid] === localTarget) {
            foundIndex = mid;
            addState(`Target found at index ${mid} during binary search!`, 14, { isMatch: true });
            break;
          } else if (localArray[mid] < localTarget) {
            left = mid + 1;
            addState(`Target is greater, searching right half: [${mid + 1}, ${right}]`, 15);
          } else {
            right = mid - 1;
            addState(`Target is smaller, searching left half: [${left}, ${mid - 1}]`, 16);
          }
        }
      }
    }

    // Final state
    if (foundIndex === -1) {
      addState(`Target ${localTarget} not found in the array after ${checks} checks`, 17);
    } else {
      addState(`SEARCH COMPLETE! Target ${localTarget} found at index ${foundIndex} (${checks} checks)`, 18, { isComplete: true });
    }

    setHistory(newHistory);
    setCurrentStep(0);
    setIsLoaded(true);
    setSearchStats({ comparisons, checks, phase });
  }, [arrayInput, targetInput]);

  const resetVisualization = () => {
    setHistory([]);
    setCurrentStep(-1);
    setIsLoaded(false);
    setIsPlaying(false);
    setSearchStats({ comparisons: 0, checks: 0, phase: "exponential" });
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

  const playAnimation = () => {
    if (currentStep >= history.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
  };

  const pauseAnimation = () => {
    setIsPlaying(false);
  };

  const goToStart = useCallback(() => {
    setCurrentStep(0);
  }, []);

  const goToEnd = useCallback(() => {
    setCurrentStep(history.length - 1);
  }, [history.length]);

  const generateRandomArray = () => {
    const length = Math.floor(Math.random() * 4) + 4;
    const start = Math.floor(Math.random() * 20);
    const array = Array.from({ length }, (_, i) => start + i * 3 + Math.floor(Math.random() * 3));
    
    // 80% chance target is in array, 20% chance it's not
    const targetInArray = Math.random() > 0.2;
    const target = targetInArray 
      ? array[Math.floor(Math.random() * array.length)]
      : Math.floor(Math.random() * 90) + 100; // Number 100-189 (likely not in array)
    
    setArrayInput(array.join(', '));
    setTargetInput(target.toString());
    resetVisualization();
  };

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

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isLoaded) return;
      
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          stepBackward();
          break;
        case "ArrowRight":
          e.preventDefault();
          stepForward();
          break;
        case " ":
          e.preventDefault();
          setIsPlaying(prev => !prev);
          break;
        case "Home":
          e.preventDefault();
          goToStart();
          break;
        case "End":
          e.preventDefault();
          goToEnd();
          break;
        case "r":
        case "R":
          if (e.ctrlKey) {
            e.preventDefault();
            resetVisualization();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoaded, isPlaying, stepBackward, stepForward, goToStart, goToEnd]);

  const state = history[currentStep] || {};
  const {
    array = [],
    currentIndex = -1,
    target = 0,
    foundIndex = -1,
    line,
    explanation = "",
    comparisons = 0,
    checks = 0,
    phase = "exponential",
    boundStart = 0,
    boundEnd = 0,
    currentRange = [0, 0],
    exponentialIndex = 1,
    isMatch = false,
    isComplete = false,
  } = state;

  const CodeLine = ({ lineNum, content, isActive = false, isHighlighted = false }) => (
    <div
      className={`block rounded-lg transition-all duration-300 border-l-4 ${
        isActive
          ? "bg-success-light border-success shadow-lg shadow-green-500/20 scale-[1.02]"
          : isHighlighted
          ? "bg-teal/10 border-teal/50"
          : "border-transparent hover:bg-theme-elevated/30"
      }`}
    >
      <span className="text-theme-muted select-none inline-block w-8 text-right mr-3">
        {lineNum}
      </span>
      <span className={`font-mono ${isActive ? "text-success font-bold" : isHighlighted ? "text-teal300" : "text-theme-secondary"}`}>
        {content}
      </span>
    </div>
  );

  const exponentialSearchCode = [
    { line: 1, content: "#include <vector>" },
    { line: 2, content: "#include <algorithm>" },
    { line: 3, content: "" },
    { line: 4, content: "int exponentialSearch(std::vector<int>& arr, int target) {" },
    { line: 5, content: "    if (arr[0] == target) return 0;" },
    { line: 6, content: "    " },
    { line: 7, content: "    // Exponential range finding" },
    { line: 8, content: "    int i = 1;" },
    { line: 9, content: "    while (i < arr.size() && arr[i] <= target) {" },
    { line: 10, content: "        if (arr[i] == target) return i;" },
    { line: 11, content: "        i *= 2; // Double the range" },
    { line: 12, content: "    }" },
    { line: 13, content: "    " },
    { line: 14, content: "    // Binary search in found range" },
    { line: 15, content: "    int left = i / 2;" },
    { line: 16, content: "    int right = std::min(i, (int)arr.size() - 1);" },
    { line: 17, content: "    while (left <= right) {" },
    { line: 18, content: "        int mid = (left + right) / 2;" },
    { line: 19, content: "        if (arr[mid] == target) return mid;" },
    { line: 20, content: "        else if (arr[mid] < target) left = mid + 1;" },
    { line: 21, content: "        else right = mid - 1;" },
    { line: 22, content: "    }" },
    { line: 23, content: "    " },
    { line: 24, content: "    return -1; // Not found" },
    { line: 25, content: "}" },
];

  const getCellColor = (index) => {
    const [rangeStart, rangeEnd] = currentRange;
    const isInCurrentRange = index >= rangeStart && index <= rangeEnd;
    const isBoundary = index === boundStart || index === boundEnd;
    const isTargetFound = index === foundIndex;
    const isCurrentIndex = index === currentIndex;
    const isExponentialIndex = index === exponentialIndex;

    if (isTargetFound) {
      return "bg-gradient-to-br from-success500 to-success-hover text-theme-primary border-2 border-success shadow-lg shadow-green-500/50 scale-110 z-10 animate-pulse";
    }

    if (isCurrentIndex) {
      if (phase === "exponential") {
        return "bg-gradient-to-br from-teal500 to-teal600 text-theme-primary border-2 border-teal shadow-lg shadow-teal-500/50 scale-110";
      } else {
        return "bg-gradient-to-br from-success to-success600 text-theme-primary border-2 border-success400 shadow-lg shadow-emerald-500/50 scale-110";
      }
    }

    if (isExponentialIndex && phase === "exponential") {
      return "bg-gradient-to-br from-orange500 to-orange600 text-theme-primary border-2 border-orange shadow-lg shadow-orange-500/50 scale-105";
    }

    if (isInCurrentRange) {
      if (phase === "exponential") {
        return "bg-gradient-to-br from-teal500/80 to-teal600/80 text-theme-primary border-2 border-teal/60 shadow-lg shadow-teal-500/30";
      } else {
        return "bg-gradient-to-br from-success/80 to-success600/80 text-theme-primary border-2 border-success400/60 shadow-lg shadow-emerald-500/30";
      }
    }

    if (isBoundary) {
      return "bg-gradient-to-br from-orange/80 to-warning-hover/80 text-theme-primary border-2 border-orange/60 shadow-lg shadow-amber-500/30";
    }

    return "bg-gradient-to-br from-theme-elevated to-gray-800 border-2 border-theme-primary text-theme-secondary hover:bg-theme-elevated/70 transition-colors";
  };

  const getPointerColor = () => {
    if (foundIndex !== -1 && currentIndex === foundIndex) return "green";
    if (phase === "exponential") return "teal";
    if (phase === "binary") return "emerald";
    return "amber";
  };

  const getPointerLabel = () => {
    if (foundIndex !== -1 && currentIndex === foundIndex) return "Found!";
    if (phase === "exponential") return "Exponential";
    if (phase === "binary") return "Binary Search";
    return "Checking";
  };

  const progressPercentage = history.length > 0 ? ((currentStep + 1) / history.length) * 100 : 0;

  return (
    <div
      ref={visualizerRef}
      tabIndex={0}
      className="p-4 max-w-7xl mx-auto focus:outline-none min-h-screen"
    >
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-success/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-teal/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-success/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <header className="text-center mb-8 relative z-10">
        <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-success400 via-emerald-400 to-teal400 mb-4">
          Exponential Search
        </h1>
        
        <p className="text-xl text-theme-secondary max-w-3xl mx-auto leading-relaxed">
          Find range exponentially, then search with binary efficiency.{" "}
          <span className="text-success font-semibold">Perfect for unbounded arrays.</span>
        </p>

        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-success-light rounded-full border border-success/30">
            <MousePointer className="h-4 w-4 text-success" />
            <span className="text-success text-sm font-medium">O(log n) Time</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-teal/10 rounded-full border border-teal/30">
            <Cpu className="h-4 w-4 text-teal" />
            <span className="text-teal300 text-sm font-medium">O(1) Space</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-success/10 rounded-full border border-success500/30">
            <FastForward className="h-4 w-4 text-success" />
            <span className="text-success300 text-sm font-medium">Two-Phase Search</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-success-light rounded-full border border-success/30">
            <Infinity className="h-4 w-4 text-success" />
            <span className="text-success text-sm font-medium">Unbounded Arrays</span>
          </div>
        </div>
      </header>

      {/* Enhanced Controls Section */}
      <div className="bg-theme-tertiary/70 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-theme-primary/50 mb-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-grow w-full">
            <div className="flex-1">
              <label className="block text-theme-tertiary text-sm font-medium mb-2">
                <Grid className="inline w-4 h-4 mr-2" />
                Sorted Array Elements
              </label>
              <input
                type="text"
                value={arrayInput}
                onChange={(e) => setArrayInput(e.target.value)}
                disabled={isLoaded}
                placeholder="Enter sorted numbers separated by commas..."
                className="w-full bg-theme-secondary/80 border border-theme-primary rounded-xl p-4 text-theme-secondary placeholder-theme-muted focus:ring-2 focus:ring-success focus:border-transparent transition-all disabled:opacity-50 font-mono"
              />
            </div>
            <div className="sm:w-48">
              <label className="block text-theme-tertiary text-sm font-medium mb-2">
                <Target className="inline w-4 h-4 mr-2" />
                Target Value
              </label>
              <input
                type="number"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                disabled={isLoaded}
                className="w-full bg-theme-secondary/80 border border-theme-primary rounded-xl p-4 text-theme-secondary focus:ring-2 focus:ring-success focus:border-transparent transition-all disabled:opacity-50 font-mono text-center"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {!isLoaded ? (
              <>
                <button
                  onClick={generateHistory}
                  className="bg-gradient-to-r from-success500 to-success-hover hover:from-success600 hover:to-success-hover text-theme-primary font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-success/25 cursor-pointer flex items-center gap-3"
                >
                  <Zap className="h-5 w-5" />
                  Start Visualization
                </button>
                <button
                  onClick={generateRandomArray}
                  className="bg-gradient-to-r from-teal500 to-teal600 hover:from-teal600 hover:to-teal700 text-theme-primary font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-teal-500/25 cursor-pointer flex items-center gap-2"
                >
                  <TrendingUp className="h-5 w-5" />
                  Random
                </button>
              </>
            ) : (
              <>
                <div className="flex gap-2">
                  <button
                    onClick={goToStart}
                    disabled={currentStep <= 0}
                    className="bg-theme-elevated hover:bg-theme-elevated p-3 rounded-xl disabled:opacity-50 transition-all duration-300 cursor-pointer tooltip"
                    title="Go to Start (Home)"
                  >
                    <SkipBack className="h-5 w-5" />
                  </button>
                  <button
                    onClick={stepBackward}
                    disabled={currentStep <= 0}
                    className="bg-theme-elevated hover:bg-theme-elevated p-3 rounded-xl disabled:opacity-50 transition-all duration-300 cursor-pointer"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {!isPlaying ? (
                    <button
                      onClick={playAnimation}
                      disabled={currentStep >= history.length - 1}
                      className="bg-success hover:bg-success-hover p-3 rounded-xl disabled:opacity-50 transition-all duration-300 cursor-pointer"
                    >
                      <Play className="h-5 w-5" />
                    </button>
                  ) : (
                    <button
                      onClick={pauseAnimation}
                      className="bg-warning hover:bg-warning-hover p-3 rounded-xl transition-all duration-300 cursor-pointer"
                    >
                      <Pause className="h-5 w-5" />
                    </button>
                  )}

                  <button
                    onClick={stepForward}
                    disabled={currentStep >= history.length - 1}
                    className="bg-theme-elevated hover:bg-theme-elevated p-3 rounded-xl disabled:opacity-50 transition-all duration-300 cursor-pointer"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <button
                    onClick={goToEnd}
                    disabled={currentStep >= history.length - 1}
                    className="bg-theme-elevated hover:bg-theme-elevated p-3 rounded-xl disabled:opacity-50 transition-all duration-300 cursor-pointer tooltip"
                    title="Go to End (End)"
                  >
                    <SkipForward className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-theme-tertiary text-sm">Speed:</label>
                    <select
                      value={speed}
                      onChange={handleSpeedChange}
                      className="bg-theme-elevated border border-theme-primary rounded-lg px-3 py-2 text-theme-primary text-sm cursor-pointer focus:ring-2 focus:ring-success"
                    >
                      <option value={2000}>Slow</option>
                      <option value={1000}>Medium</option>
                      <option value={500}>Fast</option>
                      <option value={250}>Very Fast</option>
                    </select>
                  </div>

                  <div className="font-mono px-4 py-2 bg-theme-secondary border border-theme-primary rounded-lg text-center min-w-20">
                    <div className="text-success font-bold">{currentStep + 1}</div>
                    <div className="text-theme-tertiary text-xs">of {history.length}</div>
                  </div>
                </div>

                <button
                  onClick={resetVisualization}
                  className="bg-gradient-to-r from-danger500 to-pink600 hover:from-danger600 hover:to-pink700 font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-danger/25 cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {isLoaded && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-theme-tertiary mb-2">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-theme-elevated rounded-full h-2">
              <div
                className="bg-gradient-to-r from-success500 to-success500 h-2 rounded-full transition-all duration-500 shadow-lg shadow-success/25"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {isLoaded ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 relative z-10">
          {/* Code Panel */}
          <div className="xl:col-span-1 bg-theme-tertiary/70 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-theme-primary/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-2xl text-success flex items-center gap-3">
                <Code className="h-6 w-6" />
                Algorithm Code
              </h3>
              <div className="text-sm text-theme-tertiary font-mono bg-theme-secondary/50 px-3 py-1 rounded-full">
                C++
              </div>
            </div>
            
            <div className="bg-theme-secondary/50 rounded-xl p-4 border border-theme-primary/50">
              <div className="overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                <pre className="text-sm leading-relaxed">
                  <code className="font-mono block space-y-1">
                    {exponentialSearchCode.map((codeLine) => (
                      <CodeLine 
                        key={codeLine.line} 
                        lineNum={codeLine.line} 
                        content={codeLine.content}
                        isActive={line === codeLine.line}
                        isHighlighted={[5, 6, 7, 8, 14, 15, 16, 17, 18].includes(codeLine.line)}
                      />
                    ))}
                  </code>
                </pre>
              </div>
            </div>

            {/* Complexity Cards */}
            <div className="grid grid-cols-1 gap-4 mt-6">
              <div className="bg-gradient-to-br from-success900/40 to-success900/40 backdrop-blur-sm p-4 rounded-xl border border-success700/50">
                <h3 className="font-bold text-lg text-success mb-2 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Time Complexity
                </h3>
                <div className="text-center">
                  <span className="font-mono text-2xl font-bold text-success">
                    O(log n)
                  </span>
                </div>
                <div className="text-xs text-theme-tertiary text-center mt-1">
                  Exponential growth + Binary search
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal900/40 to-teal900/40 backdrop-blur-sm p-4 rounded-xl border border-teal700/50">
                <h3 className="font-bold text-lg text-teal300 mb-2 flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  Space Complexity
                </h3>
                <div className="font-mono text-2xl font-bold text-center text-teal300">
                  O(1)
                </div>
                <div className="text-xs text-theme-tertiary text-center mt-1">
                  Constant extra space
                </div>
              </div>

              <div className="bg-gradient-to-br from-success900/40 to-success900/40 backdrop-blur-sm p-4 rounded-xl border border-success700/50">
                <h3 className="font-bold text-lg text-success300 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Result
                </h3>
                <div className="font-mono text-2xl font-bold text-center text-success">
                  {foundIndex !== -1 ? foundIndex : "Not Found"}
                </div>
                <div className="text-xs text-theme-tertiary text-center mt-1">
                  {foundIndex !== -1 ? `Found at index ${foundIndex}` : "Target not in array"}
                </div>
              </div>
            </div>
          </div>

          {/* Visualization Panels */}
          <div className="xl:col-span-2 space-y-8">
            {/* Array Visualization */}
            <div className="bg-theme-tertiary/70 backdrop-blur-xl p-8 rounded-2xl border border-theme-primary/50 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-2xl text-theme-secondary flex items-center gap-3">
                  <Grid className="h-6 w-6 text-success" />
                  Array Visualization
                </h3>
                <div className="text-sm text-theme-tertiary font-mono bg-theme-secondary/50 px-3 py-1 rounded-full">
                  {array.length} elements
                </div>
              </div>
              
              <div className="flex flex-col items-center space-y-8">
                {/* Target and Phase Display */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
                  <div className="bg-gradient-to-br from-success900/40 to-success900/40 backdrop-blur-sm p-5 rounded-xl border border-success700/50">
                    <h4 className="text-sm text-theme-tertiary mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Searching For
                    </h4>
                    <div className="font-mono text-2xl font-bold text-center text-success">
                      {target}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-teal900/40 to-teal900/40 backdrop-blur-sm p-5 rounded-xl border border-teal700/50">
                    <h4 className="text-sm text-theme-tertiary mb-2 flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Current Phase
                    </h4>
                    <div className="font-mono text-lg font-bold text-center text-teal capitalize">
                      {phase} Search
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-success900/40 to-success900/40 backdrop-blur-sm p-5 rounded-xl border border-success700/50">
                    <h4 className="text-sm text-theme-tertiary mb-2 flex items-center gap-2">
                      <Gauge className="h-4 w-4" />
                      Status
                    </h4>
                    <div className="font-mono text-lg font-bold text-center text-success">
                      {foundIndex !== -1 ? "Found!" : "Searching..."}
                    </div>
                  </div>
                </div>

                {/* Array Visualization */}
                <div className="w-full">
                  <div className="relative bg-theme-secondary/50 rounded-2xl p-6 border border-theme-primary/50" id="main-array-container">
                    {/* Column headers */}
                    <div className="flex gap-3 mb-4 justify-center">
                      {array.map((_, index) => (
                        <div key={index} className="w-16 text-center">
                          <div className="text-xs text-theme-muted font-mono mb-2">Index</div>
                          <div className="text-sm font-bold text-theme-tertiary bg-theme-tertiary/50 rounded-lg py-1 px-2 border border-theme-primary/50">
                            {index}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Array elements */}
                    <div className="flex gap-3 justify-center relative">
                      {array.map((num, index) => (
                        <div
                          key={index}
                          id={`main-array-container-element-${index}`}
                          className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center font-bold text-lg transition-all duration-500 transform ${getCellColor(index)} relative`}
                        >
                          {num}
                          {index === currentIndex && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-warning rounded-full flex items-center justify-center text-xs font-bold text-theme-primary animate-ping">
                              !
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Range Highlight */}
                    {currentRange[1] > currentRange[0] && (
                      <div
                        className="absolute h-2 bg-gradient-to-r from-teal500/40 to-success500/40 rounded-full transition-all duration-500 -bottom-4 shadow-lg"
                        style={{
                          left: `${(currentRange[0] / array.length) * 100}%`,
                          width: `${((currentRange[1] - currentRange[0] + 1) / array.length) * 100}%`,
                        }}
                      />
                    )}

                    {/* Pointer */}
                    {currentIndex >= 0 && (
                      <Pointer
                        index={currentIndex}
                        containerId="main-array-container"
                        color={getPointerColor()}
                        label={getPointerLabel()}
                        isFound={foundIndex !== -1 && currentIndex === foundIndex}
                        isBoundary={currentIndex === boundStart || currentIndex === boundEnd}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats and Explanation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Current State */}
              <div className="bg-gradient-to-br from-orange900/40 to-warning800/40 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-orange700/50">
                <h3 className="font-bold text-xl text-orange300 mb-4 flex items-center gap-3">
                  <Calculator className="h-5 w-5" />
                  Algorithm State
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-orange700/30">
                    <span className="text-theme-secondary">Current Phase</span>
                    <span className="font-mono font-bold text-success capitalize">{phase}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-orange700/30">
                    <span className="text-theme-secondary">Search Range</span>
                    <span className="font-mono font-bold text-teal">
                      [{currentRange[0]}, {currentRange[1]}]
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-orange700/30">
                    <span className="text-theme-secondary">Range Size</span>
                    <span className="font-mono font-bold text-success">
                      {currentRange[1] - currentRange[0] + 1}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-theme-secondary">Elements Checked</span>
                    <span className="font-mono font-bold text-teal">
                      {checks}/{array.length}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Step Explanation */}
              <div className="bg-gradient-to-br from-teal900/40 to-teal900/40 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-teal700/50">
                <h3 className="font-bold text-xl text-teal300 mb-4 flex items-center gap-3">
                  <BarChart3 className="h-5 w-5" />
                  Step Explanation
                </h3>
                <div className="text-theme-secondary text-sm leading-relaxed h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 p-2">
                  {explanation.split('\n').map((line, i) => (
                    <div key={i} className="mb-2 last:mb-0">
                      {line}
                    </div>
                  ))}
                </div>
                {isComplete && (
                  <div className="mt-4 p-3 bg-success-light rounded-lg border border-success/30">
                    <div className="text-success text-sm font-semibold flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Search Completed Successfully!
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Complexity Analysis */}
            <div className="bg-theme-tertiary/70 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-theme-primary/50">
              <h3 className="font-bold text-2xl text-success mb-6 flex items-center gap-3">
                <Binary className="h-6 w-6" />
                Algorithm Analysis
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h4 className="font-semibold text-success text-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    When to Use Exponential Search
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-theme-secondary/50 p-4 rounded-xl border border-theme-primary hover:border-success/30 transition-all">
                      <strong className="text-teal300 block mb-2 text-sm">Unbounded/Infinite Arrays</strong>
                      <p className="text-theme-tertiary text-sm leading-relaxed">
                        Perfect for searching in arrays where the size is unknown or infinite.
                      </p>
                    </div>
                    <div className="bg-theme-secondary/50 p-4 rounded-xl border border-theme-primary hover:border-success/30 transition-all">
                      <strong className="text-teal300 block mb-2 text-sm">Large Sorted Arrays</strong>
                      <p className="text-theme-tertiary text-sm leading-relaxed">
                        More efficient than pure binary search when you don't know the bounds.
                      </p>
                    </div>
                    <div className="bg-theme-secondary/50 p-4 rounded-xl border border-theme-primary hover:border-success/30 transition-all">
                      <strong className="text-teal300 block mb-2 text-sm">Better than Linear Search</strong>
                      <p className="text-theme-tertiary text-sm leading-relaxed">
                        Much faster than linear search for large sorted datasets with O(log n) complexity.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <h4 className="font-semibold text-success text-lg flex items-center gap-2">
                    <Infinity className="h-5 w-5" />
                    How It Works
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-theme-secondary/50 p-4 rounded-xl border border-theme-primary hover:border-teal/30 transition-all">
                      <strong className="text-teal300 block mb-2 text-sm">Phase 1: Exponential Range Finding</strong>
                      <p className="text-theme-tertiary text-sm leading-relaxed">
                        Start from index 1, double the index until we find a range that contains the target.
                      </p>
                    </div>
                    <div className="bg-theme-secondary/50 p-4 rounded-xl border border-theme-primary hover:border-teal/30 transition-all">
                      <strong className="text-teal300 block mb-2 text-sm">Phase 2: Binary Search</strong>
                      <p className="text-theme-tertiary text-sm leading-relaxed">
                        Perform binary search within the identified range to find the exact position.
                      </p>
                    </div>
                    <div className="bg-theme-secondary/50 p-4 rounded-xl border border-theme-primary hover:border-teal/30 transition-all">
                      <strong className="text-teal300 block mb-2 text-sm">Time Complexity: O(log n)</strong>
                      <p className="text-theme-tertiary text-sm leading-relaxed">
                        Combines O(log i) for range finding and O(log n) for binary search.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-theme-tertiary/50 rounded-2xl border border-theme-primary/50 relative z-10">
          <div className="max-w-2xl mx-auto">
            <div className="text-theme-tertiary text-lg mb-6">
              🚀 Ready to visualize Exponential Search?
            </div>
            <div className="text-theme-muted text-sm mb-8 leading-relaxed">
              Enter a sorted array of numbers and a target value to see how exponential search works in two phases.
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-xs mb-8">
              <div className="bg-success-light text-success px-4 py-2 rounded-full border border-success/20 flex items-center gap-2">
                <MousePointer className="h-3 w-3" />
                Click "Start Visualization" to begin
              </div>
              <div className="bg-teal/10 text-teal300 px-4 py-2 rounded-full border border-teal/20 flex items-center gap-2">
                <TrendingUp className="h-3 w-3" />
                Use "Random" for quick examples
              </div>
              <div className="bg-success/10 text-success300 px-4 py-2 rounded-full border border-success500/20 flex items-center gap-2">
                <FastForward className="h-3 w-3" />
                Two-phase algorithm
              </div>
            </div>
            <div className="bg-theme-secondary/50 rounded-xl p-6 border border-theme-primary/30 text-left">
              <div className="text-success font-mono text-sm mb-2">💡 Example Usage:</div>
              <div className="text-theme-tertiary text-sm space-y-1">
                <div>Array: <span className="text-success font-mono">2, 3, 4, 10, 15, 18, 23, 35, 42, 55, 68, 79, 81, 88, 95</span></div>
                <div>Target: <span className="text-teal300 font-mono">55</span></div>
                <div className="text-theme-muted text-xs mt-2">→ Finds range [8, 15] exponentially, then uses binary search to find index 9</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExponentialSearch;