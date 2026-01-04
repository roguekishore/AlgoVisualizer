import React, { useState, useEffect } from "react";
import { ArrowLeft, RefreshCw, Play, RotateCcw, Code, Zap, Clock, Cpu, Divide } from "lucide-react";

const SplitArrayLargestSum = ({ navigate }) => {
  const [nums, setNums] = useState([7, 2, 5, 10, 8]);
  const [originalNums, setOriginalNums] = useState([7, 2, 5, 10, 8]);
  const [k, setK] = useState(2);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState(null);

  const resetAnimation = () => {
    setNums([...originalNums]);
    setIsPlaying(false);
    setIsComplete(false);
    setResult(null);
  };

  const loadDefaultArray = () => {
    const defaultArray = [7, 2, 5, 10, 8];
    setNums(defaultArray);
    setOriginalNums(defaultArray);
    resetAnimation();
  };

  const generateNewArray = () => {
    const newArray = Array.from({ length: 6 }, () => Math.floor(Math.random() * 15) + 1);
    setNums(newArray);
    setOriginalNums([...newArray]);
    resetAnimation();
  };

  // Helper function
  const canSplit = (arr, maxSum, k) => {
    let subCount = 1, current = 0;
    for (let n of arr) {
      if (current + n > maxSum) {
        subCount++;
        current = n;
      } else current += n;
    }
    return subCount <= k;
  };

  const findMinLargestSum = async () => {
    let left = Math.max(...nums);
    let right = nums.reduce((a, b) => a + b, 0);
    let ans = right;

    setIsPlaying(true);
    while (left <= right) {
      await new Promise((r) => setTimeout(r, speed));
      let mid = Math.floor((left + right) / 2);

      if (canSplit(nums, mid, k)) {
        ans = mid;
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }
    setResult(ans);
    setIsPlaying(false);
    setIsComplete(true);
  };

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary p-6">
      <div className="max-w-6xl mx-auto mb-8">
        <button
          onClick={() => navigate("home")}
          className="flex items-center gap-2 text-theme-secondary hover:text-theme-primary transition-colors mb-6 group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          Back to Array Problems
        </button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Divide className="h-12 w-12 text-purple" />
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple400 to-pink400">
              Split Array Largest Sum
            </h1>
          </div>
          <p className="text-theme-tertiary text-lg max-w-2xl mx-auto">
            Split nums into k subarrays to minimize the largest subarray sum.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls + Visualization */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-theme-secondary/50 rounded-2xl p-6 border border-theme-secondary">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={loadDefaultArray}
                  className="flex items-center gap-2 px-4 py-2 bg-accent-primary hover:bg-accent-primary-hover rounded-xl font-medium transition-all"
                >
                  Load & Visualize
                </button>
                <button
                  onClick={findMinLargestSum}
                  disabled={isPlaying}
                  className="flex items-center gap-2 px-6 py-3 bg-success hover:bg-success-hover disabled:bg-success/50 rounded-xl font-medium transition-all disabled:cursor-not-allowed"
                >
                  <Play className="h-4 w-4" />
                  {isPlaying ? "Running..." : "Start Simulation"}
                </button>
                <button
                  onClick={resetAnimation}
                  className="flex items-center gap-2 px-4 py-2 bg-theme-elevated hover:bg-theme-elevated rounded-xl font-medium transition-all"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>
              <button
                onClick={generateNewArray}
                className="px-4 py-2 bg-purple hover:bg-purplehover rounded-xl font-medium transition-all"
              >
                New Array
              </button>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <label className="text-theme-tertiary text-sm">Speed:</label>
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="bg-theme-tertiary border border-theme-primary rounded-lg px-3 py-2 text-theme-primary"
              >
                <option value={1500}>Slow</option>
                <option value={1000}>Medium</option>
                <option value={500}>Fast</option>
              </select>

              <div className="flex items-center gap-3 ml-4">
                <label className="text-theme-tertiary text-sm">k:</label>
                <input
                  type="number"
                  value={k}
                  onChange={(e) => setK(Number(e.target.value))}
                  className="bg-theme-tertiary border border-theme-primary rounded-lg px-3 py-1 w-16 text-center"
                  min={1}
                  max={nums.length}
                />
              </div>
            </div>
          </div>

          <div className="bg-theme-secondary/50 rounded-2xl p-8 border border-theme-secondary">
            <h3 className="text-xl font-bold text-theme-primary mb-6 text-center">
              Binary Search Visualization
            </h3>

            {/* Array Visualization */}
            <div className="flex justify-center items-end gap-4 mb-8">
              {nums.map((value, index) => (
                <div key={index} className="flex flex-col items-center gap-3">
                  <div className="text-theme-tertiary text-sm font-mono">[{index}]</div>
                  <div
                    className="w-16 bg-accent-primary/30 border-2 border-accent-primary rounded-lg flex items-center justify-center font-bold text-theme-primary text-lg"
                    style={{ height: `${value * 10 + 60}px` }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              {isComplete ? (
                <div className="flex items-center justify-center gap-3 text-2xl font-bold text-success animate-pulse">
                  <RefreshCw className="h-8 w-8" />
                  Minimized Largest Sum: {result}
                </div>
              ) : isPlaying ? (
                <div className="flex items-center justify-center gap-3 text-lg text-warning">
                  <Zap className="h-5 w-5" />
                  Performing binary search to minimize largest sum...
                </div>
              ) : (
                <div className="text-theme-tertiary">
                  Click "Start Simulation" to begin.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Explanation + C++ */}
        <div className="space-y-6">
          <div className="bg-theme-secondary/50 rounded-2xl p-6 border border-theme-secondary">
            <h3 className="text-xl font-bold text-theme-primary mb-4">C++ Solution</h3>
            <div className="bg-theme-primary rounded-lg p-4 font-mono text-sm">
              <div className="text-accent-primary">
                int splitArray(vector&lt;int&gt;& nums, int k) {'{'}
              </div>
              <div className="text-success ml-4">int left = *max_element(nums.begin(), nums.end());</div>
              <div className="text-success ml-4">int right = accumulate(nums.begin(), nums.end(), 0);</div>
              <div className="text-success ml-4">int ans = right;</div>
              <div className="text-success ml-4">while (left {'<='} right) {'{'}</div>
              <div className="text-warning ml-8">int mid = (left + right) / 2;</div>
              <div className="text-warning ml-8">if (canSplit(nums, mid, k)) {'{'}</div>
              <div className="text-success ml-12">ans = mid; right = mid - 1;</div>
              <div className="text-warning ml-8">{'}'} else left = mid + 1;</div>
              <div className="text-success ml-4">{'}'}</div>
              <div className="text-accent-primary ml-4">return ans;</div>
              <div className="text-accent-primary">{'}'}</div>
            </div>
          </div>

          <div className="bg-theme-secondary/50 rounded-2xl p-6 border border-theme-secondary">
            <h3 className="text-xl font-bold text-theme-primary mb-4">Complexity Analysis</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-accent-primary mt-1" />
                <div>
                  <div className="font-bold text-theme-primary">Time Complexity: O(N × log(Sum))</div>
                  <div className="text-sm text-theme-tertiary">
                    Binary search on possible largest sums, checking each with linear scan.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Cpu className="h-5 w-5 text-success mt-1" />
                <div>
                  <div className="font-bold text-theme-primary">Space Complexity: O(1)</div>
                  <div className="text-sm text-theme-tertiary">Only uses a few variables for checks.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplitArrayLargestSum;
