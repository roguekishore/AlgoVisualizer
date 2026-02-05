import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Code,
  CheckCircle,
  BarChart3,
  Clock,
  Repeat,
  GitCompareArrows,
  Shuffle,
} from "lucide-react";
import VisualizerPointer from "../../../components/VisualizerPointer"; // Make sure this path is correct

// Main Visualizer Component
const SelectionSortVisualizer = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [arrayInput, setArrayInput] = useState("7,4,10,8,3,1");
  const [isLoaded, setIsLoaded] = useState(false);
  const [active, setActive] = useState(false);
  const visualizerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const generateSelectionSortHistory = useCallback((initialArray) => {
    let arr = JSON.parse(JSON.stringify(initialArray));
    let n = arr.length;
    const newHistory = [];
    let totalComparisons = 0;
    let totalSwaps = 0;
    let sortedIndices = [];

    const addState = (props) =>
      newHistory.push({
        array: JSON.parse(JSON.stringify(arr)),
        sortedIndices: [...sortedIndices],
        explanation: "",
        totalComparisons,
        totalSwaps,
        i: null,
        j: null,
        minIndex: null,
        ...props,
      });

    addState({ line: 2, explanation: "Initialize Selection Sort algorithm." });

    for (let i = 0; i < n - 1; i++) {
      let minIndex = i;
      addState({
        line: 4,
        i,
        minIndex,
        explanation: `Start of outer loop. Set boundary at index ${i}. Assume element ${arr[i].value} is the minimum.`,
      });

      for (let j = i + 1; j < n; j++) {
        addState({
          line: 5,
          i,
          j,
          minIndex,
          explanation: `Comparing current minimum (${arr[minIndex].value}) with element at index ${j} (${arr[j].value}).`,
        });
        totalComparisons++;

        if (arr[j].value < arr[minIndex].value) {
          minIndex = j;
          addState({
            line: 6,
            i,
            j,
            minIndex,
            explanation: `Found a new minimum: ${arr[minIndex].value} at index ${minIndex}.`,
          });
        }
      }

      addState({
        line: 7,
        i,
        minIndex,
        explanation: `Inner loop finished. The minimum in the unsorted part is ${arr[minIndex].value}.`,
      });

      if (minIndex !== i) {
        addState({
          line: 8,
          i,
          minIndex,
          explanation: `Swapping the boundary element ${arr[i].value} with the minimum element ${arr[minIndex].value}.`,
        });
        [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
        totalSwaps++;
      }

      sortedIndices.push(i);
      addState({
        line: 8,
        array: [...arr],
        i,
        minIndex: i, // minIndex is now i after the swap
        sortedIndices: [...sortedIndices],
        explanation: `Element ${arr[i].value} is now in its correct sorted position.`,
      });
    }

    sortedIndices.push(n - 1);
    addState({
      line: 10,
      finished: true,
      sortedIndices,
      explanation: "Selection Sort completed. Array is fully sorted.",
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const loadArray = () => {
    const localArray = arrayInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);

    if (localArray.some(isNaN) || localArray.length === 0) {
      alert("Invalid input. Please use comma-separated numbers.");
      return;
    }

    const initialObjects = localArray.map((value, id) => ({ value, id }));
    setIsLoaded(true);
    generateSelectionSortHistory(initialObjects);
  };

  const reset = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
  };

  const handleEnterKey = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const btn = document.getElementById("load-button"); // the Load & Visualize button
      if (btn) btn.click();
    }
  };

  const handleSpeedChange = (e) => {
    setSpeed(parseFloat(e.target.value));
  };

  const playhead = useCallback(() => {
    setIsPlaying((prev) => !prev); // toggle between play/pause
  }, []);

  const stepForward = useCallback(
    () => setCurrentStep((prev) => Math.min(prev + 1, history.length - 1)),
    [history.length]
  );

  const stepBackward = useCallback(
    () => setCurrentStep((prev) => Math.max(prev - 1, 0)),
    []
  );

  // --- Keyboard control only when active ---
  useEffect(() => {
    if (!active || !isLoaded) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        stepBackward();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        stepForward();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active, isLoaded, stepForward, stepBackward]);

  // --- Click outside to deactivate ---
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (visualizerRef.current && !visualizerRef.current.contains(e.target)) {
        setActive(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isPlaying || history.length === 0) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= history.length - 1) {
          clearInterval(interval);
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / speed); // faster speed = shorter delay

    return () => clearInterval(interval); // cleanup
  }, [isPlaying, speed, history.length]);

  const state = history[currentStep] || {};
  const { array = [] } = state;

  const colorMapping = {
    purple: "text-purple400",
    cyan: "text-teal",
    yellow: "text-warning",
    orange: "text-orange400",
    "light-gray": "text-theme-tertiary",
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

  const selectionSortCode = [
    { l: 2, c: [{ t: "function selectionSort(arr) {", c: "" }] },
    { l: 3, c: [{ t: "  for i from 0 to n-2:", c: "purple" }] },
    { l: 4, c: [{ t: "    minIndex = i", c: "" }] },
    { l: 5, c: [{ t: "    for j from i+1 to n-1:", c: "purple" }] },
    { l: 6, c: [{ t: "      if arr[j] < arr[minIndex]", c: "" }] },
    { l: 7, c: [{ t: "        minIndex = j", c: "" }] },
    { l: 8, c: [{ t: "    swap(arr[i], arr[minIndex])", c: "" }] },
    { l: 9, c: [{ t: "  }", c: "purple" }] },
    { l: 10, c: [{ t: "}", c: "" }] },
  ];

  return (
    <div
      ref={visualizerRef}
      tabIndex={0}
      onClick={() => setActive(true)}
      className="p-4 max-w-7xl mx-auto focus:outline-none"
    >
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-accent-primary flex items-center justify-center gap-3">
          <Shuffle /> Selection Sort Visualizer
        </h1>
        <p className="text-lg text-theme-tertiary mt-2">
          Visualizing the in-place comparison sorting algorithm
        </p>
      </header>

      <div className="w-full flex justify-center">
        <div className="shadow-2xl border border-theme-primary/50 bg-theme-tertiary/50 p-4 rounded-lg  flex flex-col md:flex-row items-center justify-between gap-2 mb-6 w-full">
          <div
            className={`flex items-center gap-4 ${
              isLoaded ? "w-full" : "w-full md:w-950"
            }`}
          >
            <label
              htmlFor="array-input"
              className="font-medium text-theme-secondary font-mono hidden md:block"
            >
              Array:
            </label>
            <input
              id="array-input"
              type="text"
              value={arrayInput}
              onChange={(e) => setArrayInput(e.target.value)}
              onKeyDown={handleEnterKey}
              disabled={isLoaded}
              className="font-mono flex-grow bg-theme-secondary border border-theme-primary rounded-md p-2 focus:ring-2 focus:ring-accent-primary"
            />
          </div>
          <div className="flex items-center flex-wrap gap-4 md:flex-nowrap w-full md:w-150">
            {!isLoaded ? (
              <button
                id="load-button"
                onClick={loadArray}
                className="bg-accent-primary hover:bg-accent-primary-hover text-theme-primary font-bold py-2 px-4 rounded-lg w-full"
              >
                Load & Visualize
              </button>
            ) : (
              <>
                <div className="flex gap-2 w-full md:w-40 justify-center">
                  <button
                    onClick={stepBackward}
                    disabled={currentStep <= 0}
                    className="bg-theme-elevated p-2 rounded-md disabled:opacity-50 w-full md:w-10 flex justify-center"
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
                  {/* on click change state form play to pause */}
                  <button
                    onClick={playhead}
                    disabled={currentStep >= history.length - 1}
                    className="bg-theme-elevated p-2 rounded-md disabled:opacity-50 w-full md:w-10 flex justify-center"
                  >
                    {isPlaying ? (
                      // Pause icon
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="white"
                        viewBox="0 0 24 24"
                      >
                        <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                      </svg>
                    ) : (
                      // Play icon
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="white"
                        viewBox="0 0 448 512"
                      >
                        <path d="M91.2 36.9c-12.4-6.8-27.4-6.5-39.6 .7S32 57.9 32 72v368c0 14.1 7.5 27.2 19.6 34.4s27.2 7.5 39.6 .7l336-184c12.8-7 20.8-20.5 20.8-35.1s-8-28.1-20.8-35.1L91.2 36.9z" />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={stepForward}
                    disabled={currentStep >= history.length - 1}
                    className="bg-theme-elevated p-2 rounded-md disabled:opacity-50 w-full md:w-10 flex justify-center"
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
                </div>
                <div className="flex gap-2 w-full lg:w-72 justify-center gap-4">
                  <div className="flex items-center gap-2 rounded-lg flex-shrink-0 lg:w-72 w-full">
                    <span className="text-sm font-semibold">Speed</span>
                    <input
                      type="range"
                      className="w-full h-1.5 bg-theme-elevated rounded-lg outline-none cursor-pointer"
                      min="0.25"
                      max="2"
                      step="0.25"
                      value={speed}
                      onChange={handleSpeedChange}
                    />
                    <span className="text-sm min-w-8 font-mono text-theme-secondary  text-right">
                      {speed}x
                    </span>
                    <span className="font-mono w-18 px-4 py-2 flex items-center justify-center text-center bg-theme-secondary border border-theme-primary rounded-md">
                      {currentStep >= 0 ? currentStep + 1 : 0}/{history.length}
                    </span>
                    {/* Array size display - showing current number of elements */}
                    {isLoaded && arrayInput && (
                      <span className="text-sm text-theme-tertiary font-medium ml-4">
                        Array Size: {arrayInput.split(',').filter(item => item.trim() !== '').length}
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
            <div className="flex w-full md:w-20">
              <button
                onClick={reset}
                className="bg-danger-hover hover:bg-danger-hover font-bold py-2 px-4 rounded-lg whitespace-nowrap text-sm sm:text-base flex-shrink-0 mx-auto w-full "
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-theme-tertiary/50 p-5 rounded-xl shadow-2xl border border-theme-primary/50">
            <h3 className="font-bold text-xl text-accent-primary mb-4 pb-3 border-b border-theme-primary/50 flex items-center gap-2">
              <Code size={20} /> Pseudocode
            </h3>
            <pre className="text-sm overflow-auto">
              <code className="font-mono leading-relaxed">
                {selectionSortCode.map((line) => (
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
              <div
                id="array-container"
                className="flex justify-center items-center flex-wrap gap-2 min-h-[120px] relative"
              >
                {array.map((item, index) => {
                  const isSorted = state.sortedIndices?.includes(index);
                  const isMin = state.minIndex === index;
                  const isBoundary = state.i === index;
                  const isComparing = state.j === index;

                  let boxStyles = "bg-theme-elevated border-theme-primary";
                  if (state.finished || isSorted) {
                    boxStyles = "bg-success700 border-success text-theme-primary";
                  } else if (isMin) {
                    boxStyles = "bg-accent-primary-hover border-accent-primary text-theme-primary";
                  } else if (isBoundary) {
                    boxStyles = "bg-danger-hover border-danger text-theme-primary";
                  } else if (isComparing) {
                    boxStyles = "bg-orange600 border-orange text-theme-primary";
                  }

                  return (
                    <div
                      key={item.id}
                      id={`array-container-element-${index}`}
                      className="text-center relative"
                    >
                      <div
                        className={`w-14 h-14 flex items-center justify-center rounded-lg shadow-md border-2 font-bold text-xl transition-all duration-300 ${boxStyles}`}
                      >
                        {item.value}
                      </div>
                      <span className="text-xs text-theme-tertiary mt-1">
                        {index}
                      </span>
                    </div>
                  );
                })}

                {isLoaded && state.i !== null && (
                  <VisualizerPointer
                    index={state.i}
                    containerId="array-container"
                    color="red"
                    label="i"
                  />
                )}
                {isLoaded && state.j !== null && (
                  <VisualizerPointer
                    index={state.j}
                    containerId="array-container"
                    color="amber"
                    label="j"
                  />
                )}
                {isLoaded && state.minIndex !== null && (
                  <VisualizerPointer
                    index={state.minIndex}
                    containerId="array-container"
                    color="blue"
                    label="min"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-teal800/30 p-4 rounded-xl border border-teal700/50">
                <h3 className="text-teal300 text-sm flex items-center gap-2">
                  <GitCompareArrows size={16} /> Total Comparisons
                </h3>
                <p className="font-mono text-4xl text-teal mt-2">
                  {state.totalComparisons ?? 0}
                </p>
              </div>
              <div className="bg-purple800/30 p-4 rounded-xl border border-purple700/50">
                <h3 className="text-purple300 text-sm flex items-center gap-2">
                  <Repeat size={16} /> Total Swaps
                </h3>
                <p className="font-mono text-4xl text-purple400 mt-2">
                  {state.totalSwaps ?? 0}
                </p>
              </div>
            </div>

            <div className="bg-theme-tertiary/50 p-4 rounded-xl border border-theme-primary/50 min-h-[5rem]">
              <h3 className="text-theme-tertiary text-sm mb-1">Explanation</h3>
              <p className="text-theme-secondary">{state.explanation}</p>
              {state.finished && (
                <CheckCircle className="inline-block ml-2 text-success" />
              )}
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
                  <strong className="text-teal300 font-mono">
                    Worst Case: O(N²)
                  </strong>
                  <br />
                  The algorithm always performs two nested loops. The outer loop
                  runs N-1 times and the inner loop runs about N/2 times on
                  average, leading to a quadratic time complexity regardless of
                  the initial order of elements.
                </p>
                <p className="text-theme-tertiary">
                  <strong className="text-teal300 font-mono">
                    Average Case: O(N²)
                  </strong>
                  <br />
                  The number of comparisons is fixed, so the average performance
                  is the same as the worst-case performance.
                </p>
                <p className="text-theme-tertiary">
                  <strong className="text-teal300 font-mono">
                    Best Case: O(N²)
                  </strong>
                  <br />
                  Even if the array is already sorted, the algorithm must still
                  iterate through the entire unsorted portion to find the
                  minimum, resulting in the same quadratic complexity.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-accent-primary">
                  Space Complexity
                </h4>
                <p className="text-theme-tertiary">
                  <strong className="text-teal300 font-mono">O(1)</strong>
                  <br />
                  Selection Sort is an in-place algorithm. It only requires a
                  few extra variables to store indices and for swapping, so its
                  space usage is constant and does not depend on the size of the
                  input array.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-theme-muted py-10">
          Load an array to begin visualization.
        </p>
      )}
    </div>
  );
};

export default SelectionSortVisualizer;
