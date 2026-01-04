import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Code,
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
  ShoppingBasket,
  Target,
  Gauge,
} from "lucide-react";
import { useModeHistorySwitch } from "../../hooks/useModeHistorySwitch";

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
        className={`text-xs font-bold mt-1 text-center ${colors[color].text} whitespace-nowrap`}
      >
        {label}
      </div>
    </div>
  );
};

const FruitsIntoBaskets = ({ navigate }) => {
    const [mode, setMode] = useState("optimal");
    const [history, setHistory] = useState([]);
    const [currentStep, setCurrentStep] = useState(-1);
    const [numsInput, setNumsInput] = useState("2,4,5,2,2,1,3,2,1,1");
    const [isLoaded, setIsLoaded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1000);
    const [windowStyle, setWindowStyle] = useState({ opacity: 0 });
    const visualizerRef = useRef(null);

    const colorMapping = {
        purple: "text-purple",
        cyan: "text-teal",
        yellow: "text-warning",
        red: "text-danger",
        "light-gray": "text-theme-tertiary",
        "": "text-theme-secondary",
    };

    const CodeLine = ({ line, content }) => (
        <div
            className={`block rounded-md transition-all duration-300 px-2 py-1 ${
                state.line === line ? "bg-accent-primary-light border-l-4 border-accent-primary shadow-lg" : "hover:bg-theme-elevated/30"
            }`}
        >
            <span className="text-theme-muted w-8 inline-block text-right pr-4 select-none">
                {line}
            </span>
            {content.map((token, index) => (
                <span key={index} className={colorMapping[token.c]}>
                    {token.t}
                </span>
            ))}
        </div>
    );

    const generateBruteForceHistory = useCallback((fruits) => {
        const newHistory = [];
        let maxLength = 0;

        const addState = (props) =>
            newHistory.push({
                nums: fruits,
                windowStart: null,
                windowEnd: null,
                maxLength,
                currentBaskets: new Set(),
                explanation: "",
                ...props,
            });

        addState({ line: 1, explanation: "Initializing brute-force approach. Max length is 0." });

        for (let i = 0; i < fruits.length; i++) {
            addState({
                line: 2,
                windowStart: i,
                explanation: `Starting a new potential subarray from outer loop index i = ${i}.`,
            });

            for (let j = i; j < fruits.length; j++) {
                const currentSubarray = fruits.slice(i, j + 1);
                const currentBaskets = new Set(currentSubarray);

                addState({
                    line: 3,
                    windowStart: i,
                    windowEnd: j,
                    currentBaskets,
                    explanation: `Inner loop j = ${j}. Checking subarray from index ${i} to ${j}. It has ${currentBaskets.size} fruit types.`,
                });

                if (currentBaskets.size <= 2) {
                    addState({
                        line: 6,
                        windowStart: i,
                        windowEnd: j,
                        currentBaskets,
                        explanation: `Subarray is valid (${currentBaskets.size} types <= 2).`,
                    });
                    maxLength = Math.max(maxLength, j - i + 1);
                    addState({
                        line: 7,
                        windowStart: i,
                        windowEnd: j,
                        currentBaskets,
                        maxLength,
                        updatedMaxLength: true,
                        explanation: `Updated max length to ${maxLength}.`,
                    });
                } else {
                    addState({
                        line: 8,
                        windowStart: i,
                        windowEnd: j,
                        currentBaskets,
                        isInvalid: true,
                        explanation: `Invalid subarray with ${currentBaskets.size} fruit types. Breaking inner loop.`,
                    });
                    break;
                }
            }
        }
        addState({
            line: 11,
            finished: true,
            maxLength,
            explanation: `Finished! The maximum number of fruits is ${maxLength}.`,
        });
        setHistory(newHistory);
        setCurrentStep(0);
        setIsLoaded(true);
    }, []);

    const generateOptimalHistory = useCallback((fruits) => {
        const newHistory = [];
        let windowStart = 0;
        let maxLength = 0;
        const fruitFrequency = new Map();

        const addState = (props) =>
            newHistory.push({
                nums: fruits,
                windowStart,
                windowEnd: null,
                maxLength,
                fruitFrequency: new Map(fruitFrequency),
                explanation: "",
                updatedMaxLength: false,
                isInvalid: false,
                removingIndex: null,
                ...props,
            });

        addState({ line: 1, explanation: "Initializing variables. Window is empty." });

        for (let windowEnd = 0; windowEnd < fruits.length; windowEnd++) {
            const rightFruit = fruits[windowEnd];
            addState({
                line: 4,
                windowEnd,
                explanation: `Processing element at windowEnd = ${windowEnd} (fruit type ${rightFruit}).`,
            });

            fruitFrequency.set(rightFruit, (fruitFrequency.get(rightFruit) || 0) + 1);
            addState({
                line: 6,
                windowEnd,
                explanation: `Added fruit ${rightFruit} to basket. Basket now has ${fruitFrequency.size} fruit types.`,
            });
            
            if (fruitFrequency.size > 2) {
                 addState({
                    line: 8,
                    windowEnd,
                    isInvalid: true,
                    explanation: `Window is invalid! More than 2 fruit types (${fruitFrequency.size}). Need to shrink from the left.`,
                });
            }

            while (fruitFrequency.size > 2) {
                const leftFruit = fruits[windowStart];
                addState({
                    line: 9,
                    windowEnd,
                    isInvalid: true,
                    removingIndex: windowStart,
                    explanation: `Shrinking window. Element at windowStart = ${windowStart} (fruit type ${leftFruit}) will be removed.`,
                });

                fruitFrequency.set(leftFruit, fruitFrequency.get(leftFruit) - 1);
                if (fruitFrequency.get(leftFruit) === 0) {
                    fruitFrequency.delete(leftFruit);
                }
                
                windowStart++;
                 addState({
                    line: 12,
                    windowEnd,
                    explanation: `Removed fruit ${leftFruit}. Window start is now at index ${windowStart}. Baskets are valid again.`,
                });
            }

            maxLength = Math.max(maxLength, windowEnd - windowStart + 1);
            addState({
                line: 15,
                windowEnd,
                maxLength,
                updatedMaxLength: true,
                explanation: `Window is valid. Current length is ${windowEnd - windowStart + 1}. Max length is ${maxLength}.`,
            });
        }

        addState({
            line: 18,
            windowEnd: fruits.length - 1,
            finished: true,
            maxLength,
            explanation: `Finished! The maximum number of fruits we can pick is ${maxLength}.`,
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
        setWindowStyle({ opacity: 0 });
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
        try {
            const fruits = numsInput.split(",").map(s => s.trim()).filter(Boolean).map(Number);
            if (fruits.some(isNaN) || fruits.length === 0) {
                alert("Invalid array input. Please use comma-separated numbers.");
                return;
            }
            
            resetVisualization();
            setTimeout(() => {
                setIsLoaded(true);
                if (mode === "brute-force") {
                    generateBruteForceHistory(fruits);
                } else {
                    generateOptimalHistory(fruits);
                }
            }, 100);
        } catch (error) {
            alert("Error loading array: " + error.message);
        }
    };

    const generateRandomArray = () => {
        const length = 10; // Fixed to 10 elements to match your example
        const array = Array(length)
            .fill()
            .map(() => Math.floor(Math.random() * 5) + 1); // Values between 1-5
        
        setNumsInput(array.join(','));
        resetVisualization();
    };

    const parseInput = useCallback(() => {
        const nums = numsInput.split(",").map(s => s.trim()).filter(Boolean).map(Number);
        if (nums.some(isNaN)) throw new Error("Invalid input");
        return { nums };
    }, [numsInput]);

    const handleModeChange = useModeHistorySwitch({
        mode, setMode, isLoaded, parseInput,
        generators: {
            "brute-force": ({ nums }) => generateBruteForceHistory(nums),
            optimal: ({ nums }) => generateOptimalHistory(nums),
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
        if (isLoaded && state.windowStart !== null && state.windowEnd !== null && state.windowStart >= 0) {
            const container = document.getElementById("array-container");
            const startEl = document.getElementById(`array-container-element-${state.windowStart}`);
            const endEl = document.getElementById(`array-container-element-${state.windowEnd}`);
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
                    backgroundColor: state.isInvalid ? 'rgba(239, 68, 68, 0.1)' : 'rgba(56, 189, 248, 0.1)',
                    border: `2px solid ${state.isInvalid ? 'rgba(239, 68, 68, 0.5)' : 'rgba(56, 189, 248, 0.5)'}`,
                    borderRadius: '12px',
                    transition: 'all 300ms ease-out',
                    opacity: 1,
                });
            }
        } else {
            setWindowStyle({ opacity: 0 });
        }
    }, [currentStep, isLoaded, state.windowStart, state.windowEnd, state.isInvalid]);

    const bruteForceCode = [
        { l: 1, c: [{ t: "maxLength = 0", c: "" }] },
        { l: 2, c: [{ t: "for (i = 0; i < n; i++)", c: "purple" }] },
        { l: 3, c: [{ t: "  for (j = i; j < n; j++)", c: "purple" }] },
        { l: 5, c: [{ t: "    baskets = new Set(subarray)", c: "cyan" }] },
        { l: 6, c: [{ t: "    if (baskets.size <= 2)", c: "purple" }] },
        { l: 7, c: [{ t: "      maxLength = max(maxLength, ...)", c: "" }] },
        { l: 8, c: [{ t: "    else break", c: "red" }] },
        { l: 11, c: [{ t: "return maxLength", c: "purple" }] },
    ];
    
    const optimalCode = [
        { l: 1, c: [{ t: "windowStart = 0, maxLength = 0", c: "" }] },
        { l: 2, c: [{ t: "fruitFrequency = new Map()", c: "cyan" }] },
        { l: 4, c: [{ t: "for (windowEnd = 0; windowEnd < n; windowEnd++)", c: "purple" }] },
        { l: 6, c: [{ t: "  fruitFrequency.add(fruits[windowEnd])", c: "" }] },
        { l: 8, c: [{ t: "  while (fruitFrequency.size > 2)", c: "purple" }] },
        { l: 9, c: [{ t: "    leftFruit = fruits[windowStart]", c: "" }] },
        { l: 10, c: [{ t: "   fruitFrequency.remove(leftFruit)", c: "" }] },
        { l: 12, c: [{ t: "   windowStart++", c: "" }] },
        { l: 13, c: [{ t: "  }", c: "light-gray" }] },
        { l: 15, c: [{ t: "  maxLength = max(maxLength, windowEnd - windowStart + 1)", c: "" }] },
        { l: 16, c: [{ t: "}", c: "light-gray" }] },
        { l: 18, c: [{ t: "return maxLength", c: "purple" }] },
    ];

    const getCellColor = (index) => {
        const isInWindow = index >= state.windowStart && index <= state.windowEnd;
        const isWindowStart = index === state.windowStart && isInWindow;
        const isWindowEnd = index === state.windowEnd && isInWindow;
        const isRemoving = index === state.removingIndex;

        if (isRemoving) {
            return "bg-gradient-to-br from-purple400 to-purple500 text-theme-primary border-purple shadow-lg shadow-purple-500/50 scale-110";
        } else if (isWindowStart) {
            return "bg-gradient-to-br from-danger400 to-danger500 text-theme-primary border-danger shadow-lg shadow-red-500/50";
        } else if (isWindowEnd) {
            return "bg-gradient-to-br from-accent-primary400 to-accent-primary500 text-theme-primary border-accent-primary shadow-lg shadow-blue-500/50";
        } else if (isInWindow) {
            return "bg-theme-elevated border-accent-primary shadow-lg";
        }
        return "bg-theme-elevated/50 border-theme-primary hover:bg-theme-elevated/50";
    };

    const currentWindowLength = state.windowEnd !== null && state.windowStart !== null ? 
        state.windowEnd - state.windowStart + 1 : 0;

    return (
        <div
            ref={visualizerRef}
            tabIndex={0}
            className="p-4 max-w-7xl mx-auto focus:outline-none min-h-screen"
        >
            <header className="text-center mb-6">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange400 to-orange400 bg-clip-text text-transparent flex items-center justify-center gap-3 flex-wrap">
                    <ShoppingBasket size={28} />
                    Fruits Into Baskets
                </h1>
                <p className="text-base md:text-lg text-theme-tertiary mt-2">
                    Find the maximum number of fruits you can pick with at most 2 types (LeetCode #904)
                </p>
            </header>

            {/* Enhanced Controls Section */}
            <div className="bg-theme-tertiary/50 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-theme-primary/50 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4 flex-grow w-full">
                    <div className="flex flex-col md:flex-row gap-4 flex-grow">
                        <div className="flex flex-col md:flex-row items-center gap-4 flex-grow">
                            <label htmlFor="array-input" className="font-medium text-theme-secondary font-mono whitespace-nowrap">
                                Fruits:
                            </label>
                            <input
                                id="array-input"
                                type="text"
                                value={numsInput}
                                onChange={(e) => setNumsInput(e.target.value)}
                                disabled={isLoaded}
                                placeholder="e.g., 2,4,5,2,2,1,3,2,1,1"
                                className="font-mono flex-grow w-full bg-theme-secondary border border-theme-primary rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:opacity-50"
                            />
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-4 flex-wrap md:flex-nowrap justify-center w-full md:w-auto">
                    {!isLoaded ? (
                        <>
                            <button
                                onClick={loadArray}
                                className="bg-gradient-to-r from-orange500 to-orange600 hover:from-orange600 hover:to-orange700 text-theme-primary font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer flex-1 md:flex-none"
                            >
                                Load & Visualize
                            </button>
                            <button
                                onClick={generateRandomArray}
                                className="bg-purplehover hover:bg-purple700 text-theme-primary font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer flex-1 md:flex-none"
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
                                    <label className="text-theme-tertiary text-sm whitespace-nowrap">Speed:</label>
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
            <div className="flex border-b-2 border-theme-primary mb-6 overflow-x-auto">
                <button
                    onClick={() => handleModeChange("brute-force")}
                    className={`cursor-pointer p-4 px-8 border-b-4 transition-all font-semibold whitespace-nowrap flex-1 text-center ${
                        mode === "brute-force"
                            ? "border-orange text-orange bg-orangelight"
                            : "border-transparent text-theme-tertiary hover:text-theme-secondary"
                    }`}
                >
                    Brute Force O(n²)
                </button>
                <button
                    onClick={() => handleModeChange("optimal")}
                    className={`cursor-pointer p-4 px-8 border-b-4 transition-all font-semibold whitespace-nowrap flex-1 text-center ${
                        mode === "optimal"
                            ? "border-orange text-orange bg-orangelight"
                            : "border-transparent text-theme-tertiary hover:text-theme-secondary"
                    }`}
                >
                    Optimal O(n) - Sliding Window
                </button>
            </div>

            {isLoaded ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Pseudocode Panel */}
                    <div className="lg:col-span-1 bg-theme-tertiary/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-theme-primary/50">
                        <h3 className="font-bold text-xl text-orange mb-4 border-b border-theme-primary/50 pb-3 flex items-center gap-2">
                            <Code size={20} />
                            {mode === "brute-force" ? "Brute Force Code" : "Optimal Code"}
                        </h3>
                        <div className="overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                            <pre className="text-sm">
                                <code className="font-mono leading-relaxed block">
                                    {(mode === 'brute-force' ? bruteForceCode : optimalCode).map(l => (
                                        <CodeLine key={l.l} line={l.l} content={l.c} />
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
                                        ({state.nums.length} fruits)
                                    </span>
                                )}
                            </h3>
                            
                            <div className="flex flex-col items-center space-y-6">
                                {/* Array with indices */}
                                <div className="relative w-full" id="array-container">
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
                                    {state.windowStart !== null && state.windowStart >= 0 && (
                                        <Pointer
                                            index={state.windowStart}
                                            containerId="array-container"
                                            color="red"
                                            label="start"
                                        />
                                    )}
                                    {state.windowEnd !== null && state.windowEnd < state.nums?.length && (
                                        <Pointer
                                            index={state.windowEnd}
                                            containerId="array-container"
                                            color="blue"
                                            label="end"
                                        />
                                    )}
                                </div>

                                {/* Current Window Info */}
                                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 border border-theme-primary w-full max-w-md">
                                    <h4 className="text-sm text-theme-tertiary mb-3 flex items-center gap-2">
                                        <Target size={16} />
                                        Current Window
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <div className="text-theme-muted">Window:</div>
                                            <div className="font-mono text-orange">
                                                [{state.windowStart ?? "N/A"}, {state.windowEnd ?? "N/A"}]
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-theme-muted">Length:</div>
                                            <div className="font-mono text-orange">
                                                {currentWindowLength}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-accent-primary900/40 to-accent-primary800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-accent-primary700/50">
                                <h3 className="font-bold text-lg text-accent-primary mb-3 flex items-center gap-2">
                                    <Layers size={20} />
                                    Fruit Types
                                </h3>
                                <div className="text-center">
                                    <span className="font-mono text-4xl font-bold text-accent-primary">
                                        {mode === 'optimal' ? state.fruitFrequency?.size || 0 : state.currentBaskets?.size || 0}
                                    </span>
                                    <span className="text-theme-tertiary text-2xl mx-2">/</span>
                                    <span className="font-mono text-4xl font-bold text-theme-secondary">
                                        2
                                    </span>
                                </div>
                                <div className="w-full bg-theme-elevated rounded-full h-2 mt-3">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-500 shadow-lg ${
                                            (mode === 'optimal' ? state.fruitFrequency?.size || 0 : state.currentBaskets?.size || 0) <= 2 
                                                ? "bg-gradient-to-r from-success500 to-success500 shadow-success/25" 
                                                : "bg-gradient-to-r from-danger500 to-pink500 shadow-danger/25"
                                        }`}
                                        style={{ width: `${Math.min(((mode === 'optimal' ? state.fruitFrequency?.size || 0 : state.currentBaskets?.size || 0) / 2) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-purple900/40 to-purple800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-purple700/50">
                                <h3 className="font-bold text-lg text-purple mb-3 flex items-center gap-2">
                                    <Maximize2 size={20} />
                                    Window Length
                                </h3>
                                <div className="font-mono text-4xl font-bold text-center text-purple">
                                    {currentWindowLength}
                                </div>
                                <div className="text-xs text-theme-tertiary text-center mt-2">
                                    Current window size
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-success900/40 to-success800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-success700/50">
                                <h3 className="font-bold text-lg text-success mb-3 flex items-center gap-2">
                                    <Gauge size={20} />
                                    Max Length Found
                                </h3>
                                <div className="font-mono text-4xl font-bold text-center text-success">
                                    {state.maxLength || 0}
                                </div>
                                <div className="text-xs text-theme-tertiary text-center mt-2">
                                    {state.updatedMaxLength ? "Just updated! 🎉" : "Best so far"}
                                </div>
                            </div>
                        </div>

                        {/* Baskets Visualization */}
                        <div className="bg-gradient-to-br from-orange900/40 to-orange800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-orange700/50">
                            <h3 className="font-bold text-lg text-orange mb-3 flex items-center gap-2">
                                <ShoppingBasket size={20} />
                                Baskets (Fruit Types)
                            </h3>
                            <div className="flex gap-3 min-h-[4rem] bg-theme-secondary/50 p-4 rounded-lg flex-wrap items-center justify-center">
                                {mode === 'optimal' && state.fruitFrequency?.size > 0 && Array.from(state.fruitFrequency.entries()).map(([fruit, count]) => (
                                    <div key={fruit} className="flex flex-col items-center">
                                        <div className="w-16 h-16 flex flex-col items-center justify-center font-mono font-bold rounded-lg shadow-lg border-2 bg-gradient-to-br from-orange600 to-orange700 border-orange">
                                            <span className="text-xs text-theme-secondary">Type</span>
                                            <span className="text-lg text-theme-primary">{fruit}</span>
                                        </div>
                                        <span className="text-xs text-theme-tertiary mt-1">count: {count}</span>
                                    </div>
                                ))}
                                {mode === 'brute-force' && state.currentBaskets?.size > 0 && Array.from(state.currentBaskets.values()).map((fruit) => (
                                    <div key={fruit} className="flex flex-col items-center">
                                        <div className="w-16 h-16 flex flex-col items-center justify-center font-mono font-bold rounded-lg shadow-lg border-2 bg-gradient-to-br from-orange600 to-orange700 border-orange">
                                            <span className="text-xs text-theme-secondary">Type</span>
                                            <span className="text-lg text-theme-primary">{fruit}</span>
                                        </div>
                                    </div>
                                ))}
                                {(!state.fruitFrequency || state.fruitFrequency.size === 0) && (!state.currentBaskets || state.currentBaskets.size === 0) && (
                                    <span className="text-theme-muted italic text-sm">Baskets are empty</span>
                                )}
                            </div>
                        </div>

                        {/* Status and Explanation Panel */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-orange900/40 to-warning800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-orange700/50">
                                <h3 className="font-bold text-lg text-orange300 mb-3 flex items-center gap-2">
                                    <Calculator size={20} />
                                    Current State
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <p>
                                        Window Start: <span className="font-mono font-bold text-danger">{state.windowStart ?? "N/A"}</span>
                                    </p>
                                    <p>
                                        Window End: <span className="font-mono font-bold text-accent-primary">{state.windowEnd ?? "N/A"}</span>
                                    </p>
                                    <p>
                                        Fruit Types: <span className="font-mono font-bold text-orange">
                                            {mode === 'optimal' ? state.fruitFrequency?.size || 0 : state.currentBaskets?.size || 0}
                                        </span>
                                    </p>
                                    <p>
                                        Window Valid: <span className={`font-mono font-bold ${
                                            (mode === 'optimal' ? state.fruitFrequency?.size || 0 : state.currentBaskets?.size || 0) <= 2 
                                                ? "text-success" 
                                                : "text-danger"
                                        }`}>
                                            {(mode === 'optimal' ? state.fruitFrequency?.size || 0 : state.currentBaskets?.size || 0) <= 2 ? "Yes" : "No"}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            
                            <div className="bg-gradient-to-br from-accent-primary900/40 to-teal900/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-accent-primary700/50">
                                <h3 className="font-bold text-lg text-accent-primary mb-3 flex items-center gap-2">
                                    <BarChart3 size={20} />
                                    Step Explanation
                                </h3>
                                <div className="text-theme-secondary text-sm h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 p-1">
                                    {state.explanation || "Processing..."}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Complexity Analysis */}
                    <div className="lg:col-span-3 bg-theme-tertiary/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-theme-primary/50">
                        <h3 className="font-bold text-xl text-orange mb-4 border-b border-theme-primary/50 pb-3 flex items-center gap-2">
                            <Clock size={20} /> Complexity Analysis
                        </h3>
                        {mode === 'brute-force' ? (
                            <div className="grid md:grid-cols-2 gap-6 text-sm">
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-orange flex items-center gap-2">
                                        <Zap size={16} />
                                        Time Complexity
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="bg-theme-secondary/50 p-3 rounded-lg border border-theme-primary">
                                            <strong className="text-teal300 font-mono block mb-1">O(n²)</strong>
                                            <p className="text-theme-tertiary text-sm">
                                                We use nested loops. The outer loop iterates through all possible start points (n), 
                                                and the inner loop checks all possible end points (n). This results in an O(n²) complexity.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-orange flex items-center gap-2">
                                        <Cpu size={16} />
                                        Space Complexity
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="bg-theme-secondary/50 p-3 rounded-lg border border-theme-primary">
                                            <strong className="text-teal300 font-mono block mb-1">O(1)</strong>
                                            <p className="text-theme-tertiary text-sm">
                                                The space for the baskets (a Set) is constant because it can hold at most 3 fruit types 
                                                before the inner loop breaks. Thus, space is O(1).
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-6 text-sm">
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-orange flex items-center gap-2">
                                        <Zap size={16} />
                                        Time Complexity
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="bg-theme-secondary/50 p-3 rounded-lg border border-theme-primary">
                                            <strong className="text-teal300 font-mono block mb-1">O(n)</strong>
                                            <p className="text-theme-tertiary text-sm">
                                                We iterate through the array once with the `windowEnd` pointer. The `windowStart` pointer 
                                                also only moves forward. Each element is visited at most twice, resulting in linear time.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-orange flex items-center gap-2">
                                        <Cpu size={16} />
                                        Space Complexity
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="bg-theme-secondary/50 p-3 rounded-lg border border-theme-primary">
                                            <strong className="text-teal300 font-mono block mb-1">O(1)</strong>
                                            <p className="text-theme-tertiary text-sm">
                                                The space for the `fruitFrequency` map is constant because it stores at most 3 fruit types. 
                                                Therefore, the space complexity is O(1) (or O(k) where k=3).
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
                        Enter a fruit array to start the visualization
                    </div>
                    <div className="text-theme-muted text-sm max-w-2xl mx-auto space-y-2">
                        <div className="flex items-center justify-center gap-4 text-xs mb-4 flex-wrap">
                            <span className="bg-orangelight text-orange px-3 py-1 rounded-full">Array Format: 2,4,5,2,2,1,3,2,1,1</span>
                            <span className="bg-success-light text-success px-3 py-1 rounded-full">Max 2 fruit types allowed</span>
                        </div>
                        <p>
                            <strong>Example:</strong> Array: "2,4,5,2,2,1,3,2,1,1" → Returns 5 (subarray [2,4,5,2,2] or [2,1,3,2,1])
                        </p>
                        <p className="text-theme-muted">
                            Find the longest contiguous subarray containing at most 2 different fruit types.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FruitsIntoBaskets;