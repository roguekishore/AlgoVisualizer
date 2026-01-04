import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowLeftRight, Play, RotateCcw, Code, Zap, Clock, Cpu, CheckCircle, XCircle } from "lucide-react";

const PalindromeCheck = ({ navigate }) => {
  const [inputString, setInputString] = useState("racecar");
  const [chars, setChars] = useState([]);
  const [leftPointer, setLeftPointer] = useState(0);
  const [rightPointer, setRightPointer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [isComplete, setIsComplete] = useState(false);
  const [isPalindrome, setIsPalindrome] = useState(null);
  const [comparisonHistory, setComparisonHistory] = useState([]);
  const [currentComparison, setCurrentComparison] = useState(null);

  const resetAnimation = () => {
    const charArray = inputString.toLowerCase().split('');
    setChars(charArray);
    setLeftPointer(0);
    setRightPointer(charArray.length - 1);
    setIsPlaying(false);
    setIsComplete(false);
    setIsPalindrome(null);
    setComparisonHistory([]);
    setCurrentComparison(null);
  };

  const startAnimation = () => {
    resetAnimation();
    setIsPlaying(true);
  };

  const loadExamples = (example) => {
    const examples = {
      palindrome1: "racecar",
      palindrome2: "madam",
      palindrome3: "noon",
      notPalindrome1: "hello",
      notPalindrome2: "world",
      notPalindrome3: "algorithm"
    };
    setInputString(examples[example]);
    resetAnimation();
  };

  useEffect(() => {
    if (inputString) {
      resetAnimation();
    }
  }, [inputString]);

  useEffect(() => {
    let interval;
    if (isPlaying && leftPointer <= rightPointer && !isComplete) {
      interval = setInterval(() => {
        const charArray = inputString.toLowerCase().split('');
        
        setCurrentComparison({
          left: leftPointer,
          right: rightPointer,
          leftChar: charArray[leftPointer],
          rightChar: charArray[rightPointer],
          match: charArray[leftPointer] === charArray[rightPointer]
        });

        setComparisonHistory(prev => [...prev, {
          left: leftPointer,
          right: rightPointer,
          leftChar: charArray[leftPointer],
          rightChar: charArray[rightPointer],
          match: charArray[leftPointer] === charArray[rightPointer]
        }]);

        if (charArray[leftPointer] !== charArray[rightPointer]) {
          setIsPalindrome(false);
          setIsPlaying(false);
          setIsComplete(true);
          return;
        }

        if (leftPointer >= rightPointer) {
          setIsPalindrome(true);
          setIsPlaying(false);
          setIsComplete(true);
          return;
        }

        setLeftPointer(prev => prev + 1);
        setRightPointer(prev => prev - 1);
      }, speed);
    }

    return () => clearInterval(interval);
  }, [isPlaying, leftPointer, rightPointer, inputString, isComplete, speed]);

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
            <ArrowLeftRight className="h-12 w-12 text-success" />
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-success400 to-success400">
              Check Palindrome
            </h1>
          </div>
          <p className="text-theme-tertiary text-lg max-w-2xl mx-auto">
            Verify if a string reads the same backward as forward using two pointers
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
                  className="flex items-center gap-2 px-6 py-3 bg-success hover:bg-success-hover disabled:bg-success/50 rounded-xl font-medium transition-all disabled:cursor-not-allowed"
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
              <button onClick={() => loadExamples('palindrome1')} className="px-3 py-1 bg-success-light border border-success/30 rounded-lg text-success text-sm hover:bg-success-light transition-all">
                racecar
              </button>
              <button onClick={() => loadExamples('palindrome2')} className="px-3 py-1 bg-success-light border border-success/30 rounded-lg text-success text-sm hover:bg-success-light transition-all">
                madam
              </button>
              <button onClick={() => loadExamples('palindrome3')} className="px-3 py-1 bg-success-light border border-success/30 rounded-lg text-success text-sm hover:bg-success-light transition-all">
                noon
              </button>
              <button onClick={() => loadExamples('notPalindrome1')} className="px-3 py-1 bg-danger-light border border-danger/30 rounded-lg text-danger text-sm hover:bg-danger/30 transition-all">
                hello
              </button>
              <button onClick={() => loadExamples('notPalindrome2')} className="px-3 py-1 bg-danger-light border border-danger/30 rounded-lg text-danger text-sm hover:bg-danger/30 transition-all">
                world
              </button>
              <button onClick={() => loadExamples('notPalindrome3')} className="px-3 py-1 bg-danger-light border border-danger/30 rounded-lg text-danger text-sm hover:bg-danger/30 transition-all">
                algorithm
              </button>
            </div>
          </div>

          <div className="bg-theme-secondary/50 rounded-2xl p-8 border border-theme-secondary">
            <h3 className="text-xl font-bold text-theme-primary mb-6 text-center">Two-Pointer Visualization</h3>
            
            {/* String Visualization */}
            <div className="flex justify-center items-center gap-3 mb-8 flex-wrap min-h-[120px]">
              {chars.map((char, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="text-theme-tertiary text-xs font-mono">[{index}]</div>
                  <div
                    className={`w-16 h-16 flex items-center justify-center rounded-lg border-2 transition-all duration-300 ${
                      index === leftPointer && isPlaying
                        ? "bg-accent-primary/30 border-accent-primary scale-110 shadow-lg shadow-accent-primary/25"
                        : index === rightPointer && isPlaying
                        ? "bg-purple/30 border-purple scale-110 shadow-lg shadow-purple/25"
                        : isComplete && isPalindrome
                        ? "bg-success-light border-success"
                        : isComplete && !isPalindrome && (index === leftPointer || index === rightPointer)
                        ? "bg-danger/30 border-danger"
                        : comparisonHistory.some(h => h.left === index || h.right === index)
                        ? "bg-theme-elevated border-theme-muted"
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

            {/* Current Comparison */}
            {currentComparison && (
              <div className={`mb-6 p-4 rounded-lg border-2 ${
                currentComparison.match 
                  ? "bg-success-light border-success/30" 
                  : "bg-danger-light border-danger/30"
              }`}>
                <div className="text-center">
                  <div className="text-sm text-theme-tertiary mb-2">Current Comparison</div>
                  <div className="text-xl font-mono">
                    <span className="text-accent-primary">'{currentComparison.leftChar}'</span>
                    <span className="text-theme-tertiary mx-3">
                      {currentComparison.match ? "==" : "≠"}
                    </span>
                    <span className="text-purple">'{currentComparison.rightChar}'</span>
                  </div>
                </div>
              </div>
            )}

            {/* Result */}
            <div className="text-center">
              {isComplete ? (
                isPalindrome ? (
                  <div className="flex items-center justify-center gap-3 text-2xl font-bold text-success animate-pulse">
                    <CheckCircle className="h-8 w-8" />
                    "{inputString}" is a Palindrome!
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3 text-2xl font-bold text-danger animate-pulse">
                    <XCircle className="h-8 w-8" />
                    "{inputString}" is NOT a Palindrome
                  </div>
                )
              ) : isPlaying ? (
                <div className="text-lg text-warning">
                  Comparing characters at positions {leftPointer} and {rightPointer}...
                </div>
              ) : (
                <div className="text-theme-tertiary">
                  Click "Start Animation" to check if the string is a palindrome
                </div>
              )}
            </div>
          </div>

          {/* Comparison History */}
          {comparisonHistory.length > 0 && (
            <div className="bg-theme-secondary/50 rounded-2xl p-6 border border-theme-secondary">
              <h3 className="text-xl font-bold text-theme-primary mb-4">Comparison History</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {comparisonHistory.map((comp, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${
                    comp.match 
                      ? "bg-success-light border-success/30" 
                      : "bg-danger-light border-danger/30"
                  }`}>
                    <div className="text-sm font-mono">
                      Step {index + 1}: 
                      <span className="text-accent-primary"> [{comp.left}]='{comp.leftChar}' </span>
                      <span className="text-theme-tertiary">{comp.match ? "==" : "≠"}</span>
                      <span className="text-purple"> [{comp.right}]='{comp.rightChar}'</span>
                      <span className={comp.match ? "text-success" : "text-danger"}>
                        {" "}→ {comp.match ? "Match ✓" : "Mismatch ✗"}
                      </span>
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
              <div className="flex items-center gap-3 p-3 bg-success-light border border-success/30 rounded-lg">
                <Code className="h-5 w-5 text-success" />
                <div>
                  <div className="font-bold text-theme-primary">All Platforms</div>
                  <div className="text-sm text-theme-tertiary">Palindrome Check</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-theme-secondary/50 rounded-2xl p-6 border border-theme-secondary">
            <h3 className="text-xl font-bold text-theme-primary mb-4">C++ Solution</h3>
            <div className="bg-theme-primary rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <div className="text-accent-primary">bool isPalindrome(string s) {'{'}</div>
              <div className={`text-success ml-4 ${isPlaying ? "bg-success-light px-2 rounded" : ""}`}>
                int left = 0;
              </div>
              <div className={`text-success ml-4 ${isPlaying ? "bg-success-light px-2 rounded" : ""}`}>
                int right = s.length() - 1;
              </div>
              <div className="text-success ml-4 mt-2">while (left {'<'} right) {'{'}</div>
              <div className={`text-warning ml-8 ${isPlaying ? "bg-warning-light px-2 rounded" : ""}`}>
                if (s[left] != s[right]) {'{'}
              </div>
              <div className={`text-danger ml-12 ${isComplete && !isPalindrome ? "bg-danger-light px-2 rounded" : ""}`}>
                return false;
              </div>
              <div className="text-warning ml-8">{'}'}</div>
              <div className={`text-teal ml-8 ${isPlaying ? "bg-teal/20 px-2 rounded" : ""}`}>
                left++;
              </div>
              <div className={`text-purple ml-8 ${isPlaying ? "bg-purplelight px-2 rounded" : ""}`}>
                right--;
              </div>
              <div className="text-success ml-4">{'}'}</div>
              <div className={`text-success ml-4 mt-2 ${isComplete && isPalindrome ? "bg-success-light px-2 rounded" : ""}`}>
                return true;
              </div>
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
                  <div className="text-sm text-theme-tertiary">O(n/2) ≈ O(n) - Compare half the string</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Cpu className="h-5 w-5 text-accent-primary mt-0.5" />
                <div>
                  <div className="font-bold text-theme-primary">Space Complexity</div>
                  <div className="text-sm text-theme-tertiary">O(1) - Only two pointers</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-purple mt-0.5" />
                <div>
                  <div className="font-bold text-theme-primary">Approach</div>
                  <div className="text-sm text-theme-tertiary">Two Pointers - Compare from both ends moving inward</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-theme-secondary/50 rounded-2xl p-6 border border-theme-secondary">
            <h3 className="text-xl font-bold text-theme-primary mb-4">How It Works</h3>
            <div className="space-y-3 text-sm text-theme-tertiary">
              <div className="flex gap-2">
                <span className="text-success font-bold">1.</span>
                <span>Initialize two pointers: left at start, right at end</span>
              </div>
              <div className="flex gap-2">
                <span className="text-success font-bold">2.</span>
                <span>Compare characters at both pointers</span>
              </div>
              <div className="flex gap-2">
                <span className="text-success font-bold">3.</span>
                <span>If they don't match, it's not a palindrome</span>
              </div>
              <div className="flex gap-2">
                <span className="text-success font-bold">4.</span>
                <span>If they match, move left pointer right and right pointer left</span>
              </div>
              <div className="flex gap-2">
                <span className="text-success font-bold">5.</span>
                <span>Continue until pointers meet or cross</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PalindromeCheck;