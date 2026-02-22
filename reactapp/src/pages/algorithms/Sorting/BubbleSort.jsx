import React, { useState, useEffect, useCallback, useRef } from "react";
import { List, GitCompareArrows, Repeat } from "lucide-react";
import {
  VisualizerShell,
  ControlPanel,
  ArrayBar,
  CodeBlock,
  ExplanationBox,
  ComplexityCard,
  StatsGrid,
  ColorLegend,
} from "../../../components/visualizer";

// ─── Algorithm Logic (unchanged) ─────────────────────────────────────
const generateBubbleSortHistory = (initialArray) => {
  const arr = JSON.parse(JSON.stringify(initialArray));
  const n = arr.length;
  const history = [];
  let totalSwaps = 0;
  let totalComparisons = 0;
  let sortedIndices = [];

  const snap = (props) =>
    history.push({
      array: JSON.parse(JSON.stringify(arr)),
      i: null,
      j: null,
      sortedIndices: [...sortedIndices],
      explanation: "",
      totalSwaps,
      totalComparisons,
      ...props,
    });

  snap({ line: 2, explanation: "Initialize Bubble Sort algorithm." });

  for (let i = 0; i < n - 1; i++) {
    let swappedInPass = false;
    snap({
      line: 3,
      i,
      explanation: `Start Pass ${i + 1}. The largest unsorted element will bubble to the end.`,
    });

    for (let j = 0; j < n - i - 1; j++) {
      totalComparisons++;
      snap({
        line: 4,
        i,
        j,
        explanation: `Comparing adjacent elements at index ${j} (${arr[j].value}) and ${j + 1} (${arr[j + 1].value}).`,
      });

      if (arr[j].value > arr[j + 1].value) {
        swappedInPass = true;
        totalSwaps++;
        snap({
          line: 5,
          i,
          j,
          explanation: `${arr[j].value} > ${arr[j + 1].value}, so they need to be swapped.`,
        });
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        snap({ line: 6, i, j, explanation: "Elements swapped." });
      }
    }

    sortedIndices.push(n - 1 - i);
    snap({
      line: 8,
      i,
      explanation: `End of Pass ${i + 1}. Element ${arr[n - 1 - i].value} is now in its correct sorted position.`,
    });

    if (!swappedInPass) {
      snap({
        line: 9,
        i,
        explanation: "No swaps occurred in this pass. The array is already sorted. Breaking early.",
      });
      const remaining = Array.from(
        { length: n - sortedIndices.length },
        (_, k) => k
      );
      sortedIndices.push(...remaining);
      break;
    }
  }

  snap({
    line: 13,
    sortedIndices: Array.from({ length: n }, (_, k) => k),
    finished: true,
    explanation: "Algorithm finished. The array is fully sorted.",
  });

  return history;
};

// ─── Pseudocode (Format A: token-based) ──────────────────────────────
const BUBBLE_SORT_CODE = [
  { l: 2, c: [{ t: "function bubbleSort(arr) {", c: "" }] },
  {
    l: 3,
    c: [
      { t: "  for", c: "purple" },
      { t: " (let i = 0; i < n - 1; i++) {", c: "" },
    ],
  },
  {
    l: 4,
    c: [
      { t: "    for", c: "purple" },
      { t: " (let j = 0; j < n - i - 1; j++) {", c: "" },
    ],
  },
  {
    l: 5,
    c: [
      { t: "      if", c: "purple" },
      { t: " (arr[j] > arr[j + 1]) {", c: "" },
    ],
  },
  { l: 6, c: [{ t: "        swap(arr[j], arr[j + 1]);", c: "" }] },
  { l: 7, c: [{ t: "      }", c: "light-gray" }] },
  { l: 8, c: [{ t: "    }", c: "light-gray" }] },
  {
    l: 9,
    c: [
      { t: "    if", c: "purple" },
      { t: " (!swappedInPass) ", c: "" },
      { t: "break", c: "purple" },
      { t: ";", c: "light-gray" },
    ],
  },
  { l: 12, c: [{ t: "  }", c: "light-gray" }] },
  {
    l: 13,
    c: [
      { t: "  return", c: "purple" },
      { t: " arr;", c: "" },
    ],
  },
];

// ─── Complexity Data ─────────────────────────────────────────────────
const TIME_COMPLEXITY = [
  {
    label: "Worst Case",
    value: "O(N²)",
    description:
      "Occurs when the array is in reverse order. We must make N-1 passes, and each pass compares and swaps through the unsorted portion.",
  },
  {
    label: "Average Case",
    value: "O(N²)",
    description:
      "For a random array, the number of comparisons and swaps is also proportional to N².",
  },
  {
    label: "Best Case",
    value: "O(N)",
    description:
      "Occurs when the array is already sorted. A single pass with no swaps terminates the algorithm early.",
  },
];

const SPACE_COMPLEXITY = [
  {
    value: "O(1)",
    description:
      "Bubble sort is in-place. Only a constant amount of extra memory is needed for loop counters and a temporary swap variable.",
  },
];

const INSIGHTS = [
  "Bubble Sort is a stable sorting algorithm — equal elements retain their relative order.",
  "The early-termination optimisation (no swaps → break) gives O(N) best-case performance.",
  "Our visualizer stores the full history for educational replay. The algorithm itself uses O(1) space.",
];

// ─── Color Legend ────────────────────────────────────────────────────
const LEGEND = [
  { color: "bg-secondary", label: "Unsorted" },
  { color: "bg-primary/40", label: "Comparing" },
  { color: "bg-emerald-500/40", label: "Sorted" },
];

// ─── Main Component ──────────────────────────────────────────────────
const BubbleSortVisualizer = () => {
  // ── State ──────────────────────────────────────────────────────────
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [arrayInput, setArrayInput] = useState("8,5,2,9,5,6,3");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [active, setActive] = useState(false);
  const ref = useRef(null);

  const state = history[currentStep] || {};
  const { array = [] } = state;

  // ── Load / Reset ───────────────────────────────────────────────────
  const loadArray = () => {
    const nums = arrayInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);
    if (nums.some(isNaN) || nums.length === 0) {
      alert("Invalid input. Please use comma-separated numbers.");
      return;
    }
    const objects = nums.map((value, id) => ({ value, id }));
    const h = generateBubbleSortHistory(objects);
    setHistory(h);
    setCurrentStep(0);
    setIsLoaded(true);
  };

  const reset = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
    setIsPlaying(false);
  };

  // ── Playback ───────────────────────────────────────────────────────
  const stepForward = useCallback(
    () => setCurrentStep((p) => Math.min(p + 1, history.length - 1)),
    [history.length]
  );
  const stepBackward = useCallback(
    () => setCurrentStep((p) => Math.max(p - 1, 0)),
    []
  );

  // Auto-play interval
  useEffect(() => {
    if (!isPlaying || !history.length) return;
    const id = setInterval(() => {
      setCurrentStep((p) => {
        if (p >= history.length - 1) {
          setIsPlaying(false);
          return p;
        }
        return p + 1;
      });
    }, speed);
    return () => clearInterval(id);
  }, [isPlaying, speed, history.length]);

  // Keyboard (arrows) when active
  useEffect(() => {
    if (!active || !isLoaded) return;
    const handler = (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        stepBackward();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        stepForward();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, isLoaded, stepForward, stepBackward]);

  // Click-outside deactivation
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setActive(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── ArrayBar styling callback ──────────────────────────────────────
  const getBoxStyle = (item, index) => {
    const isSorted =
      state.finished || state.sortedIndices?.includes(index);
    const isComparing =
      state.j === index || state.j + 1 === index;

    if (isSorted) return "bg-emerald-500/15 border-emerald-500/40 text-emerald-400";
    if (isComparing) return "bg-primary/15 border-primary/50 text-primary";
    return "bg-secondary text-secondary-foreground";
  };

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div ref={ref} onClick={() => setActive(true)}>
      <VisualizerShell
        title="Bubble Sort Visualizer"
        subtitle="Visualizing the classic comparison sorting algorithm"
        icon={<List />}
      >
        {/* ── Controls ──────────────────────────────────────────── */}
        <ControlPanel
          isLoaded={isLoaded}
          onLoad={loadArray}
          onStepForward={stepForward}
          onStepBackward={stepBackward}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onReset={reset}
          isPlaying={isPlaying}
          currentStep={currentStep}
          totalSteps={history.length}
          speed={speed}
          onSpeedChange={setSpeed}
          inputSlot={
            <div className="flex items-center gap-2 w-full">
              <label className="text-[11px] font-medium text-muted-foreground shrink-0 hidden md:block">
                Array
              </label>
              <input
                type="text"
                value={arrayInput}
                onChange={(e) => setArrayInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadArray()}
                disabled={isLoaded}
                className="font-mono text-sm flex-grow bg-background border border-input rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
              />
            </div>
          }
        />

        {/* ── Main Content ──────────────────────────────────────── */}
        {isLoaded ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Pseudocode */}
            <CodeBlock
              title="Pseudocode"
              lines={BUBBLE_SORT_CODE}
              activeLine={state.line}
            />

            {/* Right: Visualization + Stats + Explanation */}
            <div className="lg:col-span-2 space-y-6">
              <ArrayBar
                items={array}
                containerId="array-container"
                title="Swapping Boxes Visualization"
                getStyle={getBoxStyle}
                pointers={[
                  { index: state.j, color: "amber", label: "j" },
                  {
                    index: state.j != null ? state.j + 1 : null,
                    color: "amber",
                    label: "j+1",
                  },
                ]}
              />

              <ColorLegend items={LEGEND} />

              <StatsGrid
                stats={[
                  {
                    icon: <GitCompareArrows size={16} />,
                    label: "Total Comparisons",
                    value: state.totalComparisons ?? 0,
                    color: "teal",
                  },
                  {
                    icon: <Repeat size={16} />,
                    label: "Total Swaps",
                    value: state.totalSwaps ?? 0,
                    color: "purple",
                  },
                ]}
              />

              <ExplanationBox
                explanation={state.explanation}
                finished={state.finished}
              />
            </div>

            {/* Full-width: Complexity */}
            <ComplexityCard
              time={TIME_COMPLEXITY}
              space={SPACE_COMPLEXITY}
              insights={INSIGHTS}
            />
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-10">
            Load an array to begin visualization.
          </p>
        )}
      </VisualizerShell>
    </div>
  );
};

export default BubbleSortVisualizer;
