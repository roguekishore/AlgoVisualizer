import React, { useState, useCallback, useEffect, useRef } from "react";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  SkipBack, 
  SkipForward, 
  FlipHorizontal,
  Code2,
  Binary,
  Zap,
  Cpu,
  Clock,
  CheckCircle,
  Target,
  Gauge,
  Sparkles,
  MousePointer,
  TrendingUp
} from "lucide-react";

const LANG_TABS = ["C++", "Python", "Java"];

const CODE_SNIPPETS = {
  "C++": [
    { l: 1, t: "uint32_t reverseBits(uint32_t n) {" },
    { l: 2, t: "    uint32_t result = 0;" },
    { l: 3, t: "    for (int i = 0; i < 32; i++) {" },
    { l: 4, t: "        result <<= 1;" },
    { l: 5, t: "        result |= (n & 1);" },
    { l: 6, t: "        n >>= 1;" },
    { l: 7, t: "    }" },
    { l: 8, t: "    return result;" },
    { l: 9, t: "}" },
  ],
  Python: [
    { l: 1, t: "def reverseBits(n):" },
    { l: 2, t: "    result = 0" },
    { l: 3, t: "    for i in range(32):" },
    { l: 4, t: "        result <<= 1" },
    { l: 5, t: "        result |= (n & 1)" },
    { l: 6, t: "        n >>= 1" },
    { l: 7, t: "    return result" },
  ],
  Java: [
    { l: 1, t: "public int reverseBits(int n) {" },
    { l: 2, t: "    int result = 0;" },
    { l: 3, t: "    for (int i = 0; i < 32; i++) {" },
    { l: 4, t: "        result <<= 1;" },
    { l: 5, t: "        result |= (n & 1);" },
    { l: 6, t: "        n >>>= 1;" },
    { l: 7, t: "    }" },
    { l: 8, t: "    return result;" },
    { l: 9, t: "}" },
  ],
};

// Enhanced Code Line Component
const CodeLine = ({ lineNum, content, isActive = false, isHighlighted = false }) => (
  <div
    className={`block rounded-lg transition-all duration-300 border-l-4 ${
      isActive
        ? "bg-accent-primary-light border-accent-primary shadow-lg shadow-indigo-500/20 scale-[1.02]"
        : isHighlighted
        ? "bg-accent-primary-light border-accent-primary/50"
        : "border-transparent hover:bg-theme-elevated/30"
    }`}
  >
    <span className="text-theme-muted select-none inline-block w-8 text-right mr-3">
      {lineNum}
    </span>
    <span className={`font-mono ${isActive ? "text-accent-primary300 font-bold" : isHighlighted ? "text-accent-primary" : "text-theme-secondary"}`}>
      {content}
    </span>
  </div>
);

const ReverseBits = ({ navigate }) => {
  const defaultNumber = 43261596; // Binary: 00000010100101000001111010011100
  const [number, setNumber] = useState(defaultNumber);
  const [inputNumber, setInputNumber] = useState(defaultNumber.toString());
  const [animSpeed, setAnimSpeed] = useState(800);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState("input");
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeLang, setActiveLang] = useState("C++");
  const playRef = useRef(null);

  const generateReverseHistory = useCallback((num) => {
    const hist = [];
    const n = num >>> 0;
    const originalBinary = n.toString(2).padStart(32, '0');
    
    // Initial state
    hist.push({
      original: n,
      originalBinary,
      result: 0,
      resultBinary: '0'.repeat(32),
      currentBit: null,
      message: `Starting bit reversal for number: ${num}\nBinary: ${originalBinary}`,
      phase: "init",
      line: 2
    });

    let result = 0;
    let tempN = n;

    for (let i = 0; i < 32; i++) {
      const bit = tempN & 1;
      
      // Reading bit step
      hist.push({
        original: n,
        originalBinary,
        result,
        resultBinary: result.toString(2).padStart(32, '0'),
        currentBit: i,
        bit,
        message: `Step ${i + 1}: Reading bit ${i} from right → ${bit}`,
        phase: "reading",
        line: 5
      });

      // Shift result left
      result = result << 1;
      hist.push({
        original: n,
        originalBinary,
        result,
        resultBinary: result.toString(2).padStart(32, '0'),
        currentBit: i,
        bit,
        message: `Step ${i + 1}: Shifted result left\nResult: ${result.toString(2).padStart(32, '0')}`,
        phase: "shifting",
        line: 4
      });

      // Add current bit
      result = result | bit;
      hist.push({
        original: n,
        originalBinary,
        result,
        resultBinary: result.toString(2).padStart(32, '0'),
        currentBit: i,
        bit,
        message: `Step ${i + 1}: Added bit ${bit} to result\nResult: ${result.toString(2).padStart(32, '0')}`,
        phase: "adding",
        line: 5
      });

      // Shift original right
      tempN = tempN >>> 1;
      hist.push({
        original: n,
        originalBinary: tempN.toString(2).padStart(32, '0'),
        result,
        resultBinary: result.toString(2).padStart(32, '0'),
        currentBit: i,
        bit,
        message: `Step ${i + 1}: Shifted original number right\nOriginal: ${tempN.toString(2).padStart(32, '0')}`,
        phase: "shifting_original",
        line: 6
      });
    }

    // Final state
    hist.push({
      original: n,
      originalBinary,
      result,
      resultBinary: result.toString(2).padStart(32, '0'),
      currentBit: null,
      message: `🎉 Bit Reversal Complete!\nOriginal: ${n} → Reversed: ${result}\nBinary: ${originalBinary} → ${result.toString(2).padStart(32, '0')}`,
      phase: "complete",
      line: 8
    });

    return hist;
  }, []);

  const handleStart = () => {
    const num = parseInt(inputNumber, 10);
    if (isNaN(num) || num < 0 || num > 4294967295) {
      alert("Please enter a valid 32-bit unsigned integer (0 to 4,294,967,295)");
      return;
    }
    setNumber(num);
    setMode("visualizing");
    const hist = generateReverseHistory(num);
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

  const handleExample = () => {
    const randomNum = Math.floor(Math.random() * 4294967296); // Generate random 32-bit number (0 to 4294967295)
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
    originalBinary = "", 
    resultBinary = "", 
    currentBit = null, 
    message = "", 
    phase = "init", 
    result = 0,
    line
  } = step;

  const progressPercentage = history.length > 0 ? ((currentStep + 1) / history.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-theme-primary relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-purple500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary400 to-purple400 mb-4">
            Reverse Bits
          </h1>
          <p className="text-theme-tertiary text-lg max-w-2xl mx-auto">
            Reverse the bits of a 32-bit unsigned integer through step-by-step bit manipulation
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-accent-primary/10 rounded-full border border-accent-primary/30">
              <Clock className="h-4 w-4 text-accent-primary" />
              <span className="text-accent-primary300 text-sm font-medium">O(1) Time</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-success-light rounded-full border border-success/30">
              <Cpu className="h-4 w-4 text-success" />
              <span className="text-success text-sm font-medium">O(1) Space</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple500/10 rounded-full border border-purple500/30">
              <Binary className="h-4 w-4 text-purple400" />
              <span className="text-purple300 text-sm font-medium">32-bit Manipulation</span>
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
                    32-bit Unsigned Integer
                  </label>
                  <input
                    type="number"
                    value={inputNumber}
                    onChange={handleNumberChange}
                    min="0"
                    max="4294967295"
                    className="w-full px-4 py-3 bg-theme-secondary border border-theme-primary rounded-xl text-theme-primary font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Enter a number (0 to 4,294,967,295)..."
                  />
                  <div className="text-xs text-theme-muted mt-2">
                    Example: 43261596 → 00000010100101000001111010011100
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleStart}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-accent-primary500 to-purple500 hover:from-accent-primary600 hover:to-purple600 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2"
                  >
                    <Zap className="h-5 w-5" />
                    Start Visualization
                  </button>
                  <button
                    onClick={handleExample}
                    className="px-4 py-3 bg-theme-elevated hover:bg-theme-elevated rounded-xl transition-all duration-200 flex items-center gap-2"
                  >
                    <TrendingUp className="h-4 w-4" />
                    Example
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
                          ? "bg-accent-primary-light text-accent-primary300 border border-accent-primary/30"
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
                      className="bg-theme-elevated border border-theme-primary rounded-lg px-3 py-2 text-theme-primary text-sm cursor-pointer focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={500}>Fast</option>
                      <option value={800}>Medium</option>
                      <option value={1200}>Slow</option>
                    </select>
                  </div>

                  <div className="font-mono px-4 py-2 bg-theme-secondary border border-theme-primary rounded-lg text-center min-w-20">
                    <div className="text-accent-primary font-bold">{currentStep + 1}</div>
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
                    className="bg-gradient-to-r from-accent-primary500 to-purple500 h-2 rounded-full transition-all duration-500 shadow-lg shadow-indigo-500/25"
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
                    <Code2 className="h-5 w-5 text-accent-primary" />
                    <h3 className="font-semibold text-theme-secondary">Algorithm Code</h3>
                  </div>
                  <div className="bg-theme-secondary rounded-xl border border-theme-primary p-4 font-mono text-sm">
                    {CODE_SNIPPETS[activeLang].map((codeLine) => (
                      <CodeLine 
                        key={codeLine.l} 
                        lineNum={codeLine.l} 
                        content={codeLine.t}
                        isActive={line === codeLine.l}
                        isHighlighted={[3, 4, 5, 6].includes(codeLine.l)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Visualization Panel */}
              <div className="xl:col-span-2 space-y-6">
                {/* Bit Visualization */}
                <div className="bg-theme-tertiary/50 backdrop-blur-sm rounded-2xl p-6 border border-theme-primary">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-xl text-theme-secondary flex items-center gap-3">
                      <Binary className="h-6 w-6 text-accent-primary" />
                      Bit Reversal Process
                    </h3>
                    <div className="text-sm text-theme-tertiary font-mono bg-theme-secondary/50 px-3 py-1 rounded-full">
                      Step {currentStep + 1}
                    </div>
                  </div>

                  <div className="space-y-8">
                    {/* Original Number */}
                    <div>
                      <h4 className="text-lg font-semibold text-accent-primary300 mb-3 flex items-center gap-2">
                        <Gauge className="h-5 w-5" />
                        Original Number
                      </h4>
                      <div className="flex gap-1 flex-wrap justify-center">
                        {originalBinary.split('').map((bit, index) => {
                          const isCurrentBit = currentBit !== null && index === (31 - currentBit);
                          return (
                            <div
                              key={index}
                              className={`w-8 h-10 flex items-center justify-center rounded font-mono text-sm font-bold transition-all duration-300 ${
                                isCurrentBit 
                                  ? "bg-gradient-to-br from-accent-primary500 to-purple600 text-theme-primary shadow-lg scale-110 border-2 border-warning" 
                                  : bit === '1' 
                                  ? "bg-accent-primary-hover text-theme-primary" 
                                  : "bg-theme-elevated text-theme-tertiary"
                              }`}
                            >
                              {bit}
                            </div>
                          );
                        })}
                      </div>
                      <div className="text-center mt-3 text-sm text-theme-tertiary">
                        Decimal: <span className="text-accent-primary300 font-mono">{number}</span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex justify-center">
                      <div className="p-3 bg-gradient-to-br from-accent-primary500 to-purple600 rounded-full">
                        <FlipHorizontal className="h-6 w-6 text-theme-primary" />
                      </div>
                    </div>

                    {/* Result Number */}
                    <div>
                      <h4 className="text-lg font-semibold text-purple300 mb-3 flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Reversed Result
                      </h4>
                      <div className="flex gap-1 flex-wrap justify-center">
                        {resultBinary.split('').map((bit, index) => (
                          <div
                            key={index}
                            className={`w-8 h-10 flex items-center justify-center rounded font-mono text-sm font-bold transition-all duration-300 ${
                              bit === '1' 
                                ? "bg-purple600 text-theme-primary" 
                                : "bg-theme-elevated text-theme-tertiary"
                            }`}
                          >
                            {bit}
                          </div>
                        ))}
                      </div>
                      <div className="text-center mt-3 text-sm text-theme-tertiary">
                        Decimal: <span className="text-purple300 font-mono">{result}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Explanation & Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-accent-primary900/40 to-purple900/40 backdrop-blur-sm p-6 rounded-2xl border border-accent-primary700/50">
                    <h3 className="font-bold text-xl text-accent-primary300 mb-4 flex items-center gap-3">
                      <Cpu className="h-5 w-5" />
                      Step Explanation
                    </h3>
                    <div className="text-theme-secondary text-sm leading-relaxed h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 p-2">
                      {message.split('\n').map((line, i) => (
                        <div key={i} className="mb-2 last:mb-0">
                          {line}
                        </div>
                      ))}
                    </div>
                    {phase === "complete" && (
                      <div className="mt-4 p-3 bg-success-light rounded-lg border border-success/30">
                        <div className="text-success text-sm font-semibold flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Bit Reversal Complete!
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-gradient-to-br from-purple900/40 to-pink900/40 backdrop-blur-sm p-6 rounded-2xl border border-purple700/50">
                    <h3 className="font-bold text-xl text-purple300 mb-4 flex items-center gap-3">
                      <CheckCircle className="h-5 w-5" />
                      Current State
                    </h3>
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between items-center py-2 border-b border-purple700/30">
                        <span className="text-theme-secondary">Current Bit</span>
                        <span className="font-mono font-bold text-warning">
                          {currentBit !== null ? currentBit : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-purple700/30">
                        <span className="text-theme-secondary">Phase</span>
                        <span className="font-mono font-bold text-accent-primary capitalize">
                          {phase.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-purple700/30">
                        <span className="text-theme-secondary">Steps Completed</span>
                        <span className="font-mono font-bold text-accent-primary">
                          {currentStep + 1}/{history.length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-theme-secondary">Active Line</span>
                        <span className="font-mono font-bold text-success">
                          {line || "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Complexity Analysis */}
                <div className="bg-theme-tertiary/50 backdrop-blur-sm rounded-2xl p-6 border border-theme-primary">
                  <h3 className="font-bold text-xl text-accent-primary mb-6 flex items-center gap-3">
                    <Zap className="h-6 w-6" />
                    Algorithm Analysis
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-accent-primary300 text-lg">Time Complexity</h4>
                      <div className="bg-theme-secondary/50 p-4 rounded-xl border border-theme-primary">
                        <div className="text-2xl font-bold text-success text-center mb-2">O(1)</div>
                        <p className="text-theme-tertiary text-sm text-center">
                          Always processes exactly 32 bits regardless of input
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-purple300 text-lg">Space Complexity</h4>
                      <div className="bg-theme-secondary/50 p-4 rounded-xl border border-theme-primary">
                        <div className="text-2xl font-bold text-success text-center mb-2">O(1)</div>
                        <p className="text-theme-tertiary text-sm text-center">
                          Uses only a few variables for computation
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-theme-secondary/30 rounded-xl border border-theme-primary">
                    <h5 className="font-semibold text-orange300 mb-2">Key Insight</h5>
                    <p className="text-theme-tertiary text-sm">
                      The algorithm processes bits from right to left of the original number and builds the result 
                      from left to right by shifting and bitwise OR operations.
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

export default ReverseBits;