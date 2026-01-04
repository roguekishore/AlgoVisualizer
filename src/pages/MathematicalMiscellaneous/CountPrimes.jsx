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
  Hash,
  Target,
  Gauge,
  Filter,
  AlertTriangle,
  Info,
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
    yellow: { bg: "bg-warning", text: "text-warning" },
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
                          color === "blue" ? "#3b82f6" : 
                          color === "green" ? "#10b981" : "#eab308"
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

const CountPrimes = () => {
  const [mode, setMode] = useState("optimal");
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [nInput, setNInput] = useState("20");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [primeCount, setPrimeCount] = useState(0);
  const visualizerRef = useRef(null);

  const generateBruteForceHistory = useCallback((n) => {
    const newHistory = [];
    let count = 0;
    let stepCount = 0;
    const primes = [];

    const addState = (props) => {
      newHistory.push({
        n,
        count,
        primes: [...primes],
        currentNumber: null,
        isPrime: null,
        checkingDivisor: null,
        explanation: "",
        step: stepCount++,
        ...props,
      });
    };

    addState({
      line: 3,
      explanation: `Starting brute force approach to count primes less than ${n}`,
    });

    for (let i = 2; i < n; i++) {
      addState({
        line: 4,
        currentNumber: i,
        explanation: `Checking if ${i} is prime`,
      });

      let isPrime = true;
      addState({
        line: 5,
        currentNumber: i,
        isPrime: null,
        explanation: `Initialize isPrime = true for ${i}`,
      });

      for (let j = 2; j * j <= i; j++) {
        addState({
          line: 6,
          currentNumber: i,
          checkingDivisor: j,
          explanation: `Checking divisor ${j} for ${i} (checking up to √${i} ≈ ${Math.floor(Math.sqrt(i))})`,
        });

        if (i % j === 0) {
          isPrime = false;
          addState({
            line: 7,
            currentNumber: i,
            checkingDivisor: j,
            isPrime: false,
            explanation: `${i} is divisible by ${j}, so it's not prime`,
          });
          break;
        } else {
          addState({
            line: 6,
            currentNumber: i,
            checkingDivisor: j,
            explanation: `${i} is not divisible by ${j}, continue checking`,
          });
        }
      }

      if (isPrime) {
        count++;
        primes.push(i);
        addState({
          line: 9,
          currentNumber: i,
          isPrime: true,
          justFoundPrime: true,
          explanation: `${i} is prime! Total primes so far: ${count}`,
        });
      } else {
        addState({
          line: 11,
          currentNumber: i,
          isPrime: false,
          explanation: `${i} is not prime`,
        });
      }
    }

    addState({
      line: 13,
      finished: true,
      explanation: `Completed! Found ${count} primes less than ${n}: [${primes.join(", ")}]`,
    });

    setHistory(newHistory);
    setCurrentStep(0);
    setPrimeCount(count);
    setIsLoaded(true);
  }, []);

  const generateOptimalHistory = useCallback((n) => {
    const newHistory = [];
    let stepCount = 0;
    const isPrime = new Array(n).fill(true);
    isPrime[0] = isPrime[1] = false;
    let count = 0;
    const primes = [];

    const addState = (props) => {
      newHistory.push({
        n,
        count,
        primes: [...primes],
        isPrime: [...isPrime],
        currentNumber: null,
        markingMultiples: null,
        explanation: "",
        step: stepCount++,
        ...props,
      });
    };

    addState({
      line: 3,
      explanation: `Starting Sieve of Eratosthenes for n = ${n}. Initialize all numbers as prime.`,
    });

    for (let i = 2; i * i < n; i++) {
      if (isPrime[i]) {
        addState({
          line: 5,
          currentNumber: i,
          explanation: `${i} is prime, mark all its multiples starting from ${i*i} as non-prime`,
        });

        for (let j = i * i; j < n; j += i) {
          if (isPrime[j]) {
            isPrime[j] = false;
            addState({
              line: 6,
              currentNumber: i,
              markingMultiples: j,
              explanation: `Marking ${j} as non-prime (multiple of ${i})`,
            });
          } else {
            addState({
              line: 6,
              currentNumber: i,
              markingMultiples: j,
              explanation: `${j} is already marked as non-prime, skip`,
            });
          }
        }
      } else {
        addState({
          line: 4,
          currentNumber: i,
          explanation: `${i} is already marked as non-prime, skip`,
        });
      }
    }

    // Count primes
    addState({
      line: 9,
      explanation: "Starting to count primes from the sieve...",
    });

    for (let i = 2; i < n; i++) {
      if (isPrime[i]) {
        count++;
        primes.push(i);
        addState({
          line: 10,
          currentNumber: i,
          justFoundPrime: true,
          explanation: `${i} is prime! Total primes: ${count}`,
        });
      }
    }

    addState({
      line: 12,
      finished: true,
      explanation: `Completed! Found ${count} primes less than ${n}: [${primes.join(", ")}]`,
    });

    setHistory(newHistory);
    setCurrentStep(0);
    setPrimeCount(count);
    setIsLoaded(true);
  }, []);

  const resetVisualization = () => {
    setHistory([]);
    setCurrentStep(-1);
    setIsLoaded(false);
    setIsPlaying(false);
    setPrimeCount(0);
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

  const loadVisualization = () => {
    const n = parseInt(nInput, 10);

    if (isNaN(n) || n < 2) {
      alert("Please enter a number greater than or equal to 2");
      return;
    }

    if (n > 100) {
      if (!window.confirm(`You entered n = ${n}. Large values may cause performance issues. Continue?`)) {
        return;
      }
    }

    setIsLoaded(true);
    if (mode === "brute-force") {
      generateBruteForceHistory(n);
    } else {
      generateOptimalHistory(n);
    }
  };

  const generateRandomN = () => {
    const randomN = Math.floor(Math.random() * 50) + 20; // 20-70
    setNInput(randomN.toString());
    resetVisualization();
  };

  const parseInput = useCallback(() => {
    const n = parseInt(nInput, 10);
    if (isNaN(n) || n < 2) throw new Error("Invalid input");
    return { n };
  }, [nInput]);

  const handleModeChange = useModeHistorySwitch({
    mode,
    setMode,
    isLoaded,
    parseInput,
    generators: {
      "brute-force": ({ n }) => generateBruteForceHistory(n),
      optimal: ({ n }) => generateOptimalHistory(n),
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

  const getCellColor = (index) => {
    if (index >= state.n) return "bg-theme-tertiary border-theme-primary opacity-50";
    
    const isCurrent = state.currentNumber === index;
    const isChecking = mode === "brute-force" && state.checkingDivisor === index;
    const isMarking = mode === "optimal" && state.markingMultiples === index;
    const isPrimeNumber = state.isPrime?.[index];
    const justFound = state.justFoundPrime && index === state.currentNumber;

    if (justFound) {
      return "bg-gradient-to-br from-success400 to-success500 text-theme-primary border-success shadow-lg shadow-green-500/50 scale-110";
    } else if (isCurrent) {
      return "bg-gradient-to-br from-warning to-orange500 text-theme-primary border-warning shadow-lg shadow-warning/50";
    } else if (isChecking) {
      return "bg-gradient-to-br from-accent-primary400 to-teal500 text-theme-primary border-accent-primary shadow-lg shadow-blue-500/50";
    } else if (isMarking) {
      return "bg-gradient-to-br from-danger400 to-pink500 text-theme-primary border-danger shadow-lg shadow-red-500/50";
    } else if (index < 2) {
      return "bg-theme-elevated border-theme-primary text-theme-tertiary";
    } else if (isPrimeNumber === false) {
      return "bg-theme-elevated border-theme-muted text-theme-secondary line-through";
    } else if (isPrimeNumber === true) {
      return "bg-gradient-to-br from-success400 to-success500 text-theme-primary border-success shadow-lg";
    }
    return "bg-theme-elevated/50 border-theme-primary hover:bg-theme-elevated/50";
  };

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
    { line: 1, content: "int countPrimes(int n) {" },
    { line: 2, content: "    if (n <= 2) return 0;" },
    { line: 3, content: "    int count = 0;" },
    { line: 4, content: "    for (int i = 2; i < n; i++) {" },
    { line: 5, content: "        bool isPrime = true;" },
    { line: 6, content: "        for (int j = 2; j * j <= i; j++) {" },
    { line: 7, content: "            if (i % j == 0) {" },
    { line: 8, content: "                isPrime = false;" },
    { line: 9, content: "                break;" },
    { line: 10, content: "            }" },
    { line: 11, content: "        }" },
    { line: 12, content: "        if (isPrime) count++;" },
    { line: 13, content: "    }" },
    { line: 14, content: "    return count;" },
    { line: 15, content: "}" },
  ];

  const optimalCode = [
    { line: 1, content: "int countPrimes(int n) {" },
    { line: 2, content: "    if (n <= 2) return 0;" },
    { line: 3, content: "    vector<bool> isPrime(n, true);" },
    { line: 4, content: "    for (int i = 2; i * i < n; i++) {" },
    { line: 5, content: "        if (isPrime[i]) {" },
    { line: 6, content: "            for (int j = i * i; j < n; j += i) {" },
    { line: 7, content: "                isPrime[j] = false;" },
    { line: 8, content: "            }" },
    { line: 9, content: "        }" },
    { line: 10, content: "    }" },
    { line: 11, content: "    int count = 0;" },
    { line: 12, content: "    for (int i = 2; i < n; i++) {" },
    { line: 13, content: "        if (isPrime[i]) count++;" },
    { line: 14, content: "    }" },
    { line: 15, content: "    return count;" },
    { line: 16, content: "}" },
  ];

  return (
    <div
      ref={visualizerRef}
      tabIndex={0}
      className="p-4 max-w-7xl mx-auto focus:outline-none"
    >
      <header className="text-center mb-6">
        <h1 className="text-5xl font-bold text-accent-primary flex items-center justify-center gap-3">
          <Hash size={28} />
          Count Primes
        </h1>
        <p className="text-lg text-theme-tertiary mt-2">
          Count the number of prime numbers less than a non-negative number (LeetCode #204)
        </p>
      </header>

      {/* Enhanced Controls Section */}
      <div className="bg-theme-tertiary/50 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-theme-primary/50 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 flex-grow">
          <div className="flex items-center gap-4 flex-grow">
            <label htmlFor="n-input" className="font-medium text-theme-secondary font-mono hidden md:block">
              n:
            </label>
            <input
              id="n-input"
              type="number"
              value={nInput}
              onChange={(e) => setNInput(e.target.value)}
              disabled={isLoaded}
              placeholder="e.g., 20"
              className="font-mono flex-grow bg-theme-secondary border border-theme-primary rounded-lg p-3 focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
          {!isLoaded ? (
            <>
              <button
                onClick={loadVisualization}
                className="bg-accent-primary hover:bg-accent-primary-hover text-theme-primary font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer"
              >
                Load & Visualize
              </button>
              <button
                onClick={generateRandomN}
                className="bg-purple600 hover:bg-purple700 text-theme-primary font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer"
              >
                Random n
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
          Brute Force O(n√n)
        </div>
        <div
          onClick={() => handleModeChange("optimal")}
          className={`cursor-pointer p-4 px-8 border-b-4 transition-all font-semibold ${
            mode === "optimal"
              ? "border-accent-primary text-accent-primary bg-accent-primary-light"
              : "border-transparent text-theme-tertiary hover:text-theme-secondary"
          }`}
        >
          Optimal O(n log log n) - Sieve
        </div>
      </div>

      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pseudocode Panel */}
          <div className="lg:col-span-1 bg-theme-tertiary/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-theme-primary/50">
            <h3 className="font-bold text-xl text-accent-primary mb-4 border-b border-theme-primary/50 pb-3 flex items-center gap-2">
              <Code size={20} />
              {mode === "brute-force" ? "Brute Force Code" : "Sieve of Eratosthenes"}
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
            {/* Number Grid Visualization */}
            <div className="bg-theme-tertiary/50 backdrop-blur-sm p-6 rounded-xl border border-theme-primary/50 shadow-2xl">
              <h3 className="font-bold text-lg text-theme-secondary mb-6 flex items-center gap-2">
                <Grid size={20} />
                Number Grid (0 to {state.n - 1})
                {state.n > 0 && (
                  <span className="text-sm text-theme-tertiary ml-2">
                    (n = {state.n})
                  </span>
                )}
              </h3>
              
              <div className="flex flex-col items-center space-y-6">
                <div className="relative" id="number-grid">
                  {/* Number grid */}
                  <div className="grid grid-cols-10 gap-2 max-w-2xl">
                    {Array.from({ length: state.n }, (_, index) => (
                      <div
                        key={index}
                        id={`number-grid-element-${index}`}
                        className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-bold text-lg transition-all duration-500 transform ${getCellColor(index)}`}
                      >
                        {index}
                      </div>
                    ))}
                  </div>

                  {/* Pointers - Only show relevant ones based on mode */}
                  {state.currentNumber !== null && (
                    <Pointer
                      index={state.currentNumber}
                      containerId="number-grid"
                      color="yellow"
                      label="current"
                    />
                  )}
                  {mode === "brute-force" && state.checkingDivisor !== null && (
                    <Pointer
                      index={state.checkingDivisor}
                      containerId="number-grid"
                      color="blue"
                      label="divisor"
                    />
                  )}
                  {mode === "optimal" && state.markingMultiples !== null && (
                    <Pointer
                      index={state.markingMultiples}
                      containerId="number-grid"
                      color="red"
                      label="marking"
                    />
                  )}
                </div>

                {/* Legend - Show only relevant items based on mode */}
                <div className="flex flex-wrap gap-4 justify-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-br from-warning to-orange500 rounded"></div>
                    <span>Current Number</span>
                  </div>
                  {mode === "brute-force" && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-br from-accent-primary400 to-teal500 rounded"></div>
                      <span>Checking Divisor</span>
                    </div>
                  )}
                  {mode === "optimal" && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-br from-danger400 to-pink500 rounded"></div>
                      <span>Marking Multiple</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-br from-success400 to-success500 rounded"></div>
                    <span>Prime Number</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-theme-elevated rounded line-through"></div>
                    <span>Non-Prime</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Prime Numbers Found */}
            <div className="bg-gradient-to-br from-success900/40 to-success900/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-success700/50">
              <h3 className="font-bold text-lg text-success mb-3 flex items-center gap-2">
                <CheckCircle size={20} />
                Prime Numbers Found: {state.count}
              </h3>
              <div className="min-h-[4rem] bg-theme-secondary/50 p-4 rounded-lg">
                {state.primes?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {state.primes.map((prime, index) => (
                      <div
                        key={index}
                        className={`px-3 py-2 rounded-lg font-mono font-bold transition-all ${
                          state.justFoundPrime && index === state.primes.length - 1
                            ? "bg-gradient-to-br from-success400 to-success500 scale-110 text-theme-primary animate-bounce"
                            : "bg-gradient-to-br from-success500 to-success-hover text-theme-primary"
                        }`}
                      >
                        {prime}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-theme-tertiary italic text-sm">
                    No primes found yet
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
                    Current Number: <span className="font-mono font-bold text-warning">
                      {state.currentNumber ?? "N/A"}
                    </span>
                  </p>
                  {mode === "brute-force" && (
                    <p>
                      Checking Divisor: <span className="font-mono font-bold text-accent-primary">
                        {state.checkingDivisor ?? "N/A"}
                      </span>
                    </p>
                  )}
                  {mode === "optimal" && (
                    <p>
                      Marking Multiple: <span className="font-mono font-bold text-danger">
                        {state.markingMultiples ?? "N/A"}
                      </span>
                    </p>
                  )}
                  <p>
                    Primes Found: <span className="font-mono font-bold text-success">
                      {state.count ?? 0}
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
                    Time Complexity: O(n√n)
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-theme-secondary/50 p-3 rounded-lg border border-theme-primary">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        <strong className="text-teal300 font-mono">O(n × √n)</strong>
                      </div>
                      <p className="text-theme-tertiary text-sm mb-2">
                        For each number i from 2 to n-1, we check divisibility by all numbers from 2 to √i.
                      </p>
                      <div className="text-xs text-theme-muted space-y-1">
                        <div>• Outer loop: n-2 iterations ≈ O(n)</div>
                        <div>• Inner loop: √i iterations ≈ O(√n) on average</div>
                        <div>• Total: O(n) × O(√n) = O(n√n)</div>
                        <div>• For n=100: ~100 × 10 = 1,000 operations</div>
                        <div>• For n=1,000: ~1,000 × 31 = 31,000 operations</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-accent-primary flex items-center gap-2">
                    <Cpu size={16} />
                    Space Complexity: O(1)
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-theme-secondary/50 p-3 rounded-lg border border-theme-primary">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4 text-success" />
                        <strong className="text-teal300 font-mono">O(1) - Constant Space</strong>
                      </div>
                      <p className="text-theme-tertiary text-sm mb-2">
                        Only uses a fixed amount of extra space regardless of input size.
                      </p>
                      <div className="text-xs text-theme-muted space-y-1">
                        <div>• Single integer for counting primes</div>
                        <div>• Loop variables (i, j)</div>
                        <div>• Boolean flag for primality check</div>
                        <div>• No additional data structures needed</div>
                        <div>• Memory usage remains constant as n grows</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Additional Analysis */}
                <div className="md:col-span-2 space-y-4">
                  <h4 className="font-semibold text-accent-primary flex items-center gap-2">
                    <Gauge size={16} />
                    Performance Characteristics
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-warning-light p-3 rounded-lg border border-warning/30">
                      <div className="text-warning font-semibold mb-2">Advantages</div>
                      <ul className="text-xs text-theme-tertiary space-y-1">
                        <li>• Simple to implement and understand</li>
                        <li>• No extra memory overhead</li>
                        <li>• Good for small values of n</li>
                        <li>• Easy to debug and verify</li>
                      </ul>
                    </div>
                    <div className="bg-danger-light p-3 rounded-lg border border-danger/30">
                      <div className="text-danger font-semibold mb-2">Limitations</div>
                      <ul className="text-xs text-theme-tertiary space-y-1">
                        <li>• Becomes slow for n &gt; 10,000</li>
                        <li>• Repeated work for composite numbers</li>
                        <li>• Not suitable for large inputs</li>
                        <li>• Poor scalability</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-4">
                  <h4 className="font-semibold text-accent-primary flex items-center gap-2">
                    <Zap size={16} />
                    Time Complexity: O(n log log n)
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-theme-secondary/50 p-3 rounded-lg border border-theme-primary">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4 text-success" />
                        <strong className="text-teal300 font-mono">O(n × log(log n))</strong>
                      </div>
                      <p className="text-theme-tertiary text-sm mb-2">
                        The Sieve of Eratosthenes marks multiples of each prime, and the harmonic series of primes gives this complexity.
                      </p>
                      <div className="text-xs text-theme-muted space-y-1">
                        <div>• Outer loop: up to √n iterations</div>
                        <div>• Inner loop: marks n/p multiples for prime p</div>
                        <div>• Total operations: n × Σ(1/p) for primes p ≤ √n</div>
                        <div>• Harmonic series: Σ(1/p) ≈ log(log n)</div>
                        <div>• For n=1,000,000: ~1,000,000 × log(log(1,000,000)) ≈ 3.5M operations</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-accent-primary flex items-center gap-2">
                    <Cpu size={16} />
                    Space Complexity: O(n)
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-theme-secondary/50 p-3 rounded-lg border border-theme-primary">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4 text-success" />
                        <strong className="text-teal300 font-mono">O(n) - Linear Space</strong>
                      </div>
                      <p className="text-theme-tertiary text-sm mb-2">
                        Requires a boolean array of size n to track prime numbers.
                      </p>
                      <div className="text-xs text-theme-muted space-y-1">
                        <div>• Boolean array of size n: O(n) bits</div>
                        <div>• Additional variables: O(1)</div>
                        <div>• For n=1,000,000: ~1MB memory</div>
                        <div>• For n=10,000,000: ~10MB memory</div>
                        <div>• Memory grows linearly with input size</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Additional Analysis */}
                <div className="md:col-span-2 space-y-4">
                  <h4 className="font-semibold text-accent-primary flex items-center gap-2">
                    <Gauge size={16} />
                    Performance Characteristics
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-success-light p-3 rounded-lg border border-success/30">
                      <div className="text-success font-semibold mb-2">Advantages</div>
                      <ul className="text-xs text-theme-tertiary space-y-1">
                        <li>• Extremely efficient for large n</li>
                        <li>• Single pass marks all composites</li>
                        <li>• Can generate all primes up to n</li>
                        <li>• Optimal for multiple queries</li>
                        <li>• Well-suited for n up to 10⁷</li>
                      </ul>
                    </div>
                    <div className="bg-accent-primary-light p-3 rounded-lg border border-accent-primary/30">
                      <div className="text-accent-primary font-semibold mb-2">Optimizations</div>
                      <ul className="text-xs text-theme-tertiary space-y-1">
                        <li>• Start marking from i² (not 2i)</li>
                        <li>• Skip even numbers (except 2)</li>
                        <li>• Use bitset for memory efficiency</li>
                        <li>• Segmented sieve for very large n</li>
                        <li>• Wheel factorization for speedup</li>
                      </ul>
                    </div>
                  </div>
                  
                  {/* Mathematical Insight */}
                  <div className="bg-purple500/10 p-4 rounded-lg border border-purple500/30">
                    <h5 className="font-semibold text-purple300 mb-2 flex items-center gap-2">
                      <Calculator size={16} />
                      Mathematical Insight
                    </h5>
                    <div className="text-xs text-theme-tertiary space-y-2">
                      <p>
                        The time complexity comes from the harmonic series of primes: 
                        <code className="bg-theme-tertiary px-1 mx-1 rounded">Σ(1/p) ≈ log(log n)</code>
                        for primes p ≤ n.
                      </p>
                      <p>
                        The algorithm efficiently eliminates composite numbers by marking multiples, 
                        and each composite is marked exactly once by its smallest prime factor.
                      </p>
                      <p className="text-success">
                        This makes the Sieve of Eratosthenes one of the most efficient algorithms 
                        for generating all prime numbers up to a given limit.
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
            Enter a number n to start the visualization
          </div>
          <div className="text-theme-muted text-sm max-w-2xl mx-auto space-y-2">
            <div className="flex items-center justify-center gap-4 text-xs mb-4">
              <span className="bg-accent-primary-light text-accent-primary px-3 py-1 rounded-full">n ≥ 2</span>
              <span className="bg-success-light text-success px-3 py-1 rounded-full">Count primes less than n</span>
              <span className="bg-purple500/20 text-purple300 px-3 py-1 rounded-full">Supports large numbers</span>
            </div>
            <p>
              <strong>Example:</strong> n: 20 → Returns 8 (primes: 2,3,5,7,11,13,17,19)
            </p>
            <p>
              <strong>Try:</strong> n: 100 → Returns 25 primes
            </p>
            <p className="text-theme-muted">
              A prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself.
              The Sieve of Eratosthenes is one of the most efficient ways to find all primes smaller than n.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountPrimes;
