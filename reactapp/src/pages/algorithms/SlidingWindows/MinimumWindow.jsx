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
  Type,
  Hash,
  Map,
} from "lucide-react";

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

const MinimumWindow = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [sInput, setSInput] = useState("ADOBECODEBANC");
  const [tInput, setTInput] = useState("ABC");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [windowStyle, setWindowStyle] = useState({});
  const visualizerRef = useRef(null);

  const generateHistory = useCallback((s, t) => {
    const newHistory = [];
    let stepCount = 0;
    
    const tCount = {};
    const windowCount = {};
    let have = 0;
    let need = 0;
    let left = 0;
    let right = 0;
    let result = [-1, -1];
    let resultLen = Infinity;

    // Initialize t character counts
    for (let char of t) {
      tCount[char] = (tCount[char] || 0) + 1;
    }
    need = Object.keys(tCount).length;

    const addState = (props) => {
      newHistory.push({
        s,
        t,
        left,
        right,
        have,
        need,
        windowCount: { ...windowCount },
        tCount: { ...tCount },
        result: [...result],
        resultLen,
        explanation: "",
        step: stepCount++,
        ...props,
      });
    };

    addState({
      line: 2,
      explanation: `Initializing variables. Need to find characters: ${t}. Need count: ${need}`,
    });

    for (right = 0; right < s.length; right++) {
      const char = s[right];
      
      addState({
        line: 4,
        right,
        left,
        explanation: `Right pointer at index ${right}, character '${char}'`,
      });

      if (tCount[char]) {
        windowCount[char] = (windowCount[char] || 0) + 1;
        
        addState({
          line: 6,
          right,
          left,
          explanation: `Character '${char}' is in t. Window count for '${char}': ${windowCount[char]}`,
        });

        if (windowCount[char] === tCount[char]) {
          have++;
          addState({
            line: 8,
            right,
            left,
            explanation: `Window now has required count for '${char}'. Have count: ${have}/${need}`,
          });
        }
      }

      addState({
        line: 11,
        right,
        left,
        explanation: `Checking if current window [${left}, ${right}] contains all characters (have: ${have}, need: ${need})`,
      });

      while (have === need) {
        addState({
          line: 12,
          right,
          left,
          explanation: `Window [${left}, ${right}] contains all characters! Current substring: "${s.substring(left, right + 1)}"`,
        });

        // Update result if this window is smaller
        if ((right - left + 1) < resultLen) {
          resultLen = right - left + 1;
          result = [left, right];
          addState({
            line: 13,
            right,
            left,
            explanation: `New minimum window found: "${s.substring(left, right + 1)}" (length: ${resultLen})`,
            newMinWindow: true,
          });
        }

        // Remove left character from window
        const leftChar = s[left];
        
        addState({
          line: 17,
          right,
          left,
          explanation: `Shrinking window from left. Removing character '${leftChar}'`,
        });

        if (tCount[leftChar]) {
          windowCount[leftChar]--;
          
          addState({
            line: 19,
            right,
            left,
            explanation: `Character '${leftChar}' is in t. Window count for '${leftChar}': ${windowCount[leftChar]}`,
          });

          if (windowCount[leftChar] < tCount[leftChar]) {
            have--;
            addState({
              line: 21,
              right,
              left,
              explanation: `Window no longer has required count for '${leftChar}'. Have count: ${have}/${need}`,
            });
          }
        }
        
        left++;
        addState({
          line: 25,
          right,
          left,
          explanation: `Left pointer moved to ${left}. Continuing to search for smaller windows...`,
        });
      }
    }

    addState({
      line: 29,
      finished: true,
      explanation: resultLen === Infinity 
        ? `No window found containing all characters of "${t}"`
        : `Minimum window found: "${s.substring(result[0], result[1] + 1)}" from indices [${result[0]}, ${result[1]}]`,
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

  const loadStrings = () => {
    const s = sInput.trim();
    const t = tInput.trim();

    if (!s || !t) {
      alert("Please enter both string s and string t.");
      return;
    }

    if (t.length > s.length) {
      alert("String t cannot be longer than string s.");
      return;
    }

    setIsLoaded(true);
    generateHistory(s, t);
  };

  const generateRandomStrings = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const sLength = Math.floor(Math.random() * 4) + 8; // 8-12 characters
    const tLength = Math.floor(Math.random() * 3) + 2;   // 2-5 characters
    
    let s = '';
    for (let i = 0; i < sLength; i++) {
      s += characters[Math.floor(Math.random() * characters.length)];
    }
    
    let t = '';
    for (let i = 0; i < tLength; i++) {
      t += characters[Math.floor(Math.random() * characters.length)];
    }
    
    setSInput(s);
    setTInput(t);
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
    if (isLoaded && state.left !== null && state.right !== null) {
      const container = document.getElementById("string-container");
      const startEl = document.getElementById(
        `string-container-element-${state.left}`
      );
      const endEl = document.getElementById(
        `string-container-element-${state.right}`
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
          backgroundColor: state.newMinWindow 
            ? "rgba(34, 197, 94, 0.1)" 
            : "rgba(56, 189, 248, 0.1)",
          border: state.newMinWindow 
            ? "2px solid rgba(34, 197, 94, 0.5)"
            : "2px solid rgba(56, 189, 248, 0.5)",
          borderRadius: "12px",
          transition: "all 300ms ease-out",
          opacity: 1,
        });
      }
    } else {
      setWindowStyle({ opacity: 0 });
    }
  }, [currentStep, isLoaded, state.left, state.right, state.newMinWindow]);

  const CodeLine = ({ lineNum, content }) => (
    <div
      className={`block rounded-md transition-all duration-300 ${
        state.line === lineNum
          ? "bg-success-light border-l-4 border-success shadow-lg"
          : "hover:bg-theme-elevated/30"
      }`}
    >
      <span className="text-theme-muted select-none inline-block w-8 text-right mr-3">
        {lineNum}
      </span>
      <span className={state.line === lineNum ? "text-success font-semibold" : "text-theme-secondary"}>
        {content}
      </span>
    </div>
  );

  const minimumWindowCode = [
    { line: 1, content: "string minWindow(string s, string t) {" },
    { line: 2, content: "    unordered_map<char, int> tCount, windowCount;" },
    { line: 3, content: "    for (char c : t) tCount[c]++;" },
    { line: 4, content: "    int left = 0, right = 0;" },
    { line: 5, content: "    int have = 0, need = tCount.size();" },
    { line: 6, content: "    vector<int> result = {-1, -1};" },
    { line: 7, content: "    int resultLen = INT_MAX;" },
    { line: 8, content: "" },
    { line: 9, content: "    for (right = 0; right < s.length(); right++) {" },
    { line: 10, content: "        char c = s[right];" },
    { line: 11, content: "        if (tCount.count(c)) {" },
    { line: 12, content: "            windowCount[c]++;" },
    { line: 13, content: "            if (windowCount[c] == tCount[c]) have++;" },
    { line: 14, content: "        }" },
    { line: 15, content: "" },
    { line: 16, content: "        while (have == need) {" },
    { line: 17, content: "            if ((right - left + 1) < resultLen) {" },
    { line: 18, content: "                result = {left, right};" },
    { line: 19, content: "                resultLen = right - left + 1;" },
    { line: 20, content: "            }" },
    { line: 21, content: "" },
    { line: 22, content: "            char leftChar = s[left];" },
    { line: 23, content: "            if (tCount.count(leftChar)) {" },
    { line: 24, content: "                windowCount[leftChar]--;" },
    { line: 25, content: "                if (windowCount[leftChar] < tCount[leftChar]) have--;" },
    { line: 26, content: "            }" },
    { line: 27, content: "            left++;" },
    { line: 28, content: "        }" },
    { line: 29, content: "    }" },
    { line: 30, content: "" },
    { line: 31, content: "    return resultLen == INT_MAX ? \"\" : s.substr(result[0], resultLen);" },
    { line: 32, content: "}" },
  ];

  const getCharColor = (index, char) => {
    const isInWindow = index >= state.left && index <= state.right;
    const isInT = state.tCount && state.tCount[char];
    const isCurrentLeft = index === state.left;
    const isCurrentRight = index === state.right;
    const isInResult = index >= state.result?.[0] && index <= state.result?.[1];

    if (isCurrentLeft && isCurrentRight) {
      return "bg-gradient-to-br from-warning to-orange500 text-theme-primary border-warning shadow-lg shadow-warning/50";
    } else if (isCurrentLeft) {
      return "bg-gradient-to-br from-danger400 to-pink500 text-theme-primary border-danger shadow-lg shadow-red-500/50";
    } else if (isCurrentRight) {
      return "bg-gradient-to-br from-accent-primary400 to-teal500 text-theme-primary border-accent-primary shadow-lg shadow-blue-500/50";
    } else if (isInResult && isInT) {
      return "bg-gradient-to-br from-success400 to-success500 text-theme-primary border-success shadow-lg shadow-green-500/50";
    } else if (isInResult) {
      return "bg-gradient-to-br from-success400 to-success500 text-theme-primary border-success";
    } else if (isInWindow && isInT) {
      return "bg-gradient-to-br from-purple400 to-accent-primary500 text-theme-primary border-purple shadow-lg";
    } else if (isInWindow) {
      return "bg-theme-elevated border-accent-primary shadow-lg";
    } else if (isInT) {
      return "bg-theme-elevated border-purple";
    }
    return "bg-theme-elevated/50 border-theme-primary hover:bg-theme-elevated/50";
  };

  const currentWindow = state.s ? state.s.substring(state.left, state.right + 1) : "";
  const minWindow = state.s && state.result?.[0] !== -1 
    ? state.s.substring(state.result[0], state.result[1] + 1)
    : "";

  return (
    <div
      ref={visualizerRef}
      tabIndex={0}
      className="p-4 max-w-7xl mx-auto focus:outline-none"
    >
      <header className="text-center mb-6">
        <h1 className="text-5xl font-bold text-success flex items-center justify-center gap-3">
          <Search size={28} />
          Minimum Window Substring
        </h1>
        <p className="text-lg text-theme-tertiary mt-2">
          Find the minimum window in string s that contains all characters of string t (LeetCode #76)
        </p>
      </header>

      {/* Enhanced Controls Section */}
      <div className="bg-theme-tertiary/50 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-theme-primary/50 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 flex-grow">
          <div className="flex items-center gap-4 flex-grow">
            <label htmlFor="s-input" className="font-medium text-theme-secondary font-mono hidden md:block">
              String s:
            </label>
            <input
              id="s-input"
              type="text"
              value={sInput}
              onChange={(e) => setSInput(e.target.value)}
              disabled={isLoaded}
              placeholder="e.g., ADOBECODEBANC"
              className="font-mono flex-grow bg-theme-secondary border border-theme-primary rounded-lg p-3 focus:ring-2 focus:ring-success focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
          <div className="flex items-center gap-4 flex-grow">
            <label htmlFor="t-input" className="font-medium text-theme-secondary font-mono hidden md:block">
              String t:
            </label>
            <input
              id="t-input"
              type="text"
              value={tInput}
              onChange={(e) => setTInput(e.target.value)}
              disabled={isLoaded}
              placeholder="e.g., ABC"
              className="font-mono flex-grow bg-theme-secondary border border-theme-primary rounded-lg p-3 focus:ring-2 focus:ring-success focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
          {!isLoaded ? (
            <>
              <button
                onClick={loadStrings}
                className="bg-success hover:bg-success-hover text-theme-primary font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer"
              >
                Load & Visualize
              </button>
              <button
                onClick={generateRandomStrings}
                className="bg-purplehover hover:bg-purple700 text-theme-primary font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer"
              >
                Random Strings
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
                    className="bg-accent-primary hover:bg-accent-primary-hover p-3 rounded-lg disabled:opacity-50 transition-all duration-300 cursor-pointer"
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

      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pseudocode Panel */}
          <div className="lg:col-span-1 bg-theme-tertiary/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-theme-primary/50">
            <h3 className="font-bold text-xl text-success mb-4 border-b border-theme-primary/50 pb-3 flex items-center gap-2">
              <Code size={20} />
              Sliding Window Code
            </h3>
            <div className="overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <pre className="text-sm">
                <code className="font-mono leading-relaxed block">
                  {minimumWindowCode.map((codeLine) => (
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
            {/* String Visualization */}
            <div className="bg-theme-tertiary/50 backdrop-blur-sm p-6 rounded-xl border border-theme-primary/50 shadow-2xl">
              <h3 className="font-bold text-lg text-theme-secondary mb-6 flex items-center gap-2">
                <Type size={20} />
                String Visualization
                {state.s?.length > 0 && (
                  <span className="text-sm text-theme-tertiary ml-2">
                    (s: {state.s.length} chars, t: {state.t} chars)
                  </span>
                )}
              </h3>
              
              <div className="flex flex-col items-center space-y-6">
                {/* String with indices */}
                <div className="relative" id="string-container">
                  {/* Column headers */}
                  <div className="flex gap-2 mb-2 justify-center">
                    {state.s?.split('').map((_, index) => (
                      <div key={index} className="w-10 text-center text-xs text-theme-muted font-mono">
                        {index}
                      </div>
                    ))}
                  </div>
                  
                  {/* String characters */}
                  <div className="flex gap-2 justify-center">
                    {state.s?.split('').map((char, index) => (
                      <div
                        key={index}
                        id={`string-container-element-${index}`}
                        className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center font-bold text-lg transition-all duration-500 transform ${getCharColor(index, char)} ${
                          (index >= state.left && index <= state.right) ? 'scale-110' : 'scale-100'
                        }`}
                      >
                        {char}
                      </div>
                    ))}
                  </div>

                  {/* Window overlay */}
                  <div style={windowStyle} />

                  {/* Pointers */}
                  {state.left !== null && (
                    <Pointer
                      index={state.left}
                      containerId="string-container"
                      color="red"
                      label="left"
                    />
                  )}
                  {state.right !== null && (
                    <Pointer
                      index={state.right}
                      containerId="string-container"
                      color="blue"
                      label="right"
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
                      <div className="font-mono text-success">
                        [{state.left}, {state.right}]
                      </div>
                    </div>
                    <div>
                      <div className="text-theme-muted">Substring:</div>
                      <div className="font-mono text-success">
                        "{currentWindow}"
                      </div>
                    </div>
                    <div>
                      <div className="text-theme-muted">Length:</div>
                      <div className="font-mono text-success">
                        {currentWindow.length}
                      </div>
                    </div>
                    <div>
                      <div className="text-theme-muted">Have/Need:</div>
                      <div className="font-mono text-success">
                        {state.have}/{state.need}
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
                  <Hash size={20} />
                  Character Matching
                </h3>
                <div className="text-center">
                  <span className="font-mono text-4xl font-bold text-accent-primary">
                    {state.have ?? 0}
                  </span>
                  <span className="text-theme-tertiary text-2xl mx-2">/</span>
                  <span className="font-mono text-4xl font-bold text-theme-secondary">
                    {state.need ?? 0}
                  </span>
                </div>
                <div className="text-xs text-theme-tertiary text-center mt-2">
                  Characters satisfied
                </div>
                <div className="w-full bg-theme-elevated rounded-full h-2 mt-3">
                  <div
                    className="bg-gradient-to-r from-accent-primary500 to-teal500 h-2 rounded-full transition-all duration-500 shadow-lg shadow-accent-primary/25"
                    style={{ width: `${Math.min(((state.have ?? 0) / Math.max(state.need ?? 1, 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple900/40 to-purple800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-purple700/50">
                <h3 className="font-bold text-lg text-purple mb-3 flex items-center gap-2">
                  <Map size={20} />
                  Current Window
                </h3>
                <div className="font-mono text-4xl font-bold text-center text-purple">
                  {currentWindow.length}
                </div>
                <div className="text-xs text-theme-tertiary text-center mt-2">
                  characters
                </div>
                <div className="text-sm text-purple200 text-center mt-2">
                  "{currentWindow}"
                </div>
              </div>

              <div className="bg-gradient-to-br from-success900/40 to-success800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-success700/50">
                <h3 className="font-bold text-lg text-success mb-3 flex items-center gap-2">
                  <CheckCircle size={20} />
                  Minimum Found
                </h3>
                <div className="font-mono text-4xl font-bold text-center text-success">
                  {minWindow.length || 0}
                </div>
                <div className="text-xs text-theme-tertiary text-center mt-2">
                  characters
                </div>
                <div className="text-sm text-success200 text-center mt-2">
                  {minWindow ? `"${minWindow}"` : "Not found"}
                </div>
              </div>
            </div>

            {/* Character Counts */}
            <div className="bg-gradient-to-br from-orange900/40 to-warning800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-orange700/50">
              <h3 className="font-bold text-lg text-orange300 mb-3 flex items-center gap-2">
                <Gauge size={20} />
                Character Counts
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {state.tCount && Object.entries(state.tCount).map(([char, required]) => (
                  <div key={char} className="flex flex-col items-center">
                    <div className="font-mono text-lg font-bold text-orange">
                      '{char}'
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-theme-tertiary">Need:</span>
                      <span className="font-mono text-orange300">{required}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-theme-tertiary">Have:</span>
                      <span className={`font-mono ${
                        (state.windowCount?.[char] || 0) >= required 
                          ? "text-success" 
                          : "text-danger"
                      }`}>
                        {state.windowCount?.[char] || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status and Explanation Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-success900/40 to-success900/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-success700/50">
                <h3 className="font-bold text-lg text-success mb-3 flex items-center gap-2">
                  <Calculator size={20} />
                  Current State
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    Left Pointer: <span className="font-mono font-bold text-danger">{state.left}</span>
                  </p>
                  <p>
                    Right Pointer: <span className="font-mono font-bold text-accent-primary">{state.right}</span>
                  </p>
                  <p>
                    Characters Matched: <span className="font-mono font-bold text-success">
                      {state.have}/{state.need}
                    </span>
                  </p>
                  <p>
                    Window Valid: <span className={`font-mono font-bold ${
                      state.have === state.need ? "text-success" : "text-danger"
                    }`}>
                      {state.have === state.need ? "Yes" : "No"}
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
            <h3 className="font-bold text-xl text-success mb-4 border-b border-theme-primary/50 pb-3 flex items-center gap-2">
              <Clock size={20} /> Complexity Analysis
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <h4 className="font-semibold text-success flex items-center gap-2">
                  <Zap size={16} />
                  Time Complexity
                </h4>
                <div className="space-y-3">
                  <div className="bg-theme-secondary/50 p-3 rounded-lg border border-theme-primary">
                    <strong className="text-teal300 font-mono block mb-1">O(|s| + |t|)</strong>
                    <p className="text-theme-tertiary text-sm">
                      We iterate through string s with two pointers (left and right), 
                      and each character is processed at most twice. The hash map operations 
                      are O(1) on average.
                    </p>
                  </div>
                  <div className="bg-theme-secondary/50 p-3 rounded-lg border border-theme-primary">
                    <strong className="text-teal300 font-mono block mb-1">Why O(|s| + |t|)?</strong>
                    <p className="text-theme-tertiary text-sm">
                      We build the frequency map for t (O(|t|)) and then process 
                      each character in s at most twice (O(2|s|)), giving us O(|s| + |t|).
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-success flex items-center gap-2">
                  <Cpu size={16} />
                  Space Complexity
                </h4>
                <div className="space-y-3">
                  <div className="bg-theme-secondary/50 p-3 rounded-lg border border-theme-primary">
                    <strong className="text-teal300 font-mono block mb-1">O(|t|)</strong>
                    <p className="text-theme-tertiary text-sm">
                      We use hash maps to store character frequencies for t and the 
                      current window. In the worst case, this stores all unique 
                      characters from t.
                    </p>
                  </div>
                  <div className="bg-theme-secondary/50 p-3 rounded-lg border border-theme-primary">
                    <strong className="text-teal300 font-mono block mb-1">Optimization</strong>
                    <p className="text-theme-tertiary text-sm">
                      The algorithm uses the sliding window technique to efficiently 
                      find the minimum window without checking all possible substrings.
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
            Enter strings s and t to start the visualization
          </div>
          <div className="text-theme-muted text-sm max-w-2xl mx-auto space-y-2">
            <div className="flex items-center justify-center gap-4 text-xs mb-4">
              <span className="bg-success-light text-success px-3 py-1 rounded-full">s: main string</span>
              <span className="bg-accent-primary-light text-accent-primary px-3 py-1 rounded-full">t: target characters</span>
            </div>
            <p>
              <strong>Example:</strong> s: "ADOBECODEBANC", t: "ABC" → Returns "BANC"
            </p>
            <p className="text-theme-muted">
              The algorithm finds the smallest substring in s that contains all characters of t.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MinimumWindow;