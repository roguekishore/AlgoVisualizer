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
} from "lucide-react";

// Enhanced Pointer Component with better animations
const Pointer = ({ index, containerId, color, label, isFound = false }) => {
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
    red: { bg: "bg-danger", text: "text-danger", glow: "shadow-red-500/50" },
    green: { bg: "bg-success", text: "text-success", glow: "shadow-green-500/50" },
    blue: { bg: "bg-accent-primary", text: "text-accent-primary", glow: "shadow-blue-500/50" },
    amber: { bg: "bg-orange", text: "text-orange", glow: "shadow-orange/50" },
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
          className={`w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent ${colors[color].bg} ${isFound ? 'animate-bounce' : ''}`}
          style={{ 
            borderBottomColor: color === "red" ? "#ef4444" : 
                             color === "green" ? "#10b981" : 
                             color === "blue" ? "#3b82f6" : "#f59e0b"
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

// Main Component
const LinearSearch = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [arrayInput, setArrayInput] = useState("10, 23, 45, 70, 11, 15, 89, 34, 92, 56");
  const [targetInput, setTargetInput] = useState("70");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [searchStats, setSearchStats] = useState({ comparisons: 0, checks: 0 });
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

    const newHistory = [];
    let stepCount = 0;
    let foundIndex = -1;
    let comparisons = 0;
    let checks = 0;

    const addState = (currentIndex = -1, explanation = "", line = null, extraProps = {}) => {
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
        ...extraProps,
      });
    };

    // Initial setup
    addState(-1, "Starting Linear Search Algorithm", 1);
    addState(-1, `Target value: ${localTarget}`, 2);
    addState(-1, `Array size: ${localArray.length} elements`, 3);
    addState(-1, "Beginning sequential scan from left to right...", 4);

    // Main algorithm loop
    for (let i = 0; i < localArray.length; i++) {
      checks++;
      addState(i, `Checking element at index ${i}: ${localArray[i]}`, 5);
      
      comparisons++;
      addState(i, `Comparing ${localArray[i]} with target ${localTarget}`, 6);
      
      if (localArray[i] === localTarget) {
        foundIndex = i;
        addState(i, `SUCCESS! Found target ${localTarget} at index ${i}`, 7, { isMatch: true });
        break;
      } else {
        addState(i, `${localArray[i]} ≠ ${localTarget}. Continuing search...`, 8);
      }
      
      // Show moving to next element
      if (i < localArray.length - 1) {
        addState(i, `Moving to next index: ${i + 1}`, 4);
      }
    }

    // Final state
    if (foundIndex === -1) {
      addState(localArray.length - 1, `Target ${localTarget} not found in the array after ${checks} checks`, 9);
    } else {
      addState(foundIndex, `SEARCH COMPLETE! Target ${localTarget} found at index ${foundIndex} (${checks} checks)`, 10, { isComplete: true });
    }

    setHistory(newHistory);
    setCurrentStep(0);
    setIsLoaded(true);
    setSearchStats({ comparisons, checks });
  }, [arrayInput, targetInput]);

  const resetVisualization = () => {
    setHistory([]);
    setCurrentStep(-1);
    setIsLoaded(false);
    setIsPlaying(false);
    setSearchStats({ comparisons: 0, checks: 0 });
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
    const length = Math.floor(Math.random() * 4) + 5; // 5-8 elements
    const array = Array.from({ length }, () => Math.floor(Math.random() * 90) + 10); // 10-99
    
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
    isMatch = false,
    isComplete = false,
  } = state;

  const CodeLine = ({ lineNum, content, isActive = false, isHighlighted = false }) => (
    <div
      className={`block rounded-lg transition-all duration-300 border-l-4 ${
        isActive
          ? "bg-success-light border-success shadow-lg shadow-green-500/20 scale-[1.02]"
          : isHighlighted
          ? "bg-accent-primary-light border-accent-primary/50"
          : "border-transparent hover:bg-theme-elevated/30"
      }`}
    >
      <span className="text-theme-muted select-none inline-block w-8 text-right mr-3">
        {lineNum}
      </span>
      <span className={`font-mono ${isActive ? "text-success font-bold" : isHighlighted ? "text-accent-primary" : "text-theme-secondary"}`}>
        {content}
      </span>
    </div>
  );

  const linearSearchCode = [
    { line: 1, content: "int linearSearch(vector<int>& arr, int target) {" },
    { line: 2, content: "  // Search for target in array" },
    { line: 3, content: "  for (int i = 0; i < arr.size(); i++) {" },
    { line: 4, content: "    // Check each element" },
    { line: 5, content: "    if (arr[i] == target) {" },
    { line: 6, content: "      return i; // Found!" },
    { line: 7, content: "    }" },
    { line: 8, content: "  }" },
    { line: 9, content: "  return -1; // Not found" },
    { line: 10, content: "}" },
  ];

  const getCellColor = (index) => {
    if (index === currentIndex) {
      if (array[index] === target) {
        return "bg-gradient-to-br from-success500 to-success-hover text-theme-primary border-success shadow-lg shadow-green-500/50 scale-110 animate-pulse";
      }
      return "bg-gradient-to-br from-accent-primary500 to-teal600 text-theme-primary border-accent-primary shadow-lg shadow-blue-500/50 scale-110";
    }
    
    if (index < currentIndex) {
      if (array[index] === target && index === foundIndex) {
        return "bg-gradient-to-br from-success500/80 to-success-hover/80 text-theme-primary border-success/60 shadow-lg";
      }
      return "bg-theme-elevated border-theme-muted shadow-inner";
    }
    
    return "bg-theme-elevated/60 border-theme-primary hover:bg-theme-elevated/70 transition-colors";
  };

  const getCellAnimation = (index) => {
    if (index === currentIndex) {
      return "animate-pulse";
    }
    return "";
  };

  const progressPercentage = array.length > 0 ? ((currentIndex + 1) / array.length) * 100 : 0;

  return (
    <div
      ref={visualizerRef}
      tabIndex={0}
      className="p-4 max-w-7xl mx-auto focus:outline-none min-h-screen"
    >
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-success/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-accent-primary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <header className="text-center mb-8 relative z-10">
        {/* <div className="inline-flex items-center gap-3 mb-4 bg-theme-tertiary/50 backdrop-blur-sm px-6 py-3 rounded-2xl border border-theme-primary/50">
          <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
          <span className="text-success text-sm font-mono">Live Visualization</span>
        </div> */}
        
        <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-success400 via-emerald-400 to-teal400 mb-4">
          Linear Search
        </h1>
        
        <p className="text-xl text-theme-secondary max-w-3xl mx-auto leading-relaxed">
          Sequentially check each element until the target is found.{" "}
          <span className="text-success font-semibold">Simple, intuitive, and fundamental.</span>
        </p>

        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-success-light rounded-full border border-success/30">
            <MousePointer className="h-4 w-4 text-success" />
            <span className="text-success text-sm font-medium">O(n) Time</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-accent-primary-light rounded-full border border-accent-primary/30">
            <Cpu className="h-4 w-4 text-accent-primary" />
            <span className="text-accent-primary text-sm font-medium">O(1) Space</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-purplelight rounded-full border border-purple/30">
            <List className="h-4 w-4 text-purple" />
            <span className="text-purple text-sm font-medium">Sequential Access</span>
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
                Array Elements
              </label>
              <input
                type="text"
                value={arrayInput}
                onChange={(e) => setArrayInput(e.target.value)}
                disabled={isLoaded}
                placeholder="Enter numbers separated by commas..."
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
                  className="bg-gradient-to-r from-purple500 to-accent-primary600 hover:from-purple600 hover:to-accent-primary700 text-theme-primary font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-purple/25 cursor-pointer flex items-center gap-2"
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
                    <SkipBack className="h-5 w-5" />
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
                    <SkipForward className="h-5 w-5" />
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
                    {linearSearchCode.map((codeLine) => (
                      <CodeLine 
                        key={codeLine.line} 
                        lineNum={codeLine.line} 
                        content={codeLine.content}
                        isActive={line === codeLine.line}
                        isHighlighted={[5, 6, 7].includes(codeLine.line)}
                      />
                    ))}
                  </code>
                </pre>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-theme-secondary/50 rounded-lg p-3 text-center border border-theme-primary/30">
                <div className="text-2xl font-bold text-accent-primary">{checks}</div>
                <div className="text-xs text-theme-tertiary">Elements Checked</div>
              </div>
              <div className="bg-theme-secondary/50 rounded-lg p-3 text-center border border-theme-primary/30">
                <div className="text-2xl font-bold text-purple">{comparisons}</div>
                <div className="text-xs text-theme-tertiary">Comparisons</div>
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
                {/* Target Display */}
                <div className="bg-gradient-to-br from-success900/40 to-success900/40 backdrop-blur-sm p-6 rounded-2xl border border-success700/50 w-full max-w-md shadow-xl">
                  <h4 className="text-lg text-theme-secondary mb-4 flex items-center gap-3">
                    <Target className="h-5 w-5 text-success" />
                    Searching For Target
                  </h4>
                  <div className="font-mono text-4xl font-bold text-center text-success bg-theme-secondary/50 py-4 rounded-xl border border-success700/30">
                    {target}
                  </div>
                </div>

                {/* Array Visualization */}
                <div className="w-full">
                  <div className="relative bg-theme-secondary/50 rounded-2xl p-6 border border-theme-primary/50" id="main-array-container">
                    {/* Column headers */}
                    <div className="flex gap-4 mb-4 justify-center">
                      {array.map((_, index) => (
                        <div key={index} className="w-20 text-center">
                          <div className="text-xs text-theme-muted font-mono mb-2">Index</div>
                          <div className="text-lg font-bold text-theme-tertiary bg-theme-tertiary/50 rounded-lg py-1 px-3 border border-theme-primary/50">
                            {index}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Array elements */}
                    <div className="flex gap-4 justify-center">
                      {array.map((num, index) => (
                        <div
                          key={index}
                          id={`main-array-container-element-${index}`}
                          className={`w-20 h-20 rounded-xl border-2 flex items-center justify-center font-bold text-xl transition-all duration-500 transform ${getCellColor(index)} ${getCellAnimation(index)} relative`}
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

                    {/* Pointer */}
                    {currentIndex >= 0 && (
                      <Pointer
                        index={currentIndex}
                        containerId="main-array-container"
                        color={array[currentIndex] === target ? "green" : "blue"}
                        label={array[currentIndex] === target ? "Found!" : "Checking"}
                        isFound={array[currentIndex] === target}
                      />
                    )}
                  </div>
                </div>

                {/* Search Status */}
                <div className="bg-gradient-to-br from-accent-primary900/40 to-teal900/40 backdrop-blur-sm rounded-2xl p-6 border border-accent-primary700/50 w-full max-w-md shadow-xl">
                  <h4 className="text-lg text-theme-secondary mb-4 flex items-center gap-3">
                    <Gauge className="h-5 w-5 text-accent-primary" />
                    Search Status
                  </h4>
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div className="space-y-2">
                      <div className="text-theme-tertiary">Current Index</div>
                      <div className="font-mono text-2xl font-bold text-accent-primary bg-theme-secondary/50 py-2 rounded-lg text-center border border-accent-primary700/30">
                        {currentIndex >= 0 ? currentIndex : "—"}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-theme-tertiary">Elements Checked</div>
                      <div className="font-mono text-2xl font-bold text-purple bg-theme-secondary/50 py-2 rounded-lg text-center border border-purple700/30">
                        {currentIndex + 1}/{array.length}
                      </div>
                    </div>
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
                  Current State
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-orange700/30">
                    <span className="text-theme-secondary">Current Element</span>
                    <span className="font-mono font-bold text-orange text-lg">
                      {currentIndex >= 0 ? array[currentIndex] : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-orange700/30">
                    <span className="text-theme-secondary">Target</span>
                    <span className="font-mono font-bold text-success text-lg">{target}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-orange700/30">
                    <span className="text-theme-secondary">Match Found</span>
                    <span className={`font-mono font-bold ${array[currentIndex] === target ? "text-success" : "text-danger"} text-lg`}>
                      {array[currentIndex] === target ? "YES" : "NO"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-theme-secondary">Search Progress</span>
                    <span className="font-mono font-bold text-accent-primary text-lg">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Step Explanation */}
              <div className="bg-gradient-to-br from-accent-primary900/40 to-teal900/40 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-accent-primary700/50">
                <h3 className="font-bold text-xl text-accent-primary mb-4 flex items-center gap-3">
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
                <Zap className="h-6 w-6" />
                Algorithm Analysis
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h4 className="font-semibold text-success text-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    When to Use Linear Search
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-theme-secondary/50 p-4 rounded-xl border border-theme-primary hover:border-success/30 transition-all">
                      <strong className="text-teal300 block mb-2 text-sm">Small Datasets</strong>
                      <p className="text-theme-tertiary text-sm leading-relaxed">
                        Ideal for arrays with fewer than 100 elements where simplicity outweighs the need for optimal performance.
                      </p>
                    </div>
                    <div className="bg-theme-secondary/50 p-4 rounded-xl border border-theme-primary hover:border-success/30 transition-all">
                      <strong className="text-teal300 block mb-2 text-sm">Unsorted Data</strong>
                      <p className="text-theme-tertiary text-sm leading-relaxed">
                        The only efficient option when data isn't sorted and cannot be preprocessed.
                      </p>
                    </div>
                    <div className="bg-theme-secondary/50 p-4 rounded-xl border border-theme-primary hover:border-success/30 transition-all">
                      <strong className="text-teal300 block mb-2 text-sm">Simple Implementation</strong>
                      <p className="text-theme-tertiary text-sm leading-relaxed">
                        Easy to understand, debug, and maintain. Perfect for learning and prototyping.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <h4 className="font-semibold text-success text-lg flex items-center gap-2">
                    <ArrowRight className="h-5 w-5" />
                    Performance Characteristics
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-theme-secondary/50 p-4 rounded-xl border border-theme-primary hover:border-accent-primary/30 transition-all">
                      <strong className="text-teal300 block mb-2 text-sm">Best Case: O(1)</strong>
                      <p className="text-theme-tertiary text-sm leading-relaxed">
                        Target is the first element - only one comparison needed. Lightning fast!
                      </p>
                    </div>
                    <div className="bg-theme-secondary/50 p-4 rounded-xl border border-theme-primary hover:border-accent-primary/30 transition-all">
                      <strong className="text-teal300 block mb-2 text-sm">Average Case: O(n/2)</strong>
                      <p className="text-theme-tertiary text-sm leading-relaxed">
                        On average, you'll search through half the array. Decent for small datasets.
                      </p>
                    </div>
                    <div className="bg-theme-secondary/50 p-4 rounded-xl border border-theme-primary hover:border-accent-primary/30 transition-all">
                      <strong className="text-teal300 block mb-2 text-sm">Worst Case: O(n)</strong>
                      <p className="text-theme-tertiary text-sm leading-relaxed">
                        Target is last element or not present - requires checking every single element.
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
              🚀 Ready to visualize Linear Search?
            </div>
            <div className="text-theme-muted text-sm mb-8 leading-relaxed">
              Enter an array of numbers and a target value to see how linear search works step by step.
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-xs mb-8">
              <div className="bg-success-light text-success px-4 py-2 rounded-full border border-success/20 flex items-center gap-2">
                <MousePointer className="h-3 w-3" />
                Click "Start Visualization" to begin
              </div>
              <div className="bg-accent-primary-light text-accent-primary px-4 py-2 rounded-full border border-accent-primary/20 flex items-center gap-2">
                <TrendingUp className="h-3 w-3" />
                Use "Random" for quick examples
              </div>
            </div>
            <div className="bg-theme-secondary/50 rounded-xl p-6 border border-theme-primary/30 text-left">
              <div className="text-success font-mono text-sm mb-2">💡 Example Usage:</div>
              <div className="text-theme-tertiary text-sm space-y-1">
                <div>Array: <span className="text-success font-mono">10, 23, 45, 70, 11, 15</span></div>
                <div>Target: <span className="text-accent-primary font-mono">70</span></div>
                <div className="text-theme-muted text-xs mt-2">→ Returns index 3 after checking 4 elements</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinearSearch;