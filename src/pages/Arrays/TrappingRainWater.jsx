import React, { useState, useEffect, useCallback } from "react";
import { useModeHistorySwitch } from "../../hooks/useModeHistorySwitch";
import {
  Code,
  CheckCircle,
  List,
  Calculator,
  Layers,
  BarChart3,
  Clock,
  Droplets,
} from "lucide-react";
import VisualizerPointer from "../../components/VisualizerPointer";

// Main Visualizer Component
const TrappingRainWater = () => {
  const [mode, setMode] = useState("brute-force");
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [heightsInput, setHeightsInput] = useState("0,1,0,2,1,0,1,3,2,1,2,1");
  const [isLoaded, setIsLoaded] = useState(false);
  const [maxHeight, setMaxHeight] = useState(1);
  const [codeLang, setCodeLang] = useState("cpp");

  const generateBruteForceHistory = useCallback((heights) => {
    const n = heights.length;
    const newHistory = [];
    let totalWater = 0;
    let waterLevels = new Array(n).fill(0);

    const addState = (props) =>
      newHistory.push({
        heights,
        totalWater,
        waterLevels: [...waterLevels],
        i: null,
        j: null,
        lmax: 0,
        rmax: 0,
        explanation: "",
        ...props,
      });

    addState({ line: 4, explanation: "Initialize total trapped water to 0." });
    for (let i = 1; i < n - 1; i++) {
      addState({
        line: 5,
        i,
        explanation: `Start main loop. Evaluating bar at index ${i}.`,
      });
      let lmax = 0;
      addState({
        line: 6,
        i,
        lmax,
        explanation: `Find max height to the left of index ${i}.`,
      });
      for (let j = i; j >= 0; j--) {
        lmax = Math.max(lmax, heights[j]);
        addState({
          line: 7,
          i,
          j,
          lmax,
          explanation: `Scanning left... Current lmax = ${lmax}.`,
        });
      }

      let rmax = 0;
      addState({
        line: 10,
        i,
        lmax,
        rmax,
        explanation: `Find max height to the right of index ${i}.`,
      });
      for (let j = i; j < n; j++) {
        rmax = Math.max(rmax, heights[j]);
        addState({
          line: 11,
          i,
          j,
          lmax,
          rmax,
          explanation: `Scanning right... Current rmax = ${rmax}.`,
        });
      }

      const water = Math.min(lmax, rmax) - heights[i];
      if (water > 0) {
        totalWater += water;
        waterLevels[i] = water;
      }
      addState({
        line: 14,
        i,
        lmax,
        rmax,
        explanation: `Water at index ${i} = min(${lmax}, ${rmax}) - height[${i}] = ${
          water > 0 ? water : 0
        }.`,
      });
      addState({
        line: 15,
        i,
        lmax,
        rmax,
        explanation: `Total trapped water is now ${totalWater}.`,
      });
    }
    addState({
      line: 18,
      finished: true,
      explanation: "Finished calculation. Returning total trapped water.",
    });
    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const generateOptimalHistory = useCallback((heights) => {
    const n = heights.length;
    if (n === 0) {
      setHistory([]);
      setCurrentStep(-1);
      return;
    }
    const newHistory = [];
    let lmax = new Array(n).fill(0);
    let rmax = new Array(n).fill(0);
    let totalWater = 0;
    let waterLevels = new Array(n).fill(0);

    const addState = (props) =>
      newHistory.push({
        heights,
        totalWater,
        waterLevels: [...waterLevels],
        lmax: [...lmax],
        rmax: [...rmax],
        i: null,
        explanation: "",
        ...props,
      });

    addState({
      line: 4,
      explanation: "Initialize left-max and right-max arrays.",
    });

    lmax[0] = heights[0];
    addState({
      line: 7,
      i: 0,
      explanation: `lmax[0] is set to height[0] = ${lmax[0]}.`,
    });
    for (let i = 1; i < n; i++) {
      lmax[i] = Math.max(lmax[i - 1], heights[i]);
      addState({
        line: 10,
        i,
        explanation: `lmax[${i}] = max(lmax[${i - 1}], height[${i}]) = max(${
          lmax[i - 1]
        }, ${heights[i]}) = ${lmax[i]}.`,
      });
    }

    rmax[n - 1] = heights[n - 1];
    addState({
      line: 13,
      i: n - 1,
      explanation: `rmax[n-1] is set to height[n-1] = ${rmax[n - 1]}.`,
    });
    for (let i = n - 2; i >= 0; i--) {
      rmax[i] = Math.max(rmax[i + 1], heights[i]);
      addState({
        line: 16,
        i,
        explanation: `rmax[${i}] = max(rmax[${i + 1}], height[${i}]) = max(${
          rmax[i + 1]
        }, ${heights[i]}) = ${rmax[i]}.`,
      });
    }

    addState({
      line: 19,
      explanation:
        "All prefix and suffix maxes calculated. Now, find the water.",
    });
    for (let i = 0; i < n; i++) {
      const water = Math.min(lmax[i], rmax[i]) - heights[i];
      if (water > 0) {
        totalWater += water;
        waterLevels[i] = water;
      }
      addState({
        line: 20,
        i,
        explanation: `Water at index ${i} = min(lmax[${i}], rmax[${i}]) - height[${i}] = min(${
          lmax[i]
        }, ${rmax[i]}) - ${heights[i]} = ${
          water > 0 ? water : 0
        }. Total = ${totalWater}`,
      });
    }

    addState({
      line: 23,
      finished: true,
      explanation: "Finished calculation. Returning total trapped water.",
    });
    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const loadArray = () => {
    const localHeights = heightsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);
    if (localHeights.some(isNaN)) {
      alert("Invalid input. Please use comma-separated numbers.");
      return;
    }
    setMaxHeight(Math.max(...localHeights, 1));
    setIsLoaded(true);
    mode === "brute-force"
      ? generateBruteForceHistory(localHeights)
      : generateOptimalHistory(localHeights);
  };

  const reset = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
  };
  const parseInput = useCallback(() => {
    const localHeights = heightsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);
    if (localHeights.some(isNaN) || localHeights.length < 2)
      throw new Error("Invalid input");
    return localHeights;
  }, [heightsInput]);
  const handleModeChange = useModeHistorySwitch({
    mode,
    setMode,
    isLoaded,
    parseInput,
    generators: {
      "brute-force": (h) => generateBruteForceHistory(h),
      optimal: (h) => generateOptimalHistory(h),
    },
    setCurrentStep,
    onError: () => {},
  });
  const stepForward = useCallback(
    () => setCurrentStep((prev) => Math.min(prev + 1, history.length - 1)),
    [history.length]
  );
  const stepBackward = useCallback(
    () => setCurrentStep((prev) => Math.max(prev - 1, 0)),
    []
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isLoaded) {
        if (e.key === "ArrowLeft") stepBackward();
        if (e.key === "ArrowRight") stepForward();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoaded, stepForward, stepBackward]);

  const state = history[currentStep] || {};
  const { heights = [], waterLevels = [] } = state;

  const colorMapping = {
    purple: "text-purple",
    cyan: "text-teal",
    "light-blue": "text-accent-primary300",
    yellow: "text-warning",
    orange: "text-orange",
    red: "text-danger",
    "light-gray": "text-theme-tertiary",
    green: "text-success",
    "": "text-theme-secondary",
  };
  const CodeLine = ({ line, content }) => (
    <div
      className={`block rounded-md transition-colors ${
        state.line === line ? "bg-accent-primary-light" : ""
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

  const bruteForceCode = [
    {
      l: 4,
      c: [
        { t: "int", c: "cyan" },
        { t: " totalWater = ", c: "" },
        { t: "0", c: "orange" },
        { t: ";", c: "light-gray" },
      ],
    },
    {
      l: 5,
      c: [
        { t: "for", c: "purple" },
        { t: " (int i = 1; i < n - 1; i++) {", c: "" },
      ],
    },
    {
      l: 6,
      c: [
        { t: "  int", c: "cyan" },
        { t: " lmax = ", c: "" },
        { t: "0", c: "orange" },
        { t: ";", c: "light-gray" },
      ],
    },
    {
      l: 7,
      c: [
        { t: "  for", c: "purple" },
        { t: " (int j = i; j >= 0; j--)", c: "" },
        { t: " lmax = max(lmax, height[j]);", c: "" },
      ],
    },
    {
      l: 10,
      c: [
        { t: "  int", c: "cyan" },
        { t: " rmax = ", c: "" },
        { t: "0", c: "orange" },
        { t: ";", c: "light-gray" },
      ],
    },
    {
      l: 11,
      c: [
        { t: "  for", c: "purple" },
        { t: " (int j = i; j < n; j++)", c: "" },
        { t: " rmax = max(rmax, height[j]);", c: "" },
      ],
    },
    {
      l: 14,
      c: [
        { t: "  int", c: "cyan" },
        { t: " water = min(lmax, rmax) - height[i];", c: "" },
      ],
    },
    {
      l: 15,
      c: [
        { t: "  if", c: "purple" },
        { t: " (water > 0) totalWater += water;", c: "" },
      ],
    },
    { l: 17, c: [{ t: "}", c: "light-gray" }] },
    {
      l: 18,
      c: [
        { t: "return", c: "purple" },
        { t: " totalWater;", c: "" },
      ],
    },
  ];

  const optimalCode = [
    {
      l: 3,
      c: [
        { t: "int", c: "cyan" },
        { t: " n = height.size();", c: "" },
      ],
    },
    {
      l: 4,
      c: [
        { t: "vector<", c: "yellow" },
        { t: "int", c: "cyan" },
        { t: "> lmax(n,0), rmax(n,0);", c: "" },
      ],
    },
    { l: 7, c: [{ t: "lmax[0] = height[0];", c: "" }] },
    {
      l: 9,
      c: [
        { t: "for", c: "purple" },
        { t: " (int i=1; i<n; i++){", c: "" },
      ],
    },
    { l: 10, c: [{ t: "  lmax[i] = max(lmax[i-1], height[i]);", c: "" }] },
    { l: 11, c: [{ t: "}", c: "light-gray" }] },
    { l: 13, c: [{ t: "rmax[n-1] = height[n-1];", c: "" }] },
    {
      l: 15,
      c: [
        { t: "for", c: "purple" },
        { t: " (int i=n-2; i>=0; i--){", c: "" },
      ],
    },
    { l: 16, c: [{ t: "  rmax[i] = max(rmax[i+1], height[i]);", c: "" }] },
    { l: 17, c: [{ t: "}", c: "light-gray" }] },
    {
      l: 19,
      c: [
        { t: "int", c: "cyan" },
        { t: " ans = ", c: "" },
        { t: "0", c: "orange" },
        { t: ";", c: "light-gray" },
      ],
    },
    {
      l: 20,
      c: [
        { t: "for", c: "purple" },
        {
          t: " (int i=0; i<n; i++) ans += min(lmax[i], rmax[i]) - height[i];",
          c: "",
        },
      ],
    },
    {
      l: 23,
      c: [
        { t: "return", c: "purple" },
        { t: " ans;", c: "" },
      ],
    },
  ];

  //Java
  const javaOptimalCode = [
    {
      l: 1,
      c: [
        { t: "public static int ", c: "purple" },
        { t: "TrappingRainWater", c: "yellow" },
        { t: "(int height[]){", c: "" },
        { t: " // T.C. O(n)", c: "light-gray" },
      ],
    },
    { l: 2, c: [{ t: "    int n = height.length;", c: "" }] },
    { l: 4, c: [{ t: "    int leftMax[] = new int[n];", c: "" }] },
    { l: 5, c: [{ t: "    leftMax[0] = height[0];", c: "" }] },
    {
      l: 7,
      c: [
        { t: "    for", c: "purple" },
        { t: " (int i = 1; i < n; i++)", c: "" },
        { t: " leftMax[i] = Math.max(height[i], leftMax[i-1]);", c: "" },
      ],
    },
    { l: 10, c: [{ t: "    int rightMax[] = new int[n];", c: "" }] },
    { l: 11, c: [{ t: "    rightMax[n-1] = height[n-1];", c: "" }] },
    {
      l: 13,
      c: [
        { t: "    for", c: "purple" },
        { t: " (int i = n-2; i >= 0; i--)", c: "" },
        { t: " rightMax[i] = Math.max(height[i], rightMax[i+1]);", c: "" },
      ],
    },
    { l: 16, c: [{ t: "    int trapperWater = 0;", c: "" }] },
    {
      l: 18,
      c: [
        { t: "    for", c: "purple" },
        { t: " (int i = 0; i < n; i++) {", c: "" },
      ],
    },
    {
      l: 19,
      c: [
        {
          t: "        int waterLevel = Math.min(leftMax[i], rightMax[i]);",
          c: "",
        },
      ],
    },
    {
      l: 20,
      c: [{ t: "        trapperWater += waterLevel - height[i];", c: "" }],
    },
    { l: 22, c: [{ t: "    }", c: "light-gray" }] },
    { l: 24, c: [{ t: "    return trapperWater;", c: "" }] },
    { l: 25, c: [{ t: "}", c: "light-gray" }] },
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-accent-primary">
          Trapping Rain Water
        </h1>
        <p className="text-lg text-theme-tertiary mt-2">Visualizing LeetCode 42</p>
      </header>

      <div className="bg-theme-tertiary p-4 rounded-lg shadow-xl border border-theme-primary flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-grow">
          <label
            htmlFor="heights-input"
            className="font-medium text-theme-secondary font-mono"
          >
            Heights:
          </label>
          <input
            id="heights-input"
            type="text"
            value={heightsInput}
            onChange={(e) => setHeightsInput(e.target.value)}
            disabled={isLoaded}
            className="font-mono flex-grow bg-theme-secondary border border-theme-primary rounded-md p-2 focus:ring-2 focus:ring-accent-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          {!isLoaded ? (
            <button
              onClick={loadArray}
              className="bg-accent-primary hover:bg-accent-primary-hover text-theme-primary font-bold py-2 px-4 rounded-lg cursor-pointer"
            >
              Load & Visualize
            </button>
          ) : (
            <>
              <button
                onClick={stepBackward}
                disabled={currentStep <= 0}
                className="bg-theme-elevated p-2 rounded-md disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
              <span className="font-mono w-24 text-center">
                {currentStep >= 0 ? currentStep + 1 : 0}/{history.length}
              </span>
              <button
                onClick={stepForward}
                disabled={currentStep >= history.length - 1}
                className="bg-theme-elevated p-2 rounded-md disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
          <button
            onClick={reset}
            className="ml-4 bg-danger-hover cursor-pointer hover:bg-danger-hover font-bold py-2 px-4 rounded-lg"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="flex border-b border-theme-primary mb-6">
        <div
          onClick={() => handleModeChange("brute-force")}
          className={`cursor-pointer p-3 px-6 border-b-4 transition-all ${
            mode === "brute-force"
              ? "border-accent-primary text-accent-primary"
              : "border-transparent text-theme-tertiary"
          }`}
        >
          Brute Force O(n²)
        </div>
        <div
          onClick={() => handleModeChange("optimal")}
          className={`cursor-pointer p-3 px-6 border-b-4 transition-all ${
            mode === "optimal"
              ? "border-accent-primary text-accent-primary"
              : "border-transparent text-theme-tertiary"
          }`}
        >
          Optimal O(n)
        </div>
      </div>

      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-theme-tertiary/50 p-5 rounded-xl shadow-2xl border border-theme-primary/50">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-theme-primary/50">
              <h3 className="font-bold text-xl text-accent-primary flex items-center gap-2">
                <Code size={20} />
                {mode === "brute-force"
                  ? "C++ Brute Force Solution"
                  : `${codeLang === "cpp" ? "C++" : "Java"} Optimal Solution`}
              </h3>

              {mode === "optimal" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setCodeLang("cpp")}
                    className={`px-3 py-1 rounded-md text-sm font-semibold ${
                      codeLang === "cpp"
                        ? "bg-accent-primary text-theme-primary"
                        : "bg-theme-elevated text-theme-secondary hover:bg-theme-elevated"
                    }`}
                  >
                    C++
                  </button>
                  <button
                    onClick={() => setCodeLang("java")}
                    className={`px-3 py-1 rounded-md text-sm font-semibold ${
                      codeLang === "java"
                        ? "bg-accent-primary text-theme-primary"
                        : "bg-theme-elevated text-theme-secondary hover:bg-theme-elevated"
                    }`}
                  >
                    Java
                  </button>
                </div>
              )}
            </div>

            <pre className="text-sm overflow-auto">
              <code className="font-mono leading-relaxed">
                {mode === "brute-force"
                  ? bruteForceCode.map((line) => (
                      <CodeLine key={line.l} line={line.l} content={line.c} />
                    ))
                  : codeLang === "cpp"
                  ? optimalCode.map((line) => (
                      <CodeLine key={line.l} line={line.l} content={line.c} />
                    ))
                  : javaOptimalCode.map((line) => (
                      <CodeLine key={line.l} line={line.l} content={line.c} />
                    ))}
              </code>
            </pre>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="relative bg-theme-tertiary/50 p-6 rounded-xl border border-theme-primary/50 shadow-2xl min-h-[340px]">
              <h3 className="font-bold text-lg text-theme-secondary mb-4 flex items-center gap-2">
                <BarChart3 size={20} />
                Elevation Map
              </h3>
              <div
                id="elevation-map-container"
                className="flex justify-center items-end gap-1 h-64 border-b-2 border-theme-primary pb-2"
              >
                {heights.map((h, index) => {
                  const isI = state.i === index;
                  const isJ = state.j === index && mode === "brute-force";
                  return (
                    <div
                      key={index}
                      id={`elevation-map-container-element-${index}`}
                      className="flex-1 flex flex-col justify-end items-center h-full relative"
                    >
                      <div
                        className="absolute bottom-0 w-full bg-accent-primary/30 transition-all duration-300"
                        style={{
                          height: `${
                            (Math.min(
                              state.lmax?.[index] ?? state.lmax ?? 0,
                              state.rmax?.[index] ?? state.rmax ?? 0
                            ) /
                              maxHeight) *
                            100
                          }%`,
                        }}
                      ></div>
                      <div
                        className={`w-full rounded-t-md transition-all duration-300 bg-theme-elevated relative z-10 border-x-2 border-t-2 ${
                          isI
                            ? "border-orange"
                            : isJ
                            ? "border-teal400"
                            : "border-transparent"
                        }`}
                        style={{ height: `${(h / maxHeight) * 100}%` }}
                      ></div>
                      <div
                        className="absolute bottom-0 w-full bg-accent-primary z-20 transition-all duration-300"
                        style={{
                          height: `${
                            ((waterLevels[index] ?? 0) / maxHeight) * 100
                          }%`,
                        }}
                      ></div>
                      <span className="text-xs text-theme-tertiary mt-1">{h}</span>
                    </div>
                  );
                })}
              </div>
              {isLoaded && (
                <VisualizerPointer
                  index={state.i}
                  containerId="elevation-map-container"
                  color="amber"
                  label="i"
                  direction="up"
                />
              )}
              {isLoaded && mode === "brute-force" && (
                <VisualizerPointer
                  index={state.j}
                  containerId="elevation-map-container"
                  color="cyan"
                  label="j"
                  direction="up"
                />
              )}
            </div>

            {mode === "optimal" && (
              <div className="bg-theme-tertiary/50 p-6 rounded-xl border border-theme-primary/50 shadow-2xl space-y-4">
                <div>
                  <h4 className="font-mono text-sm text-theme-tertiary">
                    Left Max Array (lmax)
                  </h4>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {state.lmax?.map((val, index) => (
                      <div
                        key={index}
                        className={`w-10 h-10 flex items-center justify-center rounded-md font-mono transition-colors duration-300 ${
                          state.i === index
                            ? "bg-accent-primary/50 border border-accent-primary"
                            : "bg-theme-elevated"
                        }`}
                      >
                        {val}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-mono text-sm text-theme-tertiary">
                    Right Max Array (rmax)
                  </h4>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {state.rmax?.map((val, index) => (
                      <div
                        key={index}
                        className={`w-10 h-10 flex items-center justify-center rounded-md font-mono transition-colors duration-300 ${
                          state.i === index
                            ? "bg-accent-primary/50 border border-accent-primary"
                            : "bg-theme-elevated"
                        }`}
                      >
                        {val}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-success800/30 p-4 rounded-xl border border-success700/50">
              <h3 className="text-success text-sm flex items-center gap-2">
                <Droplets size={16} />
                Total Trapped Water
              </h3>
              <p className="font-mono text-4xl text-success mt-2">
                {state.totalWater ?? 0}
              </p>
            </div>
            <div className="bg-theme-tertiary/50 p-4 rounded-xl border border-theme-primary/50 min-h-[5rem]">
              <h3 className="text-theme-tertiary text-sm mb-1">Explanation</h3>
              <p className="text-theme-secondary">{state.explanation}</p>
            </div>
          </div>
          <div className="lg:col-span-3 bg-theme-tertiary/50 p-5 rounded-xl shadow-2xl border border-theme-primary/50">
            <h3 className="font-bold text-xl text-accent-primary mb-4 pb-3 border-b border-theme-primary/50 flex items-center gap-2">
              <Clock size={20} />
              Complexity Analysis
            </h3>
            {mode === "brute-force" ? (
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-accent-primary">
                    Time Complexity:{" "}
                    <span className="font-mono text-teal300">O(N²)</span>
                  </h4>
                  <p className="text-theme-tertiary mt-1">
                    For each element of the array, we iterate to its left to
                    find the maximum height and to its right to find the maximum
                    height. This results in nested loops, leading to a quadratic
                    time complexity.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-accent-primary">
                    Space Complexity:{" "}
                    <span className="font-mono text-teal300">O(1)</span>
                  </h4>
                  <p className="text-theme-tertiary mt-1">
                    We only use a few variables to store `lmax`, `rmax`, and
                    `totalWater`. The space required does not scale with the
                    size of the input array.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-accent-primary">
                    Time Complexity:{" "}
                    <span className="font-mono text-teal300">O(N)</span>
                  </h4>
                  <p className="text-theme-tertiary mt-1">
                    We make three separate passes through the array: one to
                    compute `lmax` for all elements, one to compute `rmax`, and
                    a final one to calculate the trapped water. Each pass is
                    linear, so the total time complexity is O(N) + O(N) + O(N) =
                    O(N).
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-accent-primary">
                    Space Complexity:{" "}
                    <span className="font-mono text-teal300">O(N)</span>
                  </h4>
                  <p className="text-theme-tertiary mt-1">
                    We use two additional arrays, `lmax` and `rmax`, each of
                    size N, to store the pre-calculated maximum heights. This
                    results in a space complexity that is linear with respect to
                    the input size.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-center text-theme-muted py-10">
          Load heights to begin visualization.
        </p>
      )}
    </div>
  );
};

export default TrappingRainWater;
