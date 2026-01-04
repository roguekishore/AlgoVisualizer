import React from "react";
import {
  Code,
  CheckCircle,
  BarChart3,
  Clock,
  Repeat,
  GitCompareArrows,
} from "lucide-react";
import VisualizerPointer from "../../components/VisualizerPointer";

const SortingVisualizerLayout = ({
  // Props for algorithm-specific details
  title,
  description,
  Icon,
  // State and handlers from the specific visualizer
  arrayInput,
  setArrayInput,
  isLoaded,
  loadArray,
  reset,
  stepBackward,
  stepForward,
  currentStep,
  history,
  // New controls for future features
  arraySize,
  setArraySize,
  generateRandomArray,
  isPlaying,
  togglePlayPause,
  speed,
  setSpeed,
  // Algorithm-specific content
  pseudocode,
  visualization,
  complexityAnalysis,
}) => {
  const state = history[currentStep] || {};

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-accent-primary flex items-center justify-center gap-3">
          {Icon && <Icon />} {title}
        </h1>
        <p className="text-lg text-theme-tertiary mt-2">{description}</p>
      </header>

      {/* Control Panel */}
      <div className="bg-theme-tertiary p-4 rounded-lg shadow-xl border border-theme-primary flex flex-col gap-4 mb-6">
        {/* Top row for array input and generation */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-grow w-full">
            <label htmlFor="array-input" className="font-medium text-theme-secondary font-mono whitespace-nowrap">
              Manual Array:
            </label>
            <input
              id="array-input"
              type="text"
              value={arrayInput}
              onChange={(e) => setArrayInput(e.target.value)}
              disabled={isLoaded}
              placeholder="e.g., 8,5,2,9,5"
              className="font-mono flex-grow bg-theme-secondary border border-theme-primary rounded-md p-2 focus:ring-2 focus:ring-accent-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="array-size" className="font-medium text-theme-secondary font-mono whitespace-nowrap">
              Size:
            </label>
            <input
              id="array-size"
              type="number"
              value={arraySize}
              onChange={(e) => setArraySize(Number(e.target.value))}
              disabled={isLoaded}
              min="1"
              max="20"
              className="font-mono w-20 bg-theme-secondary border border-theme-primary rounded-md p-2 focus:ring-2 focus:ring-accent-primary"
            />
            <button
              onClick={generateRandomArray}
              disabled={isLoaded}
              className="bg-success-hover hover:bg-success-hover text-theme-primary font-bold py-2 px-4 rounded-lg disabled:opacity-50"
            >
              Generate Random
            </button>
            {/* Array size display - showing current number of elements */}
            {isLoaded && arrayInput && (
              <div className="ml-4 flex items-center">
                <span className="text-sm text-theme-tertiary font-medium">
                  Array Size: {arrayInput.split(',').filter(item => item.trim() !== '').length}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom row for controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
          {!isLoaded ? (
            <button
              onClick={loadArray}
              className="bg-accent-primary hover:bg-accent-primary-hover text-theme-primary font-bold py-2 px-4 rounded-lg w-full md:w-auto"
            >
              Load & Visualize
            </button>
          ) : (
            <div className="flex items-center gap-4 w-full">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlayPause}
                  className="bg-theme-elevated p-2 rounded-md"
                >
                  {isPlaying ? "❚❚" : "►"}
                </button>
                <button
                  onClick={stepBackward}
                  disabled={currentStep <= 0}
                  className="bg-theme-elevated p-2 rounded-md disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
                <span className="font-mono w-24 text-center">
                  {currentStep + 1}/{history.length}
                </span>
                <button
                  onClick={stepForward}
                  disabled={currentStep >= history.length - 1}
                  className="bg-theme-elevated p-2 rounded-md disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-2 flex-grow">
                <label htmlFor="speed-slider" className="font-medium text-theme-secondary font-mono whitespace-nowrap">Speed:</label>
                <input
                  id="speed-slider"
                  type="range"
                  min="100"
                  max="2000"
                  step="100"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full h-2 bg-theme-elevated rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          )}
          <button
            onClick={reset}
            className="bg-danger-hover hover:bg-danger-hover text-theme-primary font-bold py-2 px-4 rounded-lg w-full md:w-auto"
          >
            Reset
          </button>
        </div>
      </div>

      {isLoaded && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pseudocode Section */}
          <div className="lg:col-span-1 bg-theme-tertiary/50 p-5 rounded-xl shadow-2xl border border-theme-primary/50">
            {pseudocode}
          </div>

          {/* Right Side Boxes */}
          <div className="lg:col-span-2 space-y-6">
            {/* Visualization Area */}
            <div className="bg-theme-tertiary/50 p-6 rounded-xl border border-theme-primary/50 shadow-2xl">
              <h3 className="font-bold text-lg text-theme-secondary mb-4 flex items-center gap-2">
                <BarChart3 size={20} /> Visualization
              </h3>
              {visualization}
            </div>

            {/* Comparisons & Swaps */}
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
                <h3 className="text-purple text-sm flex items-center gap-2">
                  <Repeat size={16} /> Total Swaps
                </h3>
                <p className="font-mono text-4xl text-purple mt-2">
                  {state.totalSwaps ?? 0}
                </p>
              </div>
            </div>

            {/* Explanation */}
            <div className="bg-theme-tertiary/50 p-4 rounded-xl border border-theme-primary/50 min-h-[5rem]">
              <h3 className="text-theme-tertiary text-sm mb-1">Explanation</h3>
              <p className="text-theme-secondary">{state.explanation}</p>
              {state.finished && (
                <CheckCircle className="inline-block ml-2 text-success" />
              )}
            </div>
          </div>

          {/* Complexity Analysis Full Width */}
          <div className="lg:col-span-3 bg-theme-tertiary/50 p-5 rounded-xl shadow-2xl border border-theme-primary/50">
            <h3 className="font-bold text-xl text-accent-primary mb-4 pb-3 border-b border-theme-primary/50 flex items-center gap-2">
              <Clock size={20} /> Complexity Analysis
            </h3>
            {complexityAnalysis}
          </div>
        </div>
      )}
      {!isLoaded && (
        <p className="text-center text-theme-muted py-10">
          Load an array to begin visualization.
        </p>
      )}
    </div>
  );
};

export default SortingVisualizerLayout;