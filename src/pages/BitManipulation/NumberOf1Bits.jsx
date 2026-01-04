import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Hash,
  Binary,
  Cpu,
  Clock,
  Zap,
  CheckCircle,
  Code2,
  Calculator,
  Sparkles,
  TrendingUp,
  Target,
  Gauge,
  AlertCircle
} from "lucide-react";

const LANG_TABS = ["C++", "Python", "Java"];

const CODE_SNIPPETS = {
  "C++": [
    { l: 1, t: "int hammingWeight(uint32_t n) {" },
    { l: 2, t: "    int count = 0;" },
    { l: 3, t: "    while (n) {" },
    { l: 4, t: "        count++;" },
    { l: 5, t: "        n &= (n - 1);" },
    { l: 6, t: "    }" },
    { l: 7, t: "    return count;" },
    { l: 8, t: "}" },
  ],
  Python: [
    { l: 1, t: "def hammingWeight(n):" },
    { l: 2, t: "    count = 0" },
    { l: 3, t: "    while n:" },
    { l: 4, t: "        count += 1" },
    { l: 5, t: "        n &= (n - 1)" },
    { l: 6, t: "    return count" },
  ],
  Java: [
    { l: 1, t: "public int hammingWeight(int n) {" },
    { l: 2, t: "    int count = 0;" },
    { l: 3, t: "    while (n != 0) {" },
    { l: 4, t: "        count++;" },
    { l: 5, t: "        n &= (n - 1);" },
    { l: 6, t: "    }" },
    { l: 7, t: "    return count;" },
    { l: 8, t: "}" },
  ],
};

// Enhanced Code Line Component
const CodeLine = ({ lineNum, content, isActive = false, isHighlighted = false }) => (
  <div
    className={`block rounded-lg transition-all duration-300 border-l-4 ${
      isActive
        ? "bg-teal/20 border-teal500 shadow-lg shadow-cyan-500/20 scale-[1.02]"
        : isHighlighted
        ? "bg-accent-primary-light border-accent-primary/50"
        : "border-transparent hover:bg-theme-elevated/30"
    }`}
  >
    <span className="text-theme-muted select-none inline-block w-8 text-right mr-3">
      {lineNum}
    </span>
    <span className={`font-mono ${isActive ? "text-teal300 font-bold" : isHighlighted ? "text-accent-primary" : "text-theme-secondary"}`}>
      {content}
    </span>
  </div>
);

const NumberOf1Bits = ({ navigate }) => {
  const defaultNumber = 11; // Binary: 1011
  const [number, setNumber] = useState(defaultNumber);
  const [inputNumber, setInputNumber] = useState(defaultNumber.toString());
  const [animSpeed, setAnimSpeed] = useState(800);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState("input");
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeLang, setActiveLang] = useState("C++");
  const playRef = useRef(null);

  const generateCountHistory = useCallback((num) => {
    const hist = [];
    let n = num >>> 0; // Convert to 32-bit unsigned integer
    const binaryStr = n.toString(2).padStart(32, '0');
    let stepCount = 0;

    const addState = (props) => {
      hist.push({
        step: stepCount++,
        ...props
      });
    };

    // Initial state
    addState({
      number: n,
      binary: binaryStr,
      count: 0,
      currentBit: null,
      tempN: n,
      message: `Starting Hamming Weight calculation for number: ${num}\nBinary: ${binaryStr}\nUsing Brian Kernighan's algorithm`,
      phase: "init",
      line: 2
    });

    let count = 0;
    let tempN = n;
    let iterations = 0;

    // Show initial analysis
    const initialOnes = binaryStr.split('1').length - 1;
    addState({
      number: n,
      binary: binaryStr,
      count: 0,
      currentBit: null,
      tempN,
      message: `Initial analysis: Binary has ${initialOnes} '1' bits\nNow proving algorithmically using n & (n-1) trick`,
      phase: "analysis",
      line: 3
    });

    // Processing steps
    while (tempN !== 0) {
      iterations++;
      const originalTempN = tempN;
      
      // Find rightmost set bit position
      const bitPosition = 31 - Math.clz32(tempN & -tempN);
      
      // Show current state before operation
      addState({
        number: n,
        binary: binaryStr,
        count,
        currentBit: bitPosition,
        tempN: tempN,
        message: `Iteration ${iterations}: Current value = ${tempN}\nRightmost set bit at position ${bitPosition}\nReady to clear this bit`,
        phase: "checking",
        line: 4
      });

      // Increment count
      count++;
      addState({
        number: n,
        binary: binaryStr,
        count,
        currentBit: bitPosition,
        tempN: tempN,
        message: `Found set bit! Incrementing count: ${count - 1} → ${count}\nBit position: ${bitPosition} (2^${bitPosition} = ${Math.pow(2, bitPosition)})`,
        phase: "counting",
        line: 4
      });

      // Perform bit clearance
      const nextTempN = tempN & (tempN - 1);
      addState({
        number: n,
        binary: binaryStr,
        count,
        currentBit: bitPosition,
        tempN: tempN,
        nextTempN,
        message: `Clearing rightmost set bit:\n${tempN} & (${tempN} - 1) = ${nextTempN}\nOperation removes the rightmost '1' bit`,
        phase: "operation",
        line: 5
      });

      tempN = nextTempN;

      if (tempN !== 0) {
        addState({
          number: n,
          binary: binaryStr,
          count,
          currentBit: null,
          tempN,
          message: `Continuing... Remaining value: ${tempN}\nBinary: ${tempN.toString(2).padStart(32, '0')}\nBits left: ${tempN.toString(2).split('1').length - 1}`,
          phase: "shift",
          line: 3
        });
      }
    }

    // Final state
    addState({
      number: n,
      binary: binaryStr,
      count,
      currentBit: null,
      tempN: 0,
      message: `Algorithm Complete! Final count: ${count} '1' bits\nNumber: ${n}\nBinary: ${binaryStr}\nTotal iterations: ${iterations}`,
      phase: "complete",
      line: 7,
      isFinal: true
    });

    return hist;
  }, []);

  const handleStart = () => {
    const num = parseInt(inputNumber, 10);
    if (isNaN(num) || num < 0 || num > 2147483647) {
      alert("Please enter a valid number between 0 and 2,147,483,647");
      return;
    }
    setNumber(num);
    setMode("visualizing");
    const hist = generateCountHistory(num);
    setHistory(hist);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleReset = () => {
    setMode("input");
    setHistory([]);
    setCurrentStep(0);
    setIsPlaying(false);
    clearInterval(playRef.current);
  };

  const handleNumberChange = (e) => {
    setInputNumber(e.target.value);
  };

  const generateRandomNumber = () => {
    const randomNum = Math.floor(Math.random() * 1000) + 1;
    setInputNumber(randomNum.toString());
  };

  const goToNextStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev < history.length - 1) {
        return prev + 1;
      }
      setIsPlaying(false);
      return prev;
    });
  }, [history.length]);

  const goToPrevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStart = useCallback(() => {
    setCurrentStep(0);
  }, []);

  const goToEnd = useCallback(() => {
    setCurrentStep(history.length - 1);
  }, [history.length]);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // Auto-play effect
  useEffect(() => {
    if (isPlaying && currentStep < history.length - 1) {
      playRef.current = setInterval(() => {
        goToNextStep();
      }, 1100 - animSpeed);
    } else {
      clearInterval(playRef.current);
    }
    return () => clearInterval(playRef.current);
  }, [isPlaying, currentStep, history.length, animSpeed, goToNextStep]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (mode !== "visualizing") return;
      
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          goToPrevStep();
          break;
        case "ArrowRight":
          e.preventDefault();
          goToNextStep();
          break;
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "Home":
          e.preventDefault();
          goToStart();
          break;
        case "End":
          e.preventDefault();
          goToEnd();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, goToPrevStep, goToNextStep, goToStart, goToEnd, togglePlay]);

  const step = history[currentStep] || {};
  const { 
    binary = "", 
    count = 0, 
    currentBit = null, 
    message = "", 
    phase = "init",
    line,
    tempN = 0,
    isFinal = false
  } = step;

  const progressPercentage = history.length > 0 ? ((currentStep + 1) / history.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-theme-primary relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-accent-primary-light rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal400 to-accent-primary400 mb-4">
            Number of 1 Bits
          </h1>
          <p className="text-theme-tertiary text-lg max-w-2xl mx-auto">
            Calculate the Hamming Weight - count the number of 1's in binary representation using Brian Kernighan's algorithm
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-teal/10 rounded-full border border-teal500/30">
              <Clock className="h-4 w-4 text-teal" />
              <span className="text-teal300 text-sm font-medium">O(k) Time</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-success-light rounded-full border border-success/30">
              <Cpu className="h-4 w-4 text-success" />
              <span className="text-success text-sm font-medium">O(1) Space</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-accent-primary-light rounded-full border border-accent-primary/30">
              <Binary className="h-4 w-4 text-accent-primary" />
              <span className="text-accent-primary text-sm font-medium">Bit Manipulation</span>
            </div>
          </div>
        </header>

        {/* Input Controls */}
        {mode === "input" && (
          <section className="mb-8">
            <div className="bg-theme-tertiary/50 backdrop-blur-sm rounded-2xl p-6 border border-theme-primary">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    <Target className="inline w-4 h-4 mr-2" />
                    Input Number
                  </label>
                  <input
                    type="number"
                    value={inputNumber}
                    onChange={handleNumberChange}
                    min="0"
                    max="2147483647"
                    className="w-full px-4 py-3 bg-theme-secondary border border-theme-primary rounded-xl text-theme-primary font-mono focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    placeholder="Enter a positive integer..."
                  />
                  <div className="text-xs text-theme-muted mt-2">
                    Examples: 11 (binary: 1011 → 3 ones), 16 (binary: 10000 → 1 one)
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleStart}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-teal500 to-accent-primary500 hover:from-teal600 hover:to-accent-primary600 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-cyan-500/25 flex items-center justify-center gap-2"
                  >
                    <Zap className="h-5 w-5" />
                    Start Visualization
                  </button>
                  <button
                    onClick={generateRandomNumber}
                    className="px-4 py-3 bg-theme-elevated hover:bg-theme-elevated rounded-xl transition-all duration-200 flex items-center gap-2"
                  >
                    <TrendingUp className="h-4 w-4" />
                    Random
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {mode === "visualizing" && (
          <>
            {/* Controls & Language Tabs */}
            <section className="mb-6">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="flex gap-2">
                  {LANG_TABS.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setActiveLang(lang)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        activeLang === lang
                          ? "bg-teal/20 text-teal300 border border-teal500/30"
                          : "bg-theme-tertiary/50 text-theme-tertiary hover:bg-theme-elevated/50 border border-theme-primary"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-theme-tertiary/50 rounded-xl px-4 py-2 border border-theme-primary">
                    <button
                      onClick={goToStart}
                      disabled={currentStep <= 0}
                      className="p-2 hover:bg-theme-elevated rounded-lg disabled:opacity-30 transition-all"
                      title="Go to Start (Home)"
                    >
                      <SkipBack className="h-4 w-4" />
                    </button>
                    <button
                      onClick={goToPrevStep}
                      disabled={currentStep <= 0}
                      className="p-2 hover:bg-theme-elevated rounded-lg disabled:opacity-30 transition-all"
                    >
                      <SkipBack className="h-4 w-4" />
                    </button>
                    
                    {!isPlaying ? (
                      <button
                        onClick={togglePlay}
                        disabled={currentStep >= history.length - 1}
                        className="p-2 hover:bg-theme-elevated rounded-lg disabled:opacity-30 transition-all"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={togglePlay}
                        className="p-2 bg-warning hover:bg-warning-hover rounded-lg transition-all"
                      >
                        <Pause className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      onClick={goToNextStep}
                      disabled={currentStep >= history.length - 1}
                      className="p-2 hover:bg-theme-elevated rounded-lg disabled:opacity-30 transition-all"
                    >
                      <SkipForward className="h-4 w-4" />
                    </button>
                    <button
                      onClick={goToEnd}
                      disabled={currentStep >= history.length - 1}
                      className="p-2 hover:bg-theme-elevated rounded-lg disabled:opacity-30 transition-all"
                      title="Go to End (End)"
                    >
                      <SkipForward className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm text-theme-tertiary">Speed:</label>
                    <select
                      value={animSpeed}
                      onChange={(e) => setAnimSpeed(parseInt(e.target.value))}
                      className="bg-theme-elevated border border-theme-primary rounded-lg px-3 py-2 text-theme-primary text-sm cursor-pointer focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value={400}>Slow</option>
                      <option value={700}>Medium</option>
                      <option value={1200}>Fast</option>
                    </select>
                  </div>

                  <div className="font-mono px-4 py-2 bg-theme-secondary border border-theme-primary rounded-lg text-center min-w-20">
                    <div className="text-teal font-bold">{currentStep + 1}</div>
                    <div className="text-theme-tertiary text-xs">of {history.length}</div>
                  </div>

                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-danger hover:bg-danger-hover rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-theme-tertiary mb-2">
                  <span>Progress</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full bg-theme-elevated rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-teal500 to-accent-primary500 h-2 rounded-full transition-all duration-500 shadow-lg shadow-cyan-500/25"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </section>

            {/* Main Visualization */}
            <main className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Code Panel */}
              <div className="xl:col-span-1">
                <div className="bg-theme-tertiary/50 backdrop-blur-sm rounded-2xl p-6 border border-theme-primary h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <Code2 className="h-5 w-5 text-teal" />
                    <h3 className="font-semibold text-theme-secondary">Algorithm Code</h3>
                  </div>
                  <div className="bg-theme-secondary rounded-xl border border-theme-primary p-4 font-mono text-sm">
                    {CODE_SNIPPETS[activeLang].map((codeLine) => (
                      <CodeLine 
                        key={codeLine.l} 
                        lineNum={codeLine.l} 
                        content={codeLine.t}
                        isActive={line === codeLine.l}
                        isHighlighted={[3, 4, 5].includes(codeLine.l)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Visualization Panel */}
              <div className="xl:col-span-2 space-y-6">
                {/* Binary Visualization */}
                <div className="bg-theme-tertiary/50 backdrop-blur-sm rounded-2xl p-6 border border-theme-primary">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-xl text-theme-secondary flex items-center gap-3">
                      <Binary className="h-6 w-6 text-teal" />
                      32-Bit Binary Representation
                    </h3>
                    <div className="text-sm text-theme-tertiary font-mono bg-theme-secondary/50 px-3 py-1 rounded-full">
                      Step {currentStep + 1}
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Current Number Display */}
                    <div className="bg-gradient-to-br from-teal900/40 to-accent-primary900/40 backdrop-blur-sm p-4 rounded-xl border border-teal700/50">
                      <h4 className="text-lg text-teal300 mb-3 flex items-center gap-2">
                        <Gauge className="h-5 w-5" />
                        Current State
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="p-3 bg-theme-secondary/30 rounded-lg">
                          <div className="text-theme-tertiary text-sm">Original</div>
                          <div className="text-teal300 font-mono text-xl">{number}</div>
                        </div>
                        <div className="p-3 bg-theme-secondary/30 rounded-lg">
                          <div className="text-theme-tertiary text-sm">Current</div>
                          <div className="text-purple300 font-mono text-xl">{tempN}</div>
                        </div>
                        <div className="p-3 bg-theme-secondary/30 rounded-lg">
                          <div className="text-theme-tertiary text-sm">1 Bits</div>
                          <div className="text-success font-mono text-2xl font-bold">{count}</div>
                        </div>
                        <div className="p-3 bg-theme-secondary/30 rounded-lg">
                          <div className="text-theme-tertiary text-sm">Active Bit</div>
                          <div className="text-orange300 font-mono text-xl">
                            {currentBit !== null ? currentBit : "—"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Binary Bits Grid */}
                    <div className="bg-theme-secondary/50 rounded-xl p-6 border border-theme-primary/50">
                      <div className="flex gap-2 flex-wrap justify-center mb-4">
                        {binary.split('').map((bit, index) => {
                          const position = 31 - index;
                          const isActive = currentBit === position;
                          const isSet = bit === '1';
                          
                          return (
                            <div key={index} className="flex flex-col items-center gap-1">
                              <div className="text-xs text-theme-muted font-mono h-4">
                                {position % 4 === 0 ? position : ""}
                              </div>
                              <div
                                className={`w-10 h-10 flex items-center justify-center rounded-lg font-mono font-bold transition-all duration-300 ${
                                  isActive && isSet
                                    ? "bg-gradient-to-br from-success500 to-success700 text-theme-primary shadow-lg shadow-green-500/50 scale-110"
                                    : isActive
                                    ? "bg-gradient-to-br from-teal500 to-teal700 text-theme-primary shadow-lg shadow-cyan-500/50 scale-105"
                                    : isSet
                                    ? "bg-accent-primary-hover text-theme-primary shadow-md shadow-blue-500/30"
                                    : "bg-theme-elevated text-theme-tertiary"
                                }`}
                              >
                                {bit}
                              </div>
                              <div className="text-xs text-theme-muted font-mono h-4">
                                {position % 4 === 0 ? `2^${position}` : ""}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap justify-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-gradient-to-br from-teal500 to-teal700"></div>
                        <span className="text-sm text-theme-secondary">Current Bit (0)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-gradient-to-br from-success500 to-success700"></div>
                        <span className="text-sm text-theme-secondary">Current Bit (1)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-accent-primary-hover"></div>
                        <span className="text-sm text-theme-secondary">Set Bit (1)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-theme-elevated"></div>
                        <span className="text-sm text-theme-secondary">Unset Bit (0)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Explanation & Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-teal900/40 to-accent-primary900/40 backdrop-blur-sm p-6 rounded-2xl border border-teal700/50">
                    <h3 className="font-bold text-xl text-teal300 mb-4 flex items-center gap-3">
                      <Calculator className="h-5 w-5" />
                      Step Explanation
                    </h3>
                    <div className="text-theme-secondary text-sm leading-relaxed h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 p-2">
                      {message.split('\n').map((line, i) => (
                        <div key={i} className="mb-2 last:mb-0">
                          {line}
                        </div>
                      ))}
                    </div>
                    {isFinal && (
                      <div className="mt-4 p-3 bg-success-light rounded-lg border border-success/30">
                        <div className="text-success text-sm font-semibold flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Algorithm Completed Successfully!
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-gradient-to-br from-accent-primary900/40 to-purple900/40 backdrop-blur-sm p-6 rounded-2xl border border-accent-primary700/50">
                    <h3 className="font-bold text-xl text-accent-primary mb-4 flex items-center gap-3">
                      <Sparkles className="h-5 w-5" />
                      Current State
                    </h3>
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between items-center py-2 border-b border-accent-primary700/30">
                        <span className="text-theme-secondary">Phase</span>
                        <span className="font-mono font-bold text-teal capitalize">
                          {phase}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-accent-primary700/30">
                        <span className="text-theme-secondary">Steps Completed</span>
                        <span className="font-mono font-bold text-purple400">
                          {currentStep + 1}/{history.length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-accent-primary700/30">
                        <span className="text-theme-secondary">Active Line</span>
                        <span className="font-mono font-bold text-success">
                          {line || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-theme-secondary">Remaining Value</span>
                        <span className="font-mono font-bold text-orange400">
                          {tempN}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Result */}
                {isFinal && (
                  <div className="bg-gradient-to-br from-success900/40 to-success900/40 backdrop-blur-sm p-6 rounded-2xl border border-success shadow-xl">
                    <div className="text-center">
                      <div className="text-success text-sm mb-2">Final Result</div>
                      <div className="text-4xl font-black text-success200 mb-4">
                        Hamming Weight: {count}
                      </div>
                      <div className="text-theme-secondary text-sm">
                        The number {number} has {count} '1' bits in its binary representation
                      </div>
                      <div className="text-theme-tertiary text-xs mt-2 font-mono">
                        Binary: {binary}
                      </div>
                    </div>
                  </div>
                )}

                {/* Complexity Analysis */}
                <div className="bg-theme-tertiary/50 backdrop-blur-sm rounded-2xl p-6 border border-theme-primary">
                  <h3 className="font-bold text-xl text-teal mb-6 flex items-center gap-3">
                    <Zap className="h-6 w-6" />
                    Algorithm Analysis
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-teal300 text-lg">Brian Kernighan's Method</h4>
                      <div className="bg-theme-secondary/50 p-4 rounded-xl border border-theme-primary">
                        <div className="text-2xl font-bold text-success text-center mb-2">O(k)</div>
                        <p className="text-theme-tertiary text-sm text-center">
                          Where k is number of set bits. Only loops for each '1' bit.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-accent-primary text-lg">Space Complexity</h4>
                      <div className="bg-theme-secondary/50 p-4 rounded-xl border border-theme-primary">
                        <div className="text-2xl font-bold text-success text-center mb-2">O(1)</div>
                        <p className="text-theme-tertiary text-sm text-center">
                          Uses only constant extra space for variables
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-theme-secondary/30 rounded-xl border border-theme-primary">
                    <h5 className="font-semibold text-orange300 mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Key Insight
                    </h5>
                    <p className="text-theme-tertiary text-sm">
                      The operation <code className="px-2 py-1 bg-theme-tertiary rounded">n & (n - 1)</code> clears the rightmost set bit. 
                      Each iteration removes one '1' bit, so the number of iterations equals the Hamming weight.
                    </p>
                  </div>
                </div>
              </div>
            </main>
          </>
        )}
      </div>
    </div>
  );
};

export default NumberOf1Bits;