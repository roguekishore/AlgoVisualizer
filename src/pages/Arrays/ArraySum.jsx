import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, Play, RotateCcw, Code, Zap, Clock, Cpu, Sigma } from "lucide-react";

const ArraySum = ({ navigate }) => {
  const [array, setArray] = useState([2, 5, 3, 8, 1, 7, 4, 6]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sum, setSum] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [isComplete, setIsComplete] = useState(false);
  const [partialSums, setPartialSums] = useState([]);

  const resetAnimation = () => {
    setCurrentIndex(0);
    setSum(0);
    setPartialSums([]);
    setIsPlaying(false);
    setIsComplete(false);
  };

  const startAnimation = () => {
    resetAnimation();
    setIsPlaying(true);
  };

  const generateNewArray = () => {
    const newArray = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10) + 1);
    setArray(newArray);
    resetAnimation();
  };

  const loadDefaultArray = () => {
    setArray([2, 5, 3, 8, 1, 7, 4, 6]);
    resetAnimation();
  };

  useEffect(() => {
    let interval;
    if (isPlaying && currentIndex < array.length) {
      interval = setInterval(() => {
        setCurrentIndex(prev => {
          const nextIndex = prev + 1;
          const newSum = sum + array[prev];
          setSum(newSum);
          setPartialSums(ps => [...ps, { index: prev, value: array[prev], cumulative: newSum }]);
          
          if (nextIndex >= array.length) {
            setIsPlaying(false);
            setIsComplete(true);
            return prev;
          }

          return nextIndex;
        });
      }, speed);
    }

    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, array, sum, speed]);

  const totalSum = array.reduce((acc, val) => acc + val, 0);

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary p-6">
      <div className="max-w-6xl mx-auto mb-8">
        <button
          onClick={() => navigate("home")}
          className="flex items-center gap-2 text-theme-secondary hover:text-theme-primary transition-colors mb-6 group cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform " />
          Back to Array Problems
        </button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Plus className="h-12 w-12 text-accent-primary" />
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary400 to-teal400">
              Array Sum
            </h1>
          </div>
          <p className="text-theme-tertiary text-lg max-w-2xl mx-auto">
            Calculate the sum of all elements in an array through cumulative addition
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
                  className="flex items-center gap-2 px-6 py-3 bg-success hover:bg-success-hover cursor-pointer disabled:bg-success/50 rounded-xl font-medium transition-all disabled:cursor-not-allowed"
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
                className="px-4 py-2 bg-purple hover:bg-purplehover rounded-xl font-medium transition-all cursor-pointer"
              >
                New Array
              </button>
            </div>

            <div className="flex items-center gap-4">
              <label className="text-theme-tertiary text-sm">Speed:</label>
              <select 
                value={speed} 
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="bg-theme-tertiary border border-theme-primary rounded-lg px-3 py-2 cursor-pointer text-theme-primary"
              >
                <option value={1500}>Slow</option>
                <option value={1000}>Medium</option>
                <option value={500}>Fast</option>
                <option value={250}>Very Fast</option>
              </select>
              <div className="flex items-center gap-2 ml-4">
                <Sigma className="h-4 w-4 text-success" />
                <span className="text-sm text-theme-secondary">Current Sum: {sum}</span>
              </div>
            </div>
          </div>

          <div className="bg-theme-secondary/50 rounded-2xl p-8 border border-theme-secondary">
            <h3 className="text-xl font-bold text-theme-primary mb-6 text-center">Cumulative Sum Visualization</h3>
            
            <div className="flex justify-center items-end gap-4 mb-8 min-h-[200px]">
              {array.map((value, index) => (
                <div key={index} className="flex flex-col items-center gap-3">
                  <div className="text-theme-tertiary text-sm font-mono">[{index}]</div>
                  <div
                    className={`w-16 flex flex-col items-center justify-end rounded-lg border-2 transition-all duration-300 ${
                      index === currentIndex && !isComplete
                        ? "bg-warning-light border-warning scale-110 shadow-lg shadow-warning/25"
                        : index < currentIndex
                        ? "bg-success-light border-success"
                        : "bg-accent-primary-light border-accent-primary"
                    }`}
                    style={{ height: `${value * 15 + 60}px` }}
                  >
                    <div className="flex-1 flex items-center justify-center">
                      <span className="text-theme-primary font-bold text-lg">{value}</span>
                    </div>
                    <div className="w-full text-center py-1 text-xs font-bold bg-theme-elevated text-theme-secondary">
                      +{value}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cumulative Sum Display */}
            <div className="bg-theme-tertiary rounded-lg p-4 mb-6">
              <div className="text-center">
                <div className="text-lg text-theme-secondary mb-2">Cumulative Sum Progress</div>
                <div className="text-2xl font-bold text-success">
                  {sum} / {totalSum}
                </div>
                <div className="w-full bg-theme-elevated rounded-full h-2 mt-2">
                  <div 
                    className="bg-success h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(sum / totalSum) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="text-center">
              {isComplete ? (
                <div className="flex items-center justify-center gap-3 text-2xl font-bold text-success animate-pulse">
                  <Sigma className="h-8 w-8" />
                  Total Sum: {sum}
                </div>
              ) : isPlaying ? (
                <div className="flex items-center justify-center gap-3 text-lg text-warning">
                  <Zap className="h-5 w-5" />
                  Adding element at index {currentIndex}: +{array[currentIndex]}
                </div>
              ) : (
                <div className="text-theme-tertiary">
                  Click "Start Animation" to begin visualization
                </div>
              )}
            </div>
          </div>

          {/* Steps Table */}
          <div className="bg-theme-secondary/50 rounded-2xl p-6 border border-theme-secondary">
            <h3 className="text-xl font-bold text-theme-primary mb-4">Step-by-Step Calculation</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-theme-primary">
                    <th className="text-left py-2 text-theme-tertiary">Step</th>
                    <th className="text-left py-2 text-theme-tertiary">Index</th>
                    <th className="text-left py-2 text-theme-tertiary">Value</th>
                    <th className="text-left py-2 text-theme-tertiary">Add</th>
                    <th className="text-left py-2 text-theme-tertiary">Cumulative Sum</th>
                  </tr>
                </thead>
                <tbody>
                  {partialSums.map((step, idx) => (
                    <tr key={idx} className="border-b border-theme-secondary">
                      <td className="py-2 text-theme-secondary">{idx + 1}</td>
                      <td className="py-2 text-theme-secondary">[{step.index}]</td>
                      <td className="py-2 text-theme-secondary">{step.value}</td>
                      <td className="py-2 text-success">+{step.value}</td>
                      <td className="py-2 text-accent-primary font-mono">{step.cumulative}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              <div className="text-accent-primary">int arraySum(vector<span className="text-pink">{'<'}</span>int<span className="text-pink">{'>'}</span>& arr) {'{'}</div>
              <div className="text-success ml-4">int sum = 0;</div>
              <div className="text-success ml-4">for (int i = 0; i {'<'} arr.size(); i++) {'{'}</div>
              <div className={`text-warning ml-8 ${currentIndex > 0 ? "bg-warning-light px-2 rounded" : ""}`}>
                sum += arr[i];
              </div>
              <div className="text-success ml-4">{'}'}</div>
              <div className="text-success ml-4">return sum;</div>
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
                    Single pass through array, adding each element once
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Cpu className="h-5 w-5 text-success mt-1" />
                <div>
                  <div className="font-bold text-theme-primary">Space Complexity: O(1)</div>
                  <div className="text-sm text-theme-tertiary">
                    Only constant space for sum variable
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

export default ArraySum;