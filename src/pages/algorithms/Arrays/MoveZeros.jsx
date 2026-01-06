import React, { useState, useEffect } from "react";
import { ArrowLeft, MoveRight, Play, RotateCcw, Code, Zap, Clock, Cpu } from "lucide-react";

const MoveZeros = ({ navigate }) => {
  const [array, setArray] = useState([0, 1, 0, 3, 12, 0, 8, 0]);
  const [originalArray, setOriginalArray] = useState([0, 1, 0, 3, 12, 0, 8, 0]);
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [isComplete, setIsComplete] = useState(false);
  const [steps, setSteps] = useState(0);

  const resetAnimation = () => {
    setLeft(0);
    setRight(0);
    setIsPlaying(false);
    setIsComplete(false);
    setSteps(0);
  };

  const startAnimation = () => {
    resetAnimation(); // ensures clean state
    setArray([...originalArray]); // use the already generated array
    setIsComplete(false);
    setIsPlaying(true);
  };

  const generateNewArray = () => {
    const newArray = Array.from({ length: 8 }, () => 
      Math.random() > 0.5 ? Math.floor(Math.random() * 15) + 1 : 0
    );
    setArray(newArray);
    setOriginalArray([...newArray]);
    console.log("New array generated:", newArray);
    console.log("Original array:", originalArray);
    resetAnimation();
  };

  const loadDefaultArray = () => {
    const defaultArray = [0, 1, 0, 3, 12, 0, 8, 0];
    setArray([...defaultArray]);
    setOriginalArray([...defaultArray]);
    resetAnimation();
  };

  useEffect(() => {
    let interval;
    if (isPlaying && right < array.length) {
      interval = setInterval(() => {
          setSteps(s => s + 1);
          if (array[right] !== 0) {
            const newArray = [...array];
            [newArray[left], newArray[right]] = [newArray[right], newArray[left]];
            setArray(newArray);
            setLeft(prevleft => prevleft + 1);
          }
          setRight(prevright => prevright + 1);
      }, speed);
    }
    else if (isPlaying && right === array.length){
      setIsPlaying(false);
      setIsComplete(true);
    }

    return () => clearInterval(interval);
  }, [isPlaying, right, array, left, speed, setIsComplete,setRight,setLeft,setSteps]);

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
            <MoveRight className="h-12 w-12 text-purple" />
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple400 to-pink400">
              Move Zeros to End
            </h1>
          </div>
          <p className="text-theme-tertiary text-lg max-w-2xl mx-auto">
            Move all zeros to the end while maintaining relative order of non-zero elements
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-theme-secondary/50 rounded-2xl p-6 border border-theme-secondary">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={loadDefaultArray}
                  className="flex items-center gap-2 px-4 py-2 bg-accent-primary hover:bg-accent-primary-hover rounded-xl font-medium transition-all cursor-pointer"
                >
                  Load & Visualize
                </button>
                <button
                  onClick={startAnimation}
                  disabled={isPlaying}
                  className="flex items-center gap-2 px-6 py-3 cursor-pointer bg-success hover:bg-success-hover disabled:bg-success/50 rounded-xl font-medium transition-all disabled:cursor-not-allowed"
                >
                  <Play className="h-4 w-4" />
                  {isPlaying ? "Running..." : "Start Animation"}
                </button>
                <button
                  onClick={resetAnimation}
                  className="flex items-center gap-2 px-4 py-2 bg-theme-elevated hover:bg-theme-elevated rounded-xl font-medium transition-all cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>
              <button
                onClick={generateNewArray}
                className="px-4 py-2 bg-purple cursor-pointer hover:bg-purplehover rounded-xl font-medium transition-all"
              >
                New Array
              </button>
            </div>

            <div className="flex items-center gap-4">
              <label className="text-theme-tertiary text-sm">Speed:</label>
              <select 
                value={speed} 
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="bg-theme-tertiary border border-theme-primary cursor-pointer rounded-lg px-3 py-2 text-theme-primary"
              >
                <option value={1500}>Slow</option>
                <option value={1000}>Medium</option>
                <option value={500}>Fast</option>
                <option value={250}>Very Fast</option>
              </select>
              <div className="flex items-center gap-2 ml-4">
                <Code className="h-4 w-4 text-accent-primary" />
                <span className="text-sm text-theme-secondary">Steps: {steps}</span>
              </div>
            </div>
          </div>

          <div className="bg-theme-secondary/50 rounded-2xl p-8 border border-theme-secondary">
            <h3 className="text-xl font-bold text-theme-primary mb-6 text-center">Two Pointers Visualization</h3>
            
            {/* Pointers */}
            <div className="flex justify-center gap-4 mb-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-success rounded-full"></div>
                <span className="text-theme-tertiary">Left Pointer (non-zero boundary): {left}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-warning rounded-full"></div>
                <span className="text-theme-tertiary">Right Pointer (current): {right}</span>
              </div>
            </div>

            {/* Array Visualization */}
            <div className="flex justify-center items-end gap-4 mb-8 min-h-[200px]">
              {array.map((value, index) => (
                <div key={index} className="flex flex-col items-center gap-3">
                  <div className="text-theme-tertiary text-sm font-mono">[{index}]</div>
                  <div
                    className={`w-16 flex flex-col items-center justify-end rounded-lg border-2 transition-all duration-300 ${
                      index === right && !isComplete
                        ? "bg-warning-light border-warning scale-110 shadow-lg shadow-warning/25"
                        : index === left
                        ? "bg-success-light border-success scale-105 shadow-lg shadow-success/25"
                        : value === 0
                        ? "bg-danger-light border-danger"
                        : "bg-accent-primary-light border-accent-primary"
                    } ${
                      isComplete && value === 0
                        ? "bg-danger/30 border-danger"
                        : ""
                    }`}
                    style={{ height: `${value === 0 ? 60 : value * 10 + 60}px` }}
                  >
                    <div className="flex-1 flex items-center justify-center">
                      <span className="text-theme-primary font-bold text-lg">{value}</span>
                    </div>
                    <div className={`w-full text-center py-1 text-xs font-bold ${
                      value === 0 ? "bg-danger text-theme-primary" : "bg-accent-primary text-theme-primary"
                    }`}>
                      {value === 0 ? "ZERO" : "NON-ZERO"}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              {isComplete ? (
                <div className="flex items-center justify-center gap-3 text-2xl font-bold text-success animate-pulse">
                  <MoveRight className="h-8 w-8" />
                  All zeros moved to end!
                </div>
              ) : isPlaying ? (
                <div className="flex items-center justify-center gap-3 text-lg text-warning">
                  <Zap className="h-5 w-5" />
                  Processing element at index {right}...
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
              <div className="flex items-center gap-3 p-3 bg-orangelight border border-orange/30 rounded-lg">
                <Code className="h-5 w-5 text-orange" />
                <div>
                  <div className="font-bold text-theme-primary">LeetCode #283</div>
                  <div className="text-sm text-theme-tertiary">Move Zeroes</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-theme-secondary/50 rounded-2xl p-6 border border-theme-secondary">
            <h3 className="text-xl font-bold text-theme-primary mb-4">C++ Solution</h3>
            <div className="bg-theme-primary rounded-lg p-4 font-mono text-sm">
              <div className="text-accent-primary">void moveZeroes(vector<span className="text-pink">{'<'}</span>int<span className="text-pink">{'>'}</span>& nums) {'{'}</div>
              <div className="text-success ml-4">int left = 0;</div>
              <div className="text-success ml-4">for (int right = 0; right {'<'} nums.size(); right++) {'{'}</div>
              <div className={`text-warning ml-8 ${right > 0 ? "bg-warning-light px-2 rounded" : ""}`}>
                if (nums[right] != 0) {'{'}
              </div>
              <div className={`text-danger ml-12 ${array[right] !== 0 && right > left ? "bg-danger-light px-2 rounded" : ""}`}>
                swap(nums[left], nums[right]);
              </div>
              <div className="text-warning ml-8">{'}'}</div>
              <div className={`text-success ml-8 ${array[right] !== 0 ? "bg-success-light px-2 rounded" : ""}`}>
                if (nums[right] != 0) left++;
              </div>
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
                    Single pass through array using two pointers
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

export default MoveZeros;