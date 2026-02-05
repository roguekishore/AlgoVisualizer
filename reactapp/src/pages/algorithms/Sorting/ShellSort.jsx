import React, { useState, useEffect, useCallback } from "react";
import { Code, CheckCircle, BarChart3, Clock, Repeat, GitCompareArrows, Layers } from "lucide-react";
import VisualizerPointer from "../../../components/VisualizerPointer";

const ShellSortVisualizer = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [arrayInput, setArrayInput] = useState("12,34,54,2,3,9,23,18,7");
  const [isLoaded, setIsLoaded] = useState(false);

  const generateShellSortHistory = useCallback((initialArray) => {
    const arr = JSON.parse(JSON.stringify(initialArray));
    const n = arr.length;
    const newHistory = [];
    let totalSwaps = 0;
    let totalComparisons = 0;
    let sortedIndices = [];

    const addState = (props) =>
      newHistory.push({
        array: JSON.parse(JSON.stringify(arr)),
        gap: null,
        i: null,
        j: null,
        sortedIndices: [...sortedIndices],
        explanation: "",
        totalSwaps,
        totalComparisons,
        ...props,
      });

    addState({ line: 1, explanation: "Initialize Shell Sort algorithm." });

    for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
      addState({
        line: 2,
        gap,
        explanation: `Starting new pass with gap = ${gap}. Elements ${gap} positions apart will be compared.`,
      });

      for (let i = gap; i < n; i++) {
        addState({
          line: 3,
          gap,
          i,
          explanation: `Select element at index ${i} (value: ${arr[i].value}) as the key element.`,
        });

        const temp = arr[i];
        let j = i;

        while (j >= gap) {
          totalComparisons++;
          addState({
            line: 4,
            gap,
            i,
            j,
            explanation: `Compare element at index ${j - gap} (${arr[j - gap].value}) with key (${temp.value}).`,
          });

          if (arr[j - gap].value > temp.value) {
            totalSwaps++;
            addState({
              line: 5,
              gap,
              i,
              j,
              explanation: `${arr[j - gap].value} > ${temp.value}, shift ${arr[j - gap].value} to position ${j}.`,
            });

            arr[j] = arr[j - gap];
            j -= gap;

            addState({
              line: 6,
              gap,
              i,
              j,
              explanation: `Element shifted. Move back by gap (${gap}) positions.`,
            });
          } else {
            break;
          }
        }

        arr[j] = temp;
        addState({
          line: 7,
          gap,
          i,
          j,
          explanation: `Place key element ${temp.value} at correct position ${j}.`,
        });
      }

      addState({
        line: 8,
        gap,
        explanation: `Completed pass with gap = ${gap}. Array is now ${gap}-sorted.`,
      });
    }

    sortedIndices = Array.from({ length: n }, (_, k) => k);
    addState({
      line: 10,
      sortedIndices,
      finished: true,
      explanation: "Shell Sort complete. Array is fully sorted.",
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const loadArray = () => {
    const localArray = arrayInput.split(",").map((s) => s.trim()).filter(Boolean).map(Number);
    if (localArray.some(isNaN) || localArray.length === 0) {
      alert("Invalid input. Please use comma-separated numbers.");
      return;
    }
    const initialObjects = localArray.map((value, id) => ({ value, id }));
    setIsLoaded(true);
    generateShellSortHistory(initialObjects);
  };

  const reset = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
  };

  const stepForward = useCallback(() => setCurrentStep((prev) => Math.min(prev + 1, history.length - 1)), [history.length]);
  const stepBackward = useCallback(() => setCurrentStep((prev) => Math.max(prev - 1, 0)), []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isLoaded) return;
      if (e.key === "ArrowRight") stepForward();
      else if (e.key === "ArrowLeft") stepBackward();
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isLoaded, stepForward, stepBackward]);

  const state = history[currentStep] || {};
  const { array = [], gap = null, i = null, j = null, sortedIndices = [], explanation = "", totalSwaps = 0, totalComparisons = 0, finished = false } = state;

  const colorMapping = {
    purple: "text-purple400",
    cyan: "text-teal",
    yellow: "text-warning",
    orange: "text-orange400",
    "light-gray": "text-theme-tertiary",
    "": "text-theme-secondary",
  };

  const CodeLine = ({ line, content }) => (
    <div className={`block rounded-md transition-colors ${state.line === line ? "bg-accent-primary-light" : ""}`}>
      <span className="text-theme-muted w-8 inline-block text-right pr-4 select-none">{line}</span>
      {content.map((token, index) => (
        <span key={index} className={colorMapping[token.c]}>{token.t}</span>
      ))}
    </div>
  );

  const shellSortCode = [
    { l: 1, c: [{ t: "function shellSort(arr) {", c: "" }] },
    { l: 2, c: [{ t: "  for", c: "purple" }, { t: " (let gap = n/2; gap > 0; gap /= 2) {", c: "" }] },
    { l: 3, c: [{ t: "    for", c: "purple" }, { t: " (let i = gap; i < n; i++) {", c: "" }] },
    { l: 4, c: [{ t: "      while", c: "purple" }, { t: " (j >= gap && arr[j-gap] > temp) {", c: "" }] },
    { l: 5, c: [{ t: "        arr[j] = arr[j-gap];", c: "" }] },
    { l: 6, c: [{ t: "        j -= gap;", c: "" }] },
    { l: 7, c: [{ t: "      }", c: "light-gray" }] },
    { l: 8, c: [{ t: "      arr[j] = temp;", c: "" }] },
    { l: 10, c: [{ t: "    }", c: "light-gray" }] },
    { l: 11, c: [{ t: "  }", c: "light-gray" }] },
    { l: 12, c: [{ t: "  return", c: "purple" }, { t: " arr;", c: "" }] },
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-accent-primary flex items-center justify-center gap-3">
          <Layers /> Shell Sort Visualizer
        </h1>
        <p className="text-lg text-theme-tertiary mt-2">
          Visualizing an optimized insertion sort with gap sequences
        </p>
      </header>

      <div className="bg-theme-tertiary p-4 rounded-lg shadow-xl border border-theme-primary flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-grow w-full">
          <label htmlFor="array-input" className="font-medium text-theme-secondary font-mono">Array:</label>
          <input id="array-input" type="text" value={arrayInput} onChange={(e) => setArrayInput(e.target.value)} disabled={isLoaded} className="font-mono flex-grow bg-theme-secondary border border-theme-primary rounded-md p-2 focus:ring-2 focus:ring-accent-primary" />
        </div>
        <div className="flex items-center gap-2">
          {!isLoaded ? (
            <button onClick={loadArray} className="bg-accent-primary hover:bg-accent-primary-hover cursor-pointer text-theme-primary font-bold py-2 px-4 rounded-lg">Load & Visualize</button>
          ) : (
            <>
              <button onClick={stepBackward} disabled={currentStep <= 0} className="bg-theme-elevated p-2 rounded-md disabled:opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
              </button>
              <span className="font-mono w-24 text-center">{currentStep >= 0 ? currentStep + 1 : 0}/{history.length}</span>
              <button onClick={stepForward} disabled={currentStep >= history.length - 1} className="bg-theme-elevated p-2 rounded-md disabled:opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
              </button>
            </>
          )}
          <button onClick={reset} className="ml-4 bg-danger-hover hover:bg-danger-hover cursor-pointer font-bold py-2 px-4 rounded-lg">Reset</button>
        </div>
      </div>

      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-theme-tertiary/50 p-5 rounded-xl shadow-2xl border border-theme-primary/50">
            <h3 className="font-bold text-xl text-accent-primary mb-4 pb-3 border-b border-theme-primary/50 flex items-center gap-2">
              <Code size={20} />
              Pseudocode
            </h3>
            <pre className="text-sm overflow-auto">
              <code className="font-mono leading-relaxed">
                {shellSortCode.map((line) => (
                  <CodeLine key={line.l} line={line.l} content={line.c} />
                ))}
              </code>
            </pre>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-theme-tertiary/50 p-6 rounded-xl border border-theme-primary/50 shadow-2xl">
              <h3 className="font-bold text-lg text-theme-secondary mb-4 flex items-center gap-2">
                <BarChart3 size={20} />
                Array Visualization
              </h3>
              <div className="flex justify-center items-center min-h-[150px] py-4">
                <div id="array-container" className="relative transition-all" style={{ width: `${array.length * 4.5}rem`, height: "4rem" }}>
                  {array.map((item, index) => {
                    const isComparing = j !== null && index === j - gap;
                    const isCurrent = i === index;
                    const isInsertion = j === index;
                    const isSorted = sortedIndices?.includes(index);

                    let boxStyles = "bg-theme-elevated border-theme-primary";
                    if (finished || isSorted) {
                      boxStyles = "bg-success700 border-success text-theme-primary";
                    } else if (isComparing) {
                      boxStyles = "bg-orange600 border-orange text-theme-primary";
                    } else if (isInsertion) {
                      boxStyles = "bg-teal600 border-teal400 text-theme-primary";
                    } else if (isCurrent) {
                      boxStyles = "bg-purple600 border-purple400 text-theme-primary";
                    }

                    return (
                      <div key={item.id} id={`array-container-element-${index}`} className={`absolute w-16 h-16 flex items-center justify-center rounded-lg shadow-md border-2 font-bold text-2xl transition-all duration-500 ease-in-out ${boxStyles}`} style={{ left: `${index * 4.5}rem` }}>
                        {item.value}
                      </div>
                    );
                  })}
                  {isLoaded && (
                    <>
                      <VisualizerPointer index={i} containerId="array-container" color="purple" label="i" />
                      <VisualizerPointer index={j} containerId="array-container" color="cyan" label="j" />
                      {gap !== null && j !== null && j - gap >= 0 && (
                        <VisualizerPointer index={j - gap} containerId="array-container" color="amber" label="j-gap" />
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-teal800/30 p-4 rounded-xl border border-teal700/50">
                <h3 className="text-teal300 text-sm flex items-center gap-2">
                  <GitCompareArrows size={16} /> Comparisons
                </h3>
                <p className="font-mono text-4xl text-teal mt-2">{totalComparisons}</p>
              </div>
              <div className="bg-purple800/30 p-4 rounded-xl border border-purple700/50">
                <h3 className="text-purple300 text-sm flex items-center gap-2">
                  <Repeat size={16} /> Shifts
                </h3>
                <p className="font-mono text-4xl text-purple400 mt-2">{totalSwaps}</p>
              </div>
              <div className="bg-accent-primary800/30 p-4 rounded-xl border border-accent-primary700/50">
                <h3 className="text-accent-primary text-sm flex items-center gap-2">
                  <Layers size={16} /> Gap
                </h3>
                <p className="font-mono text-4xl text-accent-primary mt-2">{gap ?? "-"}</p>
              </div>
            </div>

            <div className="bg-theme-tertiary/50 p-4 rounded-xl border border-theme-primary/50 min-h-[5rem]">
              <h3 className="text-theme-tertiary text-sm mb-1">Explanation</h3>
              <p className="text-theme-secondary">{explanation}</p>
              {finished && <CheckCircle className="inline-block ml-2 text-success" />}
            </div>
          </div>

          <div className="lg:col-span-3 bg-theme-tertiary/50 p-5 rounded-xl shadow-2xl border border-theme-primary/50">
            <h3 className="font-bold text-xl text-accent-primary mb-4 pb-3 border-b border-theme-primary/50 flex items-center gap-2">
              <Clock size={20} /> Complexity Analysis
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <h4 className="font-semibold text-accent-primary">Time Complexity</h4>
                <p className="text-theme-tertiary">
                  <strong className="text-teal300 font-mono">Worst Case: O(n²)</strong>
                  <br />
                  Occurs with certain gap sequences. The worst-case depends on the gap sequence used.
                </p>
                <p className="text-theme-tertiary">
                  <strong className="text-teal300 font-mono">Average Case: O(n^3/2)</strong>
                  <br />
                  For most practical cases, Shell Sort performs better than O(n²), typically around O(n^3/2) with standard gap sequences.
                </p>
                <p className="text-theme-tertiary">
                  <strong className="text-teal300 font-mono">Best Case: O(n log n)</strong>
                  <br />
                  Occurs when the array is already sorted or nearly sorted. The algorithm makes fewer comparisons and shifts.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-accent-primary">Space Complexity</h4>
                <p className="text-theme-tertiary">
                  <strong className="text-teal300 font-mono">O(1)</strong>
                  <br />
                  Shell Sort is an in-place sorting algorithm. It only requires a constant amount of extra memory for variables like gap, temp, and loop counters, regardless of input size.
                </p>
                <h4 className="font-semibold text-accent-primary mt-4">Gap Sequence</h4>
                <p className="text-theme-tertiary">
                  This visualization uses the original Shell sequence: n/2, n/4, n/8, ..., 1. Other sequences like Knuth's (3^k-1)/2 can provide better performance.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-theme-muted py-10">Load an array to begin visualization.</p>
      )}
    </div>
  );
};

export default ShellSortVisualizer;
