import React, { useState, useEffect } from "react";
import { ArrowLeft, RefreshCw, Play, RotateCcw, Code, Zap, Clock, Cpu, ArrowLeftRight } from "lucide-react";

const ReverseString = ({ navigate }) => {
  const [inputString, setInputString] = useState("hello");
  const [chars, setChars] = useState([]);
  const [leftPointer, setLeftPointer] = useState(0);
  const [rightPointer, setRightPointer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [isComplete, setIsComplete] = useState(false);
  const [swapHistory, setSwapHistory] = useState([]);
  const [currentSwap, setCurrentSwap] = useState(null);

  const resetAnimation = () => {
    const charArray = inputString.split('');
    setChars(charArray);
    setLeftPointer(0);
    setRightPointer(charArray.length - 1);
    setIsPlaying(false);
    setIsComplete(false);
    setSwapHistory([]);
    setCurrentSwap(null);
  };

  const startAnimation = () => {
    resetAnimation();
    setIsPlaying(true);
  };

  const loadExamples = (example) => {
    const examples = {
      example1: "hello",
      example2: "world",
      example3: "algorithm",
      example4: "racecar",
      example5: "javascript",
      example6: "react"
    };
    setInputString(examples[example]);
  };

  useEffect(() => {
    if (inputString) {
      resetAnimation();
    }
  }, [inputString]);

  useEffect(() => {
    let interval;
    if (isPlaying && leftPointer < rightPointer && !isComplete) {
      interval = setInterval(() => {
        setChars(prevChars => {
          const newChars = [...prevChars];
          
          // Record the swap
          setCurrentSwap({
            left: leftPointer,
            right: rightPointer,
            leftChar: newChars[leftPointer],
            rightChar: newChars[rightPointer]
          });

          setSwapHistory(prev => [...prev, {
            left: leftPointer,
            right: rightPointer,
            leftChar: newChars[leftPointer],
            rightChar: newChars[rightPointer]
          }]);

          // Perform the swap
          const temp = newChars[leftPointer];
          newChars[leftPointer] = newChars[rightPointer];
          newChars[rightPointer] = temp;

          // Update pointers for next iteration
          const newLeft = leftPointer + 1;
          const newRight = rightPointer - 1;

          if (newLeft >= newRight) {
            setIsPlaying(false);
            setIsComplete(true);
          } else {
            setLeftPointer(newLeft);
            setRightPointer(newRight);
          }

          return newChars;
        });
      }, speed);
    }

    return () => clearInterval(interval);
  }, [isPlaying, leftPointer, rightPointer, isComplete, speed]);

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary p-6">
      <div className="max-w-6xl mx-auto mb-8">
        <button
          onClick={() => navigate("home")}
          className="flex items-center gap-2 text-theme-secondary hover:text-theme-primary transition-colors mb-6 group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          Back to String Problems
        </button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <RefreshCw className="h-12 w-12 text-accent-primary" />
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary400 to-teal400">
              Reverse String
            </h1>
          </div>
          <p className="text-theme-tertiary text-lg max-w-2xl mx-auto">
            Reverse characters in a string in-place using two pointers
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-theme-secondary/50 rounded-2xl p-6 border border-theme-secondary">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={startAnimation}
                  disabled={isPlaying}
                  className="flex items-center gap-2 px-6 py-3 bg-accent-primary hover:bg-accent-primary-hover disabled:bg-accent-primary/50 rounded-xl font-medium transition-all disabled:cursor-not-allowed"
                >
                  <Play className="h-4 w-4" />
                  {isPlaying ? "Running..." : "Start Animation"}
                </button>
                <button
                  onClick={resetAnimation}
                  className="flex items-center gap-2 px-4 py-2 bg-theme-elevated hover:bg-theme-elevated rounded-xl font-medium transition-all"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-theme-tertiary text-sm">Speed:</label>
                <select 
                  value={speed} 
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="bg-theme-tertiary border border-theme-primary rounded-lg px-3 py-2 text-theme-primary"
                >
                  <option value={1500}>Slow</option>
                  <option value={1000}>Medium</option>
                  <option value={500}>Fast</option>
                  <option value={250}>Very Fast</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-theme-tertiary text-sm mb-2 block">Input String:</label>
              <input
                type="text"
                value={inputString}
                onChange={(e) => setInputString(e.target.value)}
                className="w-full bg-theme-tertiary border border-theme-primary rounded-lg px-4 py-3 text-theme-primary text-lg font-mono"
                placeholder="Enter a string..."
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={() => loadExamples('example1')} className="px-3 py-1 bg-accent-primary-light border border-accent-primary/30 rounded-lg text-accent-primary text-sm hover:bg-accent-primary/30 transition-all">
                hello
              </button>
              <button onClick={() => loadExamples('example2')} className="px-3 py-1 bg-teal/20 border border-teal500/30 rounded-lg text-teal text-sm hover:bg-teal/30 transition-all">
                world
              </button>
              <button onClick={() => loadExamples('example3')} className="px-3 py-1 bg-purplelight border border-purple/30 rounded-lg text-purple text-sm hover:bg-purple/30 transition-all">
                algorithm
              </button>
              <button onClick={() => loadExamples('example4')} className="px-3 py-1 bg-success-light border border-success/30 rounded-lg text-success text-sm hover:bg-success-light transition-all">
                racecar
              </button>
              <button onClick={() => loadExamples('example5')} className="px-3 py-1 bg-orangelight border border-orange/30 rounded-lg text-orange text-sm hover:bg-orange/30 transition-all">
                javascript
              </button>
              <button onClick={() => loadExamples('example6')} className="px-3 py-1 bg-pinklight border border-pink/30 rounded-lg text-pink text-sm hover:bg-pink/30 transition-all">
                react
              </button>
            </div>
          </div>

          <div className="bg-theme-secondary/50 rounded-2xl p-8 border border-theme-secondary">
            <h3 className="text-xl font-bold text-theme-primary mb-6 text-center">Two-Pointer Swap Visualization</h3>
            
            {/* String Visualization */}
            <div className="flex justify-center items-center gap-3 mb-8 flex-wrap min-h-[120px]">
              {chars.map((char, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="text-theme-tertiary text-xs font-mono">[{index}]</div>
                  <div
                    className={`w-16 h-16 flex items-center justify-center rounded-lg border-2 transition-all duration-500 ${
                      index === leftPointer && isPlaying
                        ? "bg-accent-primary/30 border-accent-primary scale-110 shadow-lg shadow-accent-primary/25 animate-pulse"
                        : index === rightPointer && isPlaying
                        ? "bg-purple/30 border-purple scale-110 shadow-lg shadow-purple/25 animate-pulse"
                        : isComplete
                        ? "bg-success-light border-success"
                        : swapHistory.some(h => h.left === index || h.right === index)
                        ? "bg-teal/20 border-teal400"
                        : "bg-theme-tertiary border-theme-primary"
                    }`}
                  >
                    <span className="text-theme-primary font-bold text-2xl font-mono">{char}</span>
                  </div>
                  <div className="text-xs font-bold">
                    {index === leftPointer && isPlaying && (
                      <span className="text-accent-primary">LEFT</span>
                    )}
                    {index === rightPointer && isPlaying && (
                      <span className="text-purple">RIGHT</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pointer Indicators */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-accent-primary-light border border-accent-primary/30 rounded-lg p-4">
                <div className="text-accent-primary text-sm font-bold mb-1">Left Pointer</div>
                <div className="text-theme-primary text-2xl font-mono">
                  {isPlaying || isComplete ? `[${leftPointer}] = '${chars[leftPointer]}'` : "Not started"}
                </div>
              </div>
              <div className="bg-purplelight border border-purple/30 rounded-lg p-4">
                <div className="text-purple text-sm font-bold mb-1">Right Pointer</div>
                <div className="text-theme-primary text-2xl font-mono">
                  {isPlaying || isComplete ? `[${rightPointer}] = '${chars[rightPointer]}'` : "Not started"}
                </div>
              </div>
            </div>

            {/* Current Swap */}
            {currentSwap && isPlaying && (
              <div className="mb-6 p-4 rounded-lg border-2 bg-teal/10 border-teal500/30">
                <div className="text-center">
                  <div className="text-sm text-theme-tertiary mb-2">Current Swap</div>
                  <div className="text-xl font-mono flex items-center justify-center gap-3">
                    <span className="text-accent-primary">'{currentSwap.leftChar}'</span>
                    <ArrowLeftRight className="h-5 w-5 text-teal animate-pulse" />
                    <span className="text-purple">'{currentSwap.rightChar}'</span>
                  </div>
                  <div className="text-sm text-theme-tertiary mt-2">
                    Swapping positions [{currentSwap.left}] ↔ [{currentSwap.right}]
                  </div>
                </div>
              </div>
            )}

            {/* Result Display */}
            <div className="bg-theme-tertiary rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-theme-tertiary text-sm mb-2">Original:</div>
                  <div className="text-theme-primary text-xl font-mono">{inputString}</div>
                </div>
                <div>
                  <div className="text-theme-tertiary text-sm mb-2">Reversed:</div>
                  <div className={`text-xl font-mono transition-colors ${
                    isComplete ? "text-success font-bold" : "text-theme-primary"
                  }`}>
                    {chars.join('')}
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="text-center">
              {isComplete ? (
                <div className="flex items-center justify-center gap-3 text-2xl font-bold text-success animate-pulse">
                  <RefreshCw className="h-8 w-8" />
                  String Reversed Successfully!
                </div>
              ) : isPlaying ? (
                <div className="text-lg text-warning">
                  Swapping characters at positions {leftPointer} and {rightPointer}...
                </div>
              ) : (
                <div className="text-theme-tertiary">
                  Click "Start Animation" to reverse the string
                </div>
              )}
            </div>
          </div>

          {/* Swap History */}
          {swapHistory.length > 0 && (
            <div className="bg-theme-secondary/50 rounded-2xl p-6 border border-theme-secondary">
              <h3 className="text-xl font-bold text-theme-primary mb-4">Swap History</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {swapHistory.map((swap, index) => (
                  <div key={index} className="p-3 rounded-lg border bg-teal/10 border-teal500/30">
                    <div className="text-sm font-mono flex items-center justify-between">
                      <span>
                        Step {index + 1}: 
                        <span className="text-accent-primary"> [{swap.left}]='{swap.leftChar}' </span>
                        <ArrowLeftRight className="h-3 w-3 inline text-teal" />
                        <span className="text-purple"> [{swap.right}]='{swap.rightChar}'</span>
                      </span>
                      <span className="text-teal">Swapped ✓</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-theme-secondary/50 rounded-2xl p-6 border border-theme-secondary">
            <h3 className="text-xl font-bold text-theme-primary mb-4">Platform</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-accent-primary-light border border-accent-primary/30 rounded-lg">
                <Code className="h-5 w-5 text-accent-primary" />
                <div>
                  <div className="font-bold text-theme-primary">LeetCode #344</div>
                  <div className="text-sm text-theme-tertiary">Reverse String</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-theme-secondary/50 rounded-2xl p-6 border border-theme-secondary">
            <h3 className="text-xl font-bold text-theme-primary mb-4">C++ Solution</h3>
            <div className="bg-theme-primary rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <div className="text-accent-primary">void reverseString(vector<span className="text-pink">{'<'}</span>char<span className="text-pink">{'>'}</span>& s) {'{'}</div>
              <div className={`text-success ml-4 ${isPlaying ? "bg-success-light px-2 rounded" : ""}`}>
                int left = 0;
              </div>
              <div className={`text-success ml-4 ${isPlaying ? "bg-success-light px-2 rounded" : ""}`}>
                int right = s.size() - 1;
              </div>
              <div className="text-success ml-4 mt-2">while (left {'<'} right) {'{'}</div>
              <div className={`text-warning ml-8 ${isPlaying ? "bg-warning-light px-2 rounded" : ""}`}>
                swap(s[left], s[right]);
              </div>
              <div className={`text-teal ml-8 ${isPlaying ? "bg-teal/20 px-2 rounded" : ""}`}>
                left++;
              </div>
              <div className={`text-purple ml-8 ${isPlaying ? "bg-purplelight px-2 rounded" : ""}`}>
                right--;
              </div>
              <div className="text-success ml-4">{'}'}</div>
              <div className="text-accent-primary">{'}'}</div>
            </div>
          </div>

          <div className="bg-theme-secondary/50 rounded-2xl p-6 border border-theme-secondary">
            <h3 className="text-xl font-bold text-theme-primary mb-4">Algorithm Details</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <div className="font-bold text-theme-primary">Time Complexity</div>
                  <div className="text-sm text-theme-tertiary">O(n/2) ≈ O(n) - Swap half the characters</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Cpu className="h-5 w-5 text-accent-primary mt-0.5" />
                <div>
                  <div className="font-bold text-theme-primary">Space Complexity</div>
                  <div className="text-sm text-theme-tertiary">O(1) - In-place reversal with two pointers</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-purple mt-0.5" />
                <div>
                  <div className="font-bold text-theme-primary">Approach</div>
                  <div className="text-sm text-theme-tertiary">Two Pointers - Swap characters from both ends moving inward</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-theme-secondary/50 rounded-2xl p-6 border border-theme-secondary">
            <h3 className="text-xl font-bold text-theme-primary mb-4">How It Works</h3>
            <div className="space-y-3 text-sm text-theme-tertiary">
              <div className="flex gap-2">
                <span className="text-accent-primary font-bold">1.</span>
                <span>Initialize two pointers: left at start, right at end</span>
              </div>
              <div className="flex gap-2">
                <span className="text-accent-primary font-bold">2.</span>
                <span>Swap characters at both pointer positions</span>
              </div>
              <div className="flex gap-2">
                <span className="text-accent-primary font-bold">3.</span>
                <span>Move left pointer forward and right pointer backward</span>
              </div>
              <div className="flex gap-2">
                <span className="text-accent-primary font-bold">4.</span>
                <span>Continue until pointers meet or cross</span>
              </div>
              <div className="flex gap-2">
                <span className="text-accent-primary font-bold">5.</span>
                <span>String is now reversed in-place</span>
              </div>
            </div>
          </div>

          <div className="bg-theme-secondary/50 rounded-2xl p-6 border border-theme-secondary">
            <h3 className="text-xl font-bold text-theme-primary mb-4">Key Points</h3>
            <div className="space-y-2 text-sm text-theme-tertiary">
              <div className="flex items-start gap-2">
                <span className="text-teal">•</span>
                <span>In-place algorithm - no extra space needed</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-teal">•</span>
                <span>Classic two-pointer technique application</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-teal">•</span>
                <span>Only n/2 swaps needed to reverse entire string</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-teal">•</span>
                <span>Works for any string length including odd/even</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReverseString;