 import React, { useState, useEffect } from "react";
import { ArrowLeft, Target, Play, RotateCcw, Code, Zap, Clock, Cpu, Search } from "lucide-react";

const TwoSum = ({ navigate }) => {
  const [array, setArray] = useState([2, 7, 11, 15, 3, 6, 8, 4]);
  const [target, setTarget] = useState(9);
  const [map, setMap] = useState(new Map());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [isComplete, setIsComplete] = useState(false);
  const [found, setFound] = useState(false);
  const [pair, setPair] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);

  const resetAnimation = () => {
    setMap(new Map());
    setCurrentIndex(0);
    setIsPlaying(false);
    setIsComplete(false);
    setFound(false);
    setPair([]);
    setSearchHistory([]);
  };

  const startAnimation = () => {
    resetAnimation();
    setIsPlaying(true);
  };

  const generateNewArray = () => {
    const newArray = Array.from({ length: 8 }, () => Math.floor(Math.random() * 20) + 1);
    setArray(newArray);
    setTarget(Math.floor(Math.random() * 30) + 5);
    resetAnimation();
  };

  const loadDefaultArray = () => {
    setArray([2, 7, 11, 15, 3, 6, 8, 4]);
    setTarget(9);
    resetAnimation();
  };

  useEffect(() => {
    let interval;
    if (isPlaying && currentIndex < array.length && !found) {
      interval = setInterval(() => {
        setCurrentIndex(prev => {
          const complement = target - array[prev];
          
          setSearchHistory(sh => [...sh, {
            index: prev,
            value: array[prev],
            complement: complement,
            inMap: map.has(complement)
          }]);

          if (map.has(complement)) {
            setFound(true);
            setPair([map.get(complement), prev]);
            setIsPlaying(false);
            setIsComplete(true);
            return prev;
          }

          const newMap = new Map(map);
          newMap.set(array[prev], prev);
          setMap(newMap);

          const nextIndex = prev + 1;
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
  }, [isPlaying, currentIndex, array, target, map, found, speed]);

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
            <Target className="h-12 w-12 text-orange" />
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange400 to-orange400">
              Two Sum
            </h1>
          </div>
          <p className="text-theme-tertiary text-lg max-w-2xl mx-auto">
            Find two numbers that add up to the target value using hash map
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-theme-secondary/50 rounded-2xl p-6 border border-theme-primary">
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
                  className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-theme-elevated hover:bg-theme-tertiary rounded-xl font-medium transition-all"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>
              <button
                onClick={generateNewArray}
                className="px-4 py-2 bg-purple hover:bg-purplehover cursor-pointer rounded-xl font-medium transition-all"
              >
                New Array
              </button>
            </div>

            <div className="flex items-center gap-4">
              <label className="text-theme-tertiary text-sm">Speed:</label>
              <select 
                value={speed} 
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="bg-theme-tertiary border border-theme-primary rounded-lg px-3 py-2 text-theme-primary cursor-pointer"
              >
                <option value={1500}>Slow</option>
                <option value={1000}>Medium</option>
                <option value={500}>Fast</option>
                <option value={250}>Very Fast</option>
              </select>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-sm text-theme-secondary">Target: </span>
                <span className="text-lg font-bold text-orange">{target}</span>
              </div>
            </div>
          </div>

          <div className="bg-theme-secondary/50 rounded-2xl p-8 border border-theme-primary">
            <h3 className="text-xl font-bold text-theme-primary mb-6 text-center">Hash Map Visualization</h3>
            
            {/* Array Visualization */}
            <div className="flex justify-center items-end gap-4 mb-8 min-h-[200px]">
              {array.map((value, index) => (
                <div key={index} className="flex flex-col items-center gap-3">
                  <div className="text-theme-tertiary text-sm font-mono">[{index}]</div>
                  <div
                    className={`w-16 flex flex-col items-center justify-end rounded-lg border-2 transition-all duration-300 ${
                      index === currentIndex && !isComplete
                        ? "bg-warning-light border-warning scale-110 shadow-lg shadow-warning/25"
                        : found && pair.includes(index)
                        ? "bg-success-light border-success scale-105 shadow-lg shadow-success/25"
                        : index < currentIndex
                        ? "bg-accent-primary-light border-accent-primary"
                        : "bg-theme-elevated border-theme-primary"
                    }`}
                    style={{ height: `${value * 10 + 60}px` }}
                  >
                    <div className="flex-1 flex items-center justify-center">
                      <span className="text-theme-primary font-bold text-lg">{value}</span>
                    </div>
                    <div className={`w-full text-center py-1 text-xs font-bold ${
                      index === currentIndex ? "bg-warning text-theme-primary" :
                      found && pair.includes(index) ? "bg-success text-theme-primary" :
                      "bg-theme-elevated text-theme-secondary"
                    }`}>
                      {index === currentIndex ? "CURRENT" : 
                       found && pair.includes(index) ? "FOUND" : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Hash Map Display */}
            <div className="bg-theme-tertiary rounded-lg p-4 mb-6">
              <h4 className="text-lg font-bold text-theme-primary mb-3">Hash Map Contents</h4>
              <div className="grid grid-cols-4 gap-2">
                {Array.from(map.entries()).map(([key, value]) => (
                  <div key={key} className="bg-theme-elevated rounded p-2 text-center">
                    <div className="text-accent-primary font-mono">{key}</div>
                    <div className="text-theme-tertiary text-sm">→ [{value}]</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              {found ? (
                <div className="flex items-center justify-center gap-3 text-2xl font-bold text-success animate-pulse">
                  <Target className="h-8 w-8" />
                  Found: array[{pair[0]}] + array[{pair[1]}] = {array[pair[0]]} + {array[pair[1]]} = {target}
                </div>
              ) : isComplete && !found ? (
                <div className="text-2xl font-bold text-danger">
                  No two sum solution found
                </div>
              ) : isPlaying ? (
                <div className="flex items-center justify-center gap-3 text-lg text-warning">
                  <Search className="h-5 w-5" />
                  Checking complement {target - array[currentIndex]} for array[{currentIndex}] = {array[currentIndex]}
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
          <div className="bg-theme-secondary/50 rounded-2xl p-6 border border-theme-primary">
            <h3 className="text-xl font-bold text-theme-primary mb-4">Platform</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-orangelight border border-orange/30 rounded-lg">
                <Code className="h-5 w-5 text-orange" />
                <div>
                  <div className="font-bold text-theme-primary">LeetCode #1</div>
                  <div className="text-sm text-theme-tertiary">Two Sum</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-theme-secondary/50 rounded-2xl p-6 border border-theme-primary">
            <h3 className="text-xl font-bold text-theme-primary mb-4">C++ Solution</h3>
            <div className="bg-theme-primary rounded-lg p-4 font-mono text-sm">
              <div className="text-code-keyword">vector<span className="text-code-type">{'<'}</span>int<span className="text-code-type">{'>'}</span> twoSum(vector<span className="text-code-type">{'<'}</span>int<span className="text-code-type">{'>'}</span>& nums, int target) {'{'}</div>
              <div className="text-code-string ml-4">unordered_map<span className="text-code-type">{'<'}</span>int, int<span className="text-code-type">{'>'}</span> map;</div>
              <div className="text-code-string ml-4">for (int i = 0; i {'<'} nums.size(); i++) {'{'}</div>
              <div className={`text-code-variable ml-8 ${currentIndex > 0 ? "bg-warning-light px-2 rounded" : ""}`}>
                int complement = target - nums[i];
              </div>
              <div className={`text-code-variable ml-8 ${currentIndex > 0 ? "bg-warning-light px-2 rounded" : ""}`}>
                if (map.find(complement) != map.end()) {'{'}
              </div>
              <div className={`text-danger ml-12 ${found ? "bg-danger-light px-2 rounded" : ""}`}>
                return {'{'}map[complement], i{'}'};
              </div>
              <div className="text-code-variable ml-8">{'}'}</div>
              <div className={`text-code-string ml-8 ${currentIndex > 0 ? "bg-success-light px-2 rounded" : ""}`}>
                map[nums[i]] = i;
              </div>
              <div className="text-code-string ml-4">{'}'}</div>
              <div className="text-code-string ml-4">return {'{'}-1, -1{'}'};</div>
              <div className="text-code-keyword">{'}'}</div>
            </div>
          </div>

          <div className="bg-theme-secondary/50 rounded-2xl p-6 border border-theme-primary">
            <h3 className="text-xl font-bold text-theme-primary mb-4">Algorithm Details</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <div className="font-bold text-theme-primary">Time Complexity</div>
                  <div className="text-sm text-theme-tertiary">O(n) - Single pass through array</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Cpu className="h-5 w-5 text-accent-primary mt-0.5" />
                <div>
                  <div className="font-bold text-theme-primary">Space Complexity</div>
                  <div className="text-sm text-theme-tertiary">O(n) - Hash map storage</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-purple mt-0.5" />
                <div>
                  <div className="font-bold text-theme-primary">Approach</div>
                  <div className="text-sm text-theme-tertiary">Hash Map - Store visited numbers and check complements</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoSum;