import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  Cpu,
  FileText,
  Clock,
  Hash,
} from "lucide-react";

const LANG_TABS = ["C++", "Python", "Java"];

const CODE_SNIPPETS = {
  "C++": [
    { l: 1, t: "#include <bits/stdc++.h>" },
    { l: 2, t: "using namespace std;" },
    { l: 4, t: "string longestCommonPrefix(vector<string>& strs) {" },
    { l: 5, t: "    if (strs.empty()) return \"\";" },
    { l: 6, t: "    string prefix = strs[0];" },
    { l: 7, t: "    for (int i = 1; i < strs.size(); i++) {" },
    { l: 8, t: "        while (strs[i].find(prefix) != 0) {" },
    { l: 9, t: "            prefix = prefix.substr(0, prefix.length() - 1);" },
    { l: 10, t: "            if (prefix.empty()) return \"\";" },
    { l: 11, t: "        }" },
    { l: 12, t: "    }" },
    { l: 13, t: "    return prefix;" },
    { l: 14, t: "}" },
  ],
  Python: [
    { l: 1, t: "def longestCommonPrefix(strs):" },
    { l: 2, t: "    if not strs: return \"\"" },
    { l: 3, t: "    prefix = strs[0]" },
    { l: 4, t: "    for i in range(1, len(strs)):" },
    { l: 5, t: "        while not strs[i].startswith(prefix):" },
    { l: 6, t: "            prefix = prefix[:-1]" },
    { l: 7, t: "            if not prefix: return \"\"" },
    { l: 8, t: "    return prefix" },
  ],
  Java: [
    { l: 1, t: "public static String longestCommonPrefix(String[] strs) {" },
    { l: 2, t: "    if (strs.length == 0) return \"\";" },
    { l: 3, t: "    String prefix = strs[0];" },
    { l: 4, t: "    for (int i = 1; i < strs.length; i++) {" },
    { l: 5, t: "        while (strs[i].indexOf(prefix) != 0) {" },
    { l: 6, t: "            prefix = prefix.substring(0, prefix.length() - 1);" },
    { l: 7, t: "            if (prefix.isEmpty()) return \"\";" },
    { l: 8, t: "        }" },
    { l: 9, t: "    }" },
    { l: 10, t: "    return prefix;" },
    { l: 11, t: "}" },
  ],
};

const LongestCommonPrefixVisualizer = () => {
  const [stringsInput, setStringsInput] = useState("flower,flow,flight");
  const [strings, setStrings] = useState([]);
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);
  const playRef = useRef(null);
  const [activeLang, setActiveLang] = useState("C++");
  const state = history[currentStep] || {};

  const generateHistory = useCallback((strs) => {
    const newHistory = [];
    const addState = (props) =>
      newHistory.push({
        prefix: "",
        currentStringIndex: null,
        currentString: null,
        line: null,
        explanation: "",
        finalResult: null,
        ...props,
      });

    if (strs.length === 0) {
      addState({
        line: 5,
        explanation: "Array is empty. Return empty string.",
        finalResult: "",
      });
      setHistory(newHistory);
      setCurrentStep(0);
      return;
    }

    let prefix = strs[0];
    addState({
      line: 6,
      prefix,
      explanation: `Initialize prefix with first string: "${prefix}".`,
    });

    for (let i = 1; i < strs.length; i++) {
      const currentStr = strs[i];
      
      addState({
        line: 7,
        prefix,
        currentStringIndex: i,
        currentString: currentStr,
        explanation: `Compare prefix with string[${i}]: "${currentStr}".`,
      });

      while (!currentStr.startsWith(prefix)) {
        addState({
          line: 8,
          prefix,
          currentStringIndex: i,
          currentString: currentStr,
          explanation: `"${currentStr}" doesn't start with "${prefix}". Need to shorten prefix.`,
        });

        prefix = prefix.slice(0, -1);
        
        addState({
          line: 9,
          prefix,
          currentStringIndex: i,
          currentString: currentStr,
          explanation: `Shortened prefix to: "${prefix}".`,
        });

        if (prefix === "") {
          addState({
            line: 10,
            prefix,
            currentStringIndex: i,
            currentString: currentStr,
            explanation: "Prefix is now empty. No common prefix exists.",
            finalResult: "",
          });
          setHistory(newHistory);
          setCurrentStep(0);
          return;
        }
      }

      addState({
        line: 8,
        prefix,
        currentStringIndex: i,
        currentString: currentStr,
        explanation: `"${currentStr}" starts with "${prefix}". Continue to next string.`,
      });
    }

    addState({
      line: 13,
      prefix,
      explanation: `All strings checked. Longest common prefix is: "${prefix}".`,
      finalResult: prefix,
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const load = () => {
    const strs = stringsInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    if (strs.length === 0) return alert("Enter at least one string.");
    setStrings(strs);
    setIsLoaded(true);
    generateHistory(strs);
  };

  const resetAll = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
    setPlaying(false);
    clearInterval(playRef.current);
  };

  const stepForward = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, history.length - 1));
  }, [history.length]);

  const stepBackward = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (!isLoaded) return;
      if (e.key === "ArrowRight") stepForward();
      if (e.key === "ArrowLeft") stepBackward();
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isLoaded, stepForward, stepBackward]);

  useEffect(() => {
    if (playing) {
      if (currentStep >= history.length - 1) {
        setPlaying(false);
        return;
      }
      playRef.current = setInterval(() => {
        setCurrentStep((s) => {
          if (s >= history.length - 1) {
            clearInterval(playRef.current);
            setPlaying(false);
            return s;
          }
          return s + 1;
        });
      }, speed);
    } else {
      clearInterval(playRef.current);
    }
    return () => clearInterval(playRef.current);
  }, [playing, speed, history.length, currentStep]);

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto relative bg-theme-primary min-h-screen text-theme-primary">
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] bg-accent-primary/8 rounded-full blur-3xl pointer-events-none" />

      <header className="relative z-10 mb-12 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary400 via-cyan-400 to-teal400">
          Longest Common Prefix
        </h1>
        <p className="text-theme-secondary mt-2 text-lg">
          Find the longest common prefix string among an array of strings
        </p>
      </header>

      <section className="mb-6 z-10 relative">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <input
            type="text"
            value={stringsInput}
            onChange={(e) => setStringsInput(e.target.value)}
            disabled={isLoaded}
            className="flex-1 p-3 rounded-xl bg-theme-secondary border border-theme-primary text-theme-primary font-mono focus:ring-2 focus:ring-blue-400"
            placeholder="Enter strings separated by commas (e.g., flower,flow,flight)"
          />

          {!isLoaded ? (
            <button
              onClick={load}
              className="px-5 py-3 rounded-xl bg-accent-primary-light hover:bg-accent-primary/40 transition text-theme-primary font-bold shadow-lg"
            >
              Load & Visualize
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={stepBackward}
                  disabled={currentStep <= 0}
                  className="px-3 py-2 rounded-full bg-theme-tertiary hover:bg-accent-primary-hover disabled:opacity-40 transition"
                >
                  <ArrowLeft />
                </button>
                <button
                  onClick={() => setPlaying((p) => !p)}
                  className="px-3 py-2 rounded-full bg-theme-tertiary hover:bg-accent-primary-hover transition"
                >
                  {playing ? <Pause /> : <Play />}
                </button>
                <button
                  onClick={stepForward}
                  disabled={currentStep >= history.length - 1}
                  className="px-3 py-2 rounded-full bg-theme-tertiary hover:bg-accent-primary-hover disabled:opacity-40 transition"
                >
                  <ArrowRight />
                </button>
              </div>

              <div className="px-4 py-2 font-mono text-sm bg-theme-secondary border border-theme-primary rounded-xl text-theme-secondary">
                {Math.max(0, currentStep + 1)}/{history.length}
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-theme-secondary">Speed</label>
                <input
                  type="range"
                  min={100}
                  max={1500}
                  step={50}
                  value={speed}
                  onChange={(e) => setSpeed(parseInt(e.target.value, 10))}
                  className="w-36"
                />
              </div>

              <button
                onClick={resetAll}
                className="px-4 py-2 rounded-xl bg-danger-hover hover:bg-danger-hover text-theme-primary font-bold"
              >
                Reset
              </button>
            </>
          )}
        </div>
      </section>

      <section className="mb-4 z-10">
        <div className="flex items-center gap-2">
          {LANG_TABS.map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${
                activeLang === lang
                  ? "bg-accent-primary-light text-accent-primary ring-1 ring-blue-400"
                  : "bg-theme-tertiary/40 text-theme-secondary hover:bg-theme-tertiary/60"
              }`}
            >
              {lang}
            </button>
          ))}
          <div className="ml-auto text-sm text-theme-tertiary flex items-center gap-2">
            <Cpu size={16} /> <span>Approach: Horizontal Scanning</span>
          </div>
        </div>
      </section>

      {!isLoaded ? (
        <div className="mt-10 text-center text-theme-tertiary italic">
          Enter strings and click{" "}
          <span className="text-accent-primary font-semibold">Load & Visualize</span>
        </div>
      ) : (
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          <aside className="lg:col-span-1 p-6 bg-theme-tertiary/50 backdrop-blur-xl rounded-2xl border border-theme-primary/60 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-success flex items-center gap-2 font-semibold">
                <FileText size={18} /> Code
              </h3>
              <div className="text-sm text-theme-tertiary">{activeLang}</div>
            </div>
            <div className="bg-theme-primary rounded-lg border border-theme-primary/80 max-h-[640px] overflow-auto p-3">
              {CODE_SNIPPETS[activeLang].map((line) => (
                <div
                  key={line.l}
                  className={`flex font-mono text-sm ${
                    state.line === line.l ? "bg-success-light" : ""
                  }`}
                >
                  <div className="w-10 text-right text-theme-muted pr-3">{line.l}</div>
                  <pre className="flex-1 text-theme-secondary">{line.t}</pre>
                </div>
              ))}
            </div>
          </aside>

          <section className="lg:col-span-2 flex flex-col gap-6">
            <div className="p-4 bg-theme-tertiary/50 rounded-xl border border-theme-primary/60">
              <h4 className="text-theme-secondary text-sm mb-3">Input Strings</h4>
              <div className="space-y-2">
                {strings.map((str, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg font-mono text-lg border ${
                      state.currentStringIndex === idx
                        ? "bg-accent-primary-light border-accent-primary text-theme-primary"
                        : "bg-theme-elevated/50 border-theme-primary text-theme-secondary"
                    }`}
                  >
                    <span className="text-xs text-theme-tertiary mr-2">[{idx}]</span>
                    {str}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-theme-tertiary/50 rounded-xl border border-theme-primary/60">
              <h4 className="text-theme-secondary text-sm mb-2 flex items-center gap-2">
                <Hash size={14} /> Current Prefix
              </h4>
              <div className="p-4 bg-theme-secondary rounded-lg border border-theme-primary font-mono text-3xl text-teal300 min-h-[4rem] flex items-center justify-center">
                {state.prefix || '""'}
              </div>
              {state.currentString && (
                <div className="mt-3 text-sm text-theme-tertiary">
                  <strong>Comparing with:</strong>{" "}
                  <span className="text-accent-primary font-mono">{state.currentString}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2 p-4 bg-theme-tertiary/50 rounded-xl border border-theme-primary/60">
                <h4 className="text-theme-secondary text-sm mb-2 flex items-center gap-2">
                  <FileText size={14} /> Explanation
                </h4>
                <p className="text-theme-secondary">{state.explanation}</p>
              </div>

              <div className="p-4 bg-theme-tertiary/50 rounded-xl border border-theme-primary/60">
                <h4 className="text-success font-semibold flex items-center gap-2">
                  <Clock size={16} /> Complexity
                </h4>
                <div className="mt-3 text-sm text-theme-secondary space-y-2">
                  <div>
                    <strong>Time:</strong>{" "}
                    <span className="font-mono text-teal300">O(S)</span>
                  </div>
                  <div>
                    <strong>Space:</strong>{" "}
                    <span className="font-mono text-teal300">O(1)</span>
                  </div>
                  <div className="text-xs text-theme-tertiary mt-2">
                    S = sum of all characters in all strings.
                  </div>
                </div>
              </div>
            </div>

            {state.finalResult !== null && (
              <div className="p-6 bg-gradient-to-r from-accent-primary900/30 to-teal900/30 rounded-xl border border-accent-primary/50">
                <h4 className="text-teal300 font-semibold mb-3">Final Result</h4>
                <div className="font-mono text-4xl text-theme-primary">
                  {state.finalResult === "" ? '""' : state.finalResult}
                </div>
              </div>
            )}
          </section>
        </main>
      )}
    </div>
  );
};

export default LongestCommonPrefixVisualizer;