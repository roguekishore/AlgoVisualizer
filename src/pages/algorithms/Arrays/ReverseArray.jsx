import React, { useState, useEffect } from "react";
import { ArrowLeft, RefreshCw, Play, RotateCcw, Code, Zap, Clock, Cpu, ArrowRight, ArrowLeft as ArrowLeftIcon } from "lucide-react";
import Tooltip from "../../../components/Tooltip";

const ReverseArray = ({ navigate }) => {
  const [array, setArray] = useState([1, 2, 3, 4, 5, 6, 7, 8]);
  const [originalArray, setOriginalArray] = useState([1, 2, 3, 4, 5, 6, 7, 8]);
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(7);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [isComplete, setIsComplete] = useState(false);
  const [swaps, setSwaps] = useState(0);

  const resetAnimation = () => {
    setArray([...originalArray]);
    setLeft(0);
    setRight(originalArray.length - 1);
    setIsPlaying(false);
    setIsComplete(false);
    setSwaps(0);
  };

  const startAnimation = () => {
    resetAnimation();
    setIsPlaying(true);
  };

  const generateNewArray = () => {
    const newArray = Array.from({ length: 8 }, (_, i) => i + 1);
    // Shuffle array
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    setArray(newArray);
    setOriginalArray([...newArray]);
    resetAnimation();
  };

  const loadDefaultArray = () => {
    const defaultArray = [1, 2, 3, 4, 5, 6, 7, 8];
    setArray([...defaultArray]);
    setOriginalArray([...defaultArray]);
    resetAnimation();
  };

  useEffect(() => {
    let interval;
    if (isPlaying && left < right) {
      interval = setInterval(() => {
        // Perform swap
        const newArray = [...array];
        [newArray[left], newArray[right]] = [newArray[right], newArray[left]];
        setArray(newArray);
        setSwaps(s => s + 1);

        // Move pointers
        setLeft(l => l + 1);
        setRight(r => r - 1);

        // Check completion
        if (left + 1 >= right - 1) {
          setIsPlaying(false);
          setIsComplete(true);
        }
      }, speed);
    } else if (left >= right) {
      setIsPlaying(false);
      setIsComplete(true);
    }

    return () => clearInterval(interval);
  }, [isPlaying, left, right, array, speed]);

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary p-6">
      <div className="max-w-6xl mx-auto mb-8">
        <button
          onClick={() => navigate("home")}
          className="flex items-center gap-2 text-theme-secondary hover:text-theme-primary transition-colors mb-6 group cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          Back to Array Problems
        </button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <RefreshCw className="h-12 w-12 text-purple" />
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple400 to-pink400">
              Reverse Array
            </h1>
          </div>
          <p className="text-theme-tertiary text-lg max-w-2xl mx-auto">
            Reverse the elements of an array in-place using two pointers
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-theme-secondary/50 rounded-2xl p-6 border border-theme-secondary">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <Tooltip content="Load default array and visualize" position="top">
                  <button
                    onClick={loadDefaultArray}
                    className="flex items-center gap-2 px-4 py-2 bg-accent-primary hover:bg-accent-primary-hover rounded-xl font-medium transition-all cursor-pointer"
                    aria-label="Load default array and visualize"
                  >
                    Load & Visualize
                  </button>
                </Tooltip>
                
                <Tooltip content={isPlaying ? "Running..." : "Start animation"} position="top">
                  <button
                    onClick={startAnimation}
                    disabled={isPlaying}
                    className="flex items-center gap-2 px-6 py-3 cursor-pointer bg-success hover:bg-success-hover disabled:bg-success/50 rounded-xl font-medium transition-all disabled:cursor-not-allowed"
                    aria-label={isPlaying ? "Running..." : "Start animation"}
                  >
                    <Play className="h-4 w-4" />
                    {isPlaying ? "Running..." : "Start Animation"}
                  </button>
                </Tooltip>
                
                <Tooltip content="Reset animation" position="top">
                  <button
                    onClick={resetAnimation}
                    className="flex items-center gap-2 px-4 py-2 cursor-pointer bg-theme-elevated hover:bg-theme-elevated rounded-xl font-medium transition-all"
                    aria-label="Reset animation"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>
                </Tooltip>
              </div>
              
              <Tooltip content="Generate new random array" position="top">
                <button
                  onClick={generateNewArray}
                  className="px-4 py-2 bg-purple cursor-pointer hover:bg-purplehover rounded-xl font-medium transition-all"
                  aria-label="Generate new random array"
                >
                  New Array
                </button>
              </Tooltip>
            </div>

            <div className="flex items-center gap-4">
              <label className="text-theme-tertiary text-sm">Speed:</label>
              <select 
                value={speed} 
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="bg-theme-tertiary border cursor-pointer border-theme-primary rounded-lg px-3 py-2 text-theme-primary"
              >
                <option value={1500}>Slow</option>
                <option value={1000}>Medium</option>
                <option value={500}>Fast</option>
                <option value={250}>Very Fast</option>
              </select>
              <div className="flex items-center gap-2 ml-4">
                <RefreshCw className="h-4 w-4 text-accent-primary" />
                <span className="text-sm text-theme-secondary">Swaps: {swaps}</span>
              </div>
            </div>
          </div>

          <div className="bg-theme-secondary/50 rounded-2xl p-8 border border-theme-secondary">
            <h3 className="text-xl font-bold text-theme-primary mb-6 text-center">Two Pointers Visualization</h3>
            
            {/* Pointers */}
            <div className="flex justify-center gap-8 mb-8 text-sm">
              <div className="flex items-center gap-2">
                <ArrowLeftIcon className="h-5 w-5 text-success" />
                <div className="w-4 h-4 bg-success rounded-full"></div>
                <span className="text-theme-tertiary">Left Pointer: {left}</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-warning" />
                <div className="w-4 h-4 bg-warning rounded-full"></div>
                <span className="text-theme-tertiary">Right Pointer: {right}</span>
              </div>
            </div>

            {/* Array Visualization */}
            <div className="flex justify-center items-end gap-4 mb-8 min-h-[200px]">
              {array.map((value, index) => (
                <div key={index} className="flex flex-col items-center gap-3">
                  <div className="text-theme-tertiary text-sm font-mono">[{index}]</div>
                  <div
                    className={`w-16 flex flex-col items-center justify-end rounded-lg border-2 transition-all duration-300 ${
                      index === left
                        ? "bg-success-light border-success scale-110 shadow-lg shadow-success/25"
                        : index === right
                        ? "bg-warning-light border-warning scale-110 shadow-lg shadow-warning/25"
                        : index < left || index > right
                        ? "bg-purplelight border-purple"
                        : "bg-accent-primary-light border-accent-primary"
                    } ${
                      isComplete ? "bg-purple/30 border-purple" : ""
                    }`}
                    style={{ height: `${value * 15 + 60}px` }}
                  >
                    <div className="flex-1 flex items-center justify-center">
                      <span className="text-theme-primary font-bold text-lg">{value}</span>
                    </div>
                    <div className={`w-full text-center py-1 text-xs font-bold ${
                      index === left ? "bg-success text-theme-primary" :
                      index === right ? "bg-warning text-theme-primary" :
                      "bg-theme-elevated text-theme-secondary"
                    }`}>
                      {index === left ? "L" : index === right ? "R" : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              {isComplete ? (
                <div className="flex items-center justify-center gap-3 text-2xl font-bold text-success animate-pulse">
                  <RefreshCw className="h-8 w-8" />
                  Array Successfully Reversed!
                </div>
              ) : isPlaying ? (
                <div className="flex items-center justify-center gap-3 text-lg text-warning">
                  <Zap className="h-5 w-5" />
                  Swapping elements at {left} and {right}...
                </div>
              ) : (
                <div className="text-theme-tertiary">
                  Click "Start Animation" to begin visualization
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-theme-secondary/50 rounded-2xl p-6 border border-theme-secondary">
            <h3 className="text-xl font-bold text-theme-primary mb-4">Platform</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-success-light border border-success/30 rounded-lg">
                <Code className="h-5 w-5 text-success" />
                <div>
                  <div className="font-bold text-theme-primary">All Platforms</div>
                  <div className="text-sm text-theme-tertiary">Fundamental Operation</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-theme-secondary/50 rounded-2xl p-6 border border-theme-secondary">
            <h3 className="text-xl font-bold text-theme-primary mb-4">C++ Solution</h3>
            <div className="bg-theme-primary rounded-lg p-4 font-mono text-sm">
              <div className="text-accent-primary">void reverseArray(vector<span className="text-pink">{'<'}</span>int<span className="text-pink">{'>'}</span>& arr) {'{'}</div>
              <div className="text-success ml-4">int left = 0;</div>
              <div className="text-success ml-4">int right = arr.size() - 1;</div>
              <div className="text-success ml-4">while (left {'<'} right) {'{'}</div>
              <div className={`text-warning ml-8 ${left < right ? "bg-warning-light px-2 rounded" : ""}`}>
                swap(arr[left], arr[right]);
              </div>
              <div className="text-success ml-8">left++;</div>
              <div className="text-success ml-8">right--;</div>
              <div className="text-success ml-4">{'}'}</div>
              <div className="text-accent-primary">{'}'}</div>
            </div>
          </div>

          <div className="bg-theme-secondary/50 rounded-2xl p-6 border border-theme-secondary">
            <h3 className="text-xl font-bold text-theme-primary mb-4">Complexity Analysis</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-accent-primary mt-1" />
                <div>
                  <div className="font-bold text-theme-primary">Time Complexity: O(N)</div>
                  <div className="text-sm text-theme-tertiary">
                    We traverse half the array, performing constant-time swaps
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Cpu className="h-5 w-5 text-success mt-1" />
                <div>
                  <div className="font-bold text-theme-primary">Space Complexity: O(1)</div>
                  <div className="text-sm text-theme-tertiary">
                    In-place modification with constant extra space
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReverseArray;