import React, { useState, useEffect, useCallback } from "react";
import { useModeHistorySwitch } from "../../../hooks/useModeHistorySwitch";
import {
  Clock,
  Hash,
  Link2,
  ArrowRight,
  CheckCircle,
  Code,
} from "lucide-react";

// Main Visualizer Component
const LRUCacheVisualizer = () => {
  const [mode, setMode] = useState("optimal");
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [operationsInput, setOperationsInput] = useState(
    `LRUCache(2)\nput(1, 1)\nput(2, 2)\nget(1)\nput(3, 3)\nget(2)\nput(4, 4)\nget(1)\nget(3)\nget(4)`
  );
  const [isLoaded, setIsLoaded] = useState(false);

  const parseOperations = (input) => {
    const lines = input.split("\n").map((line) => line.trim()).filter(Boolean);
    let capacity = 0;
    const commands = [];
    const capMatch = lines[0].match(/LRUCache\((\d+)\)/);
    if (capMatch) capacity = parseInt(capMatch[1], 10);

    for (let i = 1; i < lines.length; i++) {
      const putMatch = lines[i].match(/put\((\d+),\s*(\d+)\)/);
      if (putMatch) {
        commands.push({ op: "put", key: parseInt(putMatch[1], 10), value: parseInt(putMatch[2], 10) });
        continue;
      }
      const getMatch = lines[i].match(/get\((\d+)\)/);
      if (getMatch) commands.push({ op: "get", key: parseInt(getMatch[1], 10) });
    }
    return { capacity, commands };
  };

  const generateOptimalHistory = useCallback((capacity, commands) => {
    if (capacity <= 0) return;
    const newHistory = [];
    let cache = new Map();
    let head = { key: -1, val: -1, next: null, prev: null };
    let tail = { key: -1, val: -1, next: null, prev: null };
    head.next = tail;
    tail.prev = head;
    let outputLog = [];

    const getList = () => {
      const list = [];
      let curr = head.next;
      while (curr !== tail) {
        list.push({ key: curr.key, val: curr.val });
        curr = curr.next;
      }
      return list;
    };
    const getMap = () => {
      const mapObject = {};
      for (let [key, node] of cache.entries()) mapObject[key] = node.val;
      return mapObject;
    };
    const addState = (props) => newHistory.push({ cache: getMap(), list: getList(), outputLog: [...outputLog], explanation: "", ...props });

    addState({ commandIndex: -1, explanation: `LRU Cache initialized with capacity ${capacity}.` });

    commands.forEach((command, commandIndex) => {
      if (command.op === "put") {
        const { key, value } = command;
        addState({ commandIndex, explanation: `Executing put(${key}, ${value}). Checking if key exists in hash map.` });

        if (cache.has(key)) {
          const node = cache.get(key);
          const oldVal = node.val;
          addState({ commandIndex, explanation: `Key ${key} found in hash map. Updating its value.` });
          node.val = value;
          addState({ commandIndex, explanation: `Value for key ${key} updated from ${oldVal} to ${value}. Now moving node to front.` });
          
          // Unlink
          node.prev.next = node.next;
          node.next.prev = node.prev;
          addState({ commandIndex, movedKey: key, explanation: `Unlinked node from its current position in the list.` });

          // Move to front
          node.next = head.next;
          node.prev = head;
          head.next.prev = node;
          head.next = node;
          addState({ commandIndex, movedKey: key, explanation: `Moved node to the front of the list to mark it as most recently used.` });

        } else {
          addState({ commandIndex, explanation: `Key ${key} not in hash map. Checking if cache is full.` });
          if (cache.size === capacity) {
            addState({ commandIndex, explanation: `Cache is full (size=${capacity}). Eviction is necessary.` });
            const lru = tail.prev;
            addState({ commandIndex, explanation: `Identified least recently used item: key ${lru.key}.` });
            
            // Evict from map
            cache.delete(lru.key);
            addState({ commandIndex, evictedKey: lru.key, explanation: `Removed key ${lru.key} from the hash map.` });
            
            // Evict from list
            lru.prev.next = tail;
            tail.prev = lru.prev;
            addState({ commandIndex, evictedKey: lru.key, explanation: `Removed the LRU node from the end of the linked list.` });
          }
          const newNode = { key, val: value, prev: head, next: head.next };
          addState({ commandIndex, explanation: `Creating new node for key ${key} with value ${value}.` });

          // Add to list
          head.next.prev = newNode;
          head.next = newNode;
          addState({ commandIndex, newKey: key, explanation: `Inserted new node at the front of the linked list.` });
          
          // Add to map
          cache.set(key, newNode);
          addState({ commandIndex, newKey: key, explanation: `Added key ${key} with its node reference to the hash map.` });
        }
      } else if (command.op === "get") {
        const { key } = command;
        addState({ commandIndex, explanation: `Executing get(${key}). Checking for key in hash map.` });
        if (cache.has(key)) {
          const node = cache.get(key);
          outputLog.push(node.val);
          addState({ commandIndex, getResult: node.val, explanation: `Key ${key} found. Returning value ${node.val}. Now moving node to front.` });

          // Unlink
          node.prev.next = node.next;
          node.next.prev = node.prev;
          addState({ commandIndex, movedKey: key, getResult: node.val, explanation: `Unlinked node from its current position in the list.` });
          
          // Move to front
          node.next = head.next;
          node.prev = head;
          head.next.prev = node;
          head.next = node;
          addState({ commandIndex, movedKey: key, getResult: node.val, explanation: `Moved node to the front of the list to mark it as most recently used.` });
        } else {
          outputLog.push(-1);
          addState({ commandIndex, getResult: -1, explanation: `Key ${key} not found in hash map. Returning -1.` });
        }
      }
    });

    addState({ finished: true, explanation: "All operations completed." });
    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const generateBruteForceHistory = useCallback((capacity, commands) => {
    const newHistory = [];
    let cache = new Map();
    let usage = [];
    let outputLog = [];

    const getList = () => usage.map((key) => ({ key, val: cache.get(key) }));
    const getMap = () => Object.fromEntries(cache.entries());
    const addState = (props) => newHistory.push({ cache: getMap(), list: getList(), outputLog: [...outputLog], explanation: "", ...props });

    addState({ commandIndex: -1, explanation: `Cache initialized with capacity ${capacity} using a vector.` });

    commands.forEach((command, commandIndex) => {
      if (command.op === "put") {
        const { key, value } = command;
        addState({ commandIndex, explanation: `Executing put(${key}, ${value}). Checking if key exists.` });
        if (cache.has(key)) {
          addState({ commandIndex, explanation: `Key ${key} exists. Updating its value in the hash map.` });
          cache.set(key, value);
          addState({ commandIndex, explanation: `Value updated. Now updating recency in the usage vector.` });
          usage = usage.filter((k) => k !== key);
          addState({ commandIndex, movedKey: key, explanation: `Removed key ${key} from its current position in the vector (O(N) search).` });
          usage.unshift(key);
          addState({ commandIndex, movedKey: key, explanation: `Added key ${key} to the front of the vector to mark it as most recent.` });
        } else {
          addState({ commandIndex, explanation: `Key ${key} is new. Checking if cache is full.` });
          if (cache.size === capacity) {
            addState({ commandIndex, explanation: `Cache is full. Evicting the LRU item.` });
            const lruKey = usage.pop();
            addState({ commandIndex, evictedKey: lruKey, explanation: `Removed LRU key ${lruKey} from the back of the usage vector.` });
            cache.delete(lruKey);
            addState({ commandIndex, evictedKey: lruKey, explanation: `Removed evicted key ${lruKey} from the hash map.` });
          }
          cache.set(key, value);
          addState({ commandIndex, newKey: key, explanation: `Added new key ${key} with value ${value} to the hash map.` });
          usage.unshift(key);
          addState({ commandIndex, newKey: key, explanation: `Added new key ${key} to the front of the usage vector.` });
        }
      } else if (command.op === "get") {
        const { key } = command;
        addState({ commandIndex, explanation: `Executing get(${key}). Checking for key.` });
        if (cache.has(key)) {
          const val = cache.get(key);
          outputLog.push(val);
          addState({ commandIndex, getResult: val, explanation: `Key ${key} found, returning ${val}. Now updating recency.` });
          usage = usage.filter((k) => k !== key);
          addState({ commandIndex, getResult: val, movedKey: key, explanation: `Removed key ${key} from the usage vector (O(N) search).` });
          usage.unshift(key);
          addState({ commandIndex, getResult: val, movedKey: key, explanation: `Added key ${key} to the front of the vector.` });
        } else {
          outputLog.push(-1);
          addState({ commandIndex, getResult: -1, explanation: `Key ${key} not found. Returning -1.` });
        }
      }
    });
    addState({ finished: true, explanation: "All operations completed." });
    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const loadOps = () => {
    const { capacity, commands } = parseOperations(operationsInput);
    if (capacity <= 0 || commands.length === 0) {
      alert("Please provide a valid capacity and at least one operation.");
      return;
    }
    setIsLoaded(true);
    if (mode === "optimal") generateOptimalHistory(capacity, commands);
    else generateBruteForceHistory(capacity, commands);
  };

  const reset = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
  };

  const parseInput = useCallback(() => {
    const { capacity, commands } = parseOperations(operationsInput);
    if (capacity <= 0 || commands.length === 0) throw new Error("Invalid operations");
    return { capacity, commands };
  }, [operationsInput]);

  const handleModeChange = useModeHistorySwitch({
    mode, setMode, isLoaded, parseInput,
    generators: {
      "brute-force": ({ capacity, commands }) => generateBruteForceHistory(capacity, commands),
      optimal: ({ capacity, commands }) => generateOptimalHistory(capacity, commands),
    },
    setCurrentStep, onError: () => {},
  });

  const stepForward = useCallback(() => setCurrentStep((prev) => Math.min(prev + 1, history.length - 1)), [history.length]);
  const stepBackward = useCallback(() => setCurrentStep((prev) => Math.max(prev - 1, 0)), []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isLoaded) {
        if (e.key === "ArrowLeft") stepBackward();
        if (e.key === "ArrowRight") stepForward();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoaded, stepForward, stepBackward]);

  const state = history[currentStep] || {};
  const { cache = {}, list = [], outputLog = [] } = state;

  return (
    <div className="min-h-screen bg-theme-secondary text-theme-secondary p-4">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <header className="text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange400 to-danger500 bg-clip-text text-transparent mb-1">
            LRU Cache Visualizer
          </h1>
          <p className="text-sm text-theme-tertiary">
            Visualizing LeetCode 146: Comparing O(1) and O(N) solutions
          </p>
        </header>

        {/* Top Control Bar */}
        <div className="bg-theme-tertiary p-4 rounded-lg border border-theme-primary w-full">
          <div className="flex flex-col gap-3">
            {/* Input Section */}
            <div className="w-full">
              <label className="block text-xs font-semibold text-theme-secondary mb-2">Enter Operations (one per line or comma-separated):</label>
              <div className="bg-theme-secondary rounded-lg border border-theme-primary focus-within:border-orange transition-colors p-3 max-h-32 overflow-y-auto">
                <input
                  type="text"
                  placeholder="LRUCache(2), put(1,1), put(2,2), get(1), put(3,3), get(2), put(4,4), get(1), get(3), get(4)"
                  value={operationsInput.replace(/\n/g, ', ')}
                  onChange={(e) => setOperationsInput(e.target.value.replace(/, /g, '\n').replace(/,/g, '\n'))}
                  disabled={isLoaded}
                  className="w-full bg-transparent font-mono text-xs text-theme-secondary focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>

            {/* Controls Section */}
            <div className="flex flex-wrap items-center gap-3 justify-between">
              {/* Mode Selection */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-theme-tertiary font-semibold">Mode:</span>
                <div className="flex gap-1 bg-theme-secondary/50 p-1 rounded-lg border border-theme-primary">
                  <button onClick={() => handleModeChange("brute-force")} className={`px-4 py-1.5 rounded-md font-semibold cursor-pointer transition-all text-xs ${mode === "brute-force" ? "bg-gradient-to-r from-orange500 to-danger500 text-theme-primary shadow-md" : "text-theme-tertiary hover:bg-theme-elevated"}`}>
                    Brute Force O(N)
                  </button>
                  <button onClick={() => handleModeChange("optimal")} className={`px-4 py-1.5 rounded-md font-semibold cursor-pointer transition-all text-xs ${mode === "optimal" ? "bg-gradient-to-r from-orange500 to-danger500 text-theme-primary shadow-md" : "text-theme-tertiary hover:bg-theme-elevated"}`}>
                    Optimal O(1)
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {!isLoaded ? (
                  <button onClick={loadOps} className="bg-gradient-to-r from-orange500 to-danger500 cursor-pointer hover:from-orange600 hover:to-danger600 text-theme-primary font-bold py-2 px-6 rounded-md shadow-md transform hover:scale-105 transition-all flex items-center gap-2">
                    <CheckCircle size={16} /> Visualize
                  </button>
                ) : (
                  <>
                    <div className="flex items-center gap-2 bg-theme-secondary/50 p-1.5 rounded-md border border-theme-primary">
                      <button onClick={stepBackward} disabled={currentStep <= 0} className="bg-theme-elevated hover:bg-theme-elevated p-2 rounded disabled:opacity-30 transition-all" title="Previous Step (←)">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      </button>
                      <div className="bg-theme-tertiary px-3 py-1 rounded border border-theme-primary">
                        <span className="font-mono text-sm font-bold text-orange">{currentStep >= 0 ? currentStep + 1 : 0}</span>
                        <span className="text-theme-muted mx-1">/</span>
                        <span className="font-mono text-xs text-theme-tertiary">{history.length}</span>
                      </div>
                      <button onClick={stepForward} disabled={currentStep >= history.length - 1} className="bg-theme-elevated hover:bg-theme-elevated p-2 rounded disabled:opacity-30 transition-all" title="Next Step (→)">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                    <button onClick={reset} className="bg-danger-hover/80 cursor-pointer hover:bg-danger-hover font-bold py-2 px-4 rounded-md shadow-md transition-all text-sm">
                      Reset
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Visualization Area */}
        {isLoaded ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="lg:col-span-2 bg-theme-tertiary p-4 rounded-lg border border-theme-primary">
              <div className="flex items-center gap-3 mb-2">
                <Clock size={18} className="text-accent-primary" />
                <h3 className="font-bold text-md text-accent-primary">Current Step Explanation</h3>
              </div>
              <div className="bg-theme-secondary/70 p-3 rounded-md border border-theme-primary min-h-[50px]">
                <p className="text-sm text-theme-secondary">{state.explanation}</p>
              </div>
            </div>

            <div className="lg:col-span-2 bg-theme-tertiary p-4 rounded-lg border border-theme-primary">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle size={18} className="text-teal" />
                <div>
                  <h3 className="font-bold text-md text-teal300">Output Log</h3>
                  <p className="text-xs text-theme-muted">Results from get() operations</p>
                </div>
              </div>
              <div className="bg-theme-secondary/70 p-3 rounded-md border border-theme-primary min-h-[50px]">
                <div className="flex flex-wrap gap-2">
                  {outputLog.length === 0 ? <p className="text-theme-muted text-xs italic">No output yet</p>
                    : outputLog.map((out, i) => (
                      <div key={i} className={`font-mono px-3 py-1 rounded-md font-bold text-md border transition-all ${state.commandIndex === i && state.getResult !== undefined ? "bg-orange/30 border-orange scale-110" : out === -1 ? "bg-danger900/30 border-danger600 text-danger" : "bg-success900/30 border-success600 text-success"}`}>{out}</div>
                    ))}
                </div>
              </div>
            </div>

            <div className="bg-theme-tertiary p-4 rounded-lg border border-theme-primary">
              <div className="flex items-center gap-3 mb-2">
                <Hash size={18} className="text-purple" />
                <div>
                  <h3 className="font-bold text-md text-purple">Hash Map</h3>
                  <p className="text-xs text-theme-muted font-mono">{mode === 'optimal' ? 'Map<Int, Node*>' : 'Map<Int, Int>'}</p>
                </div>
              </div>
              <div className="bg-theme-secondary/70 p-3 rounded-md border border-theme-primary min-h-[150px]">
                <div className="flex flex-wrap gap-3">
                  {Object.entries(cache).length === 0 ? <p className="text-theme-muted text-xs italic">Cache is empty</p>
                    : Object.entries(cache).map(([key, value]) => (
                      <div key={key} className={`p-2 rounded-lg bg-theme-elevated/50 border shadow-md transform transition-all flex items-center gap-2 ${state.newKey == key || state.movedKey == key ? "border-orange scale-110" : "border-theme-primary"}`}>
                        <div className="w-8 h-8 flex items-center justify-center bg-orange rounded font-mono text-sm font-bold">{key}</div>
                        <ArrowRight size={14} className="text-theme-muted" />
                        <div className="w-8 h-8 flex items-center justify-center bg-accent-primary rounded font-mono text-sm font-bold">{value}</div>
                      </div>
                    ))}
                  {state.evictedKey && (<div className="p-2 rounded-lg bg-danger900/30 border border-danger shadow-md"><div className="w-8 h-8 flex items-center justify-center bg-danger800 rounded font-mono text-sm font-bold">{state.evictedKey}</div></div>)}
                </div>
              </div>
            </div>

            <div className="bg-theme-tertiary p-4 rounded-lg border border-theme-primary">
              <div className="flex items-center gap-3 mb-2">
                <Link2 size={18} className="text-success" />
                <div>
                  <h3 className="font-bold text-md text-success">Usage Order</h3>
                  <p className="text-xs text-theme-muted">{mode === "optimal" ? "Doubly Linked List: Node {key, val, ...}" : "Vector<Integer>"}</p>
                </div>
              </div>
              <div className="bg-theme-secondary/70 p-3 rounded-md border border-theme-primary min-h-[150px]">
                <div className="flex items-center gap-2 mb-3 text-xs font-bold text-success">
                  {mode === "optimal" && <span className="bg-success900/30 px-2 py-1 rounded border border-success600">HEAD</span>}
                  MOST RECENT →
                </div>
                <div className="flex gap-2 items-center overflow-x-auto pb-2">
                  {list.length === 0 ? <p className="text-theme-muted text-xs italic">No items yet</p>
                    : list.map((node, idx) => (
                      <div key={`${node.key}-${idx}`} className="flex items-center gap-2">
                        <div className={`flex-shrink-0 w-20 p-2 rounded-lg flex flex-col justify-center items-center font-mono border transition-all shadow-md ${state.movedKey == node.key || state.newKey == node.key ? "bg-orangelight border-orange scale-110" : "bg-theme-elevated/50 border-theme-primary"}`}>
                          <span className="text-xs text-theme-tertiary">Key: <span className="font-bold text-lg text-orange">{node.key}</span></span>
                          <div className="w-full h-px bg-theme-elevated my-1"></div>
                          <span className="text-xs text-theme-tertiary">Val: <span className="font-bold text-md text-accent-primary">{node.val}</span></span>
                        </div>
                        {idx < list.length - 1 && <ArrowRight size={14} className="text-theme-muted flex-shrink-0" />}
                      </div>
                   ))}
                </div>
                <div className="flex items-center gap-2 mt-3 text-xs font-bold text-danger">
                  ← LEAST RECENT
                  {mode === "optimal" && <span className="bg-danger900/30 px-2 py-1 rounded border border-danger600">TAIL</span>}
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2 bg-theme-tertiary p-4 rounded-lg border border-theme-primary">
              <h3 className="font-bold text-md text-purple mb-3 pb-2 border-b border-theme-primary flex items-center gap-3"><Clock size={18} /> Complexity Analysis</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                {mode === "optimal" ? (<>
                  <div className="bg-theme-secondary/50 p-3 rounded-md border border-theme-primary">
                    <h4 className="font-bold text-success mb-1">Time: <span className="font-mono text-teal300">O(1)</span></h4>
                    <p className="text-theme-tertiary text-xs">Both <code className="text-orange">get()</code> and <code className="text-orange">put()</code> run in constant time due to hash map lookups and linked list pointer updates.</p>
                  </div>
                  <div className="bg-theme-secondary/50 p-3 rounded-md border border-theme-primary">
                    <h4 className="font-bold text-accent-primary mb-1">Space: <span className="font-mono text-teal300">O(capacity)</span></h4>
                    <p className="text-theme-tertiary text-xs">Space is proportional to the cache capacity for storing items in the hash map and linked list.</p>
                  </div>
                </> ) : ( <>
                  <div className="bg-theme-secondary/50 p-3 rounded-md border border-theme-primary">
                    <h4 className="font-bold text-orange mb-1">Time: <span className="font-mono text-danger">O(N)</span></h4>
                    <p className="text-theme-tertiary text-xs">Operations take linear time due to searching and moving elements within the usage vector (where N is current cache size).</p>
                  </div>
                  <div className="bg-theme-secondary/50 p-3 rounded-md border border-theme-primary">
                    <h4 className="font-bold text-accent-primary mb-1">Space: <span className="font-mono text-teal300">O(capacity)</span></h4>
                    <p className="text-theme-tertiary text-xs">Space is proportional to capacity for storing items in the hash map and the usage vector.</p>
                  </div>
                </>)}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="bg-theme-tertiary p-8 rounded-lg border border-dashed border-theme-primary max-w-md mx-auto">
              <div className="bg-orangelight w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Code size={32} className="text-orange" /></div>
              <h2 className="text-xl font-bold text-theme-secondary mb-2">Ready to Visualize</h2>
              <p className="text-theme-tertiary text-sm">Enter operations above and click "Visualize" to see how the LRU Cache works.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LRUCacheVisualizer;