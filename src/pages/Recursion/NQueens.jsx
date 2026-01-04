import React, { useState, useEffect, useCallback } from "react";
import { Code, CheckCircle, Clock, Grid3x3, Crown, AlertCircle } from "lucide-react";

const NQueensVisualizer = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [nInput, setNInput] = useState("4");
  const [isLoaded, setIsLoaded] = useState(false);

  const generateNQueensHistory = useCallback((n) => {
    const newHistory = [];
    let callCount = 0;
    let solutionCount = 0;
    const solutions = [];

    const addState = (props) =>
      newHistory.push({
        callCount,
        solutionCount,
        explanation: "",
        ...props,
      });

    addState({ line: 1, explanation: `Solve ${n}-Queens problem using backtracking.` });

    const isSafe = (board, row, col) => {
      for (let i = 0; i < row; i++) {
        if (board[i] === col) return false;
      }
      for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
        if (board[i] === j) return false;
      }
      for (let i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) {
        if (board[i] === j) return false;
      }
      return true;
    };

    const solveNQueens = (board, row) => {
      callCount++;

      addState({
        line: 2,
        board: [...board],
        currentRow: row,
        explanation: `Try placing queen in row ${row}. Call count: ${callCount}.`,
      });

      if (row === n) {
        solutionCount++;
        solutions.push([...board]);
        addState({
          line: 3,
          board: [...board],
          currentRow: row,
          isSolution: true,
          explanation: `Found solution #${solutionCount}! All ${n} queens placed.`,
        });
        return;
      }

      for (let col = 0; col < n; col++) {
        addState({
          line: 4,
          board: [...board],
          currentRow: row,
          tryingCol: col,
          explanation: `Try placing queen at row ${row}, col ${col}.`,
        });

        if (isSafe(board, row, col)) {
          board[row] = col;
          
          addState({
            line: 5,
            board: [...board],
            currentRow: row,
            placedCol: col,
            explanation: `Position (${row}, ${col}) is safe. Place queen and recurse.`,
          });

          solveNQueens(board, row + 1);

          board[row] = -1;
          
          addState({
            line: 6,
            board: [...board],
            currentRow: row,
            backtrackCol: col,
            explanation: `Backtrack: Remove queen from (${row}, ${col}).`,
          });
        } else {
          addState({
            line: 7,
            board: [...board],
            currentRow: row,
            attackedCol: col,
            explanation: `Position (${row}, ${col}) is under attack. Skip.`,
          });
        }
      }
    };

    const board = Array(n).fill(-1);
    solveNQueens(board, 0);

    addState({
      line: 8,
      board: Array(n).fill(-1),
      finished: true,
      explanation: `Backtracking complete. Found ${solutionCount} solution(s) for ${n}-Queens. Total calls: ${callCount}.`,
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const loadProblem = () => {
    const n = parseInt(nInput);
    if (isNaN(n) || n < 1 || n > 8) {
      alert("Please enter a number between 1 and 8.");
      return;
    }
    setIsLoaded(true);
    generateNQueensHistory(n);
  };

  const reset = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
  };

  const stepForward = useCallback(() => setCurrentStep((prev) => Math.min(prev + 1, history.length - 1)), [history.length]);
  const stepBackward = useCallback(() => setCurrentStep((prev) => Math.max(prev - 1, 0)), []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isLoaded) return;
      if (e.key === "ArrowRight") stepForward();
      else if (e.key === "ArrowLeft") stepBackward();
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isLoaded, stepForward, stepBackward]);

  const state = history[currentStep] || {};
  const { board = [], currentRow = -1, tryingCol = -1, placedCol = -1, attackedCol = -1, backtrackCol = -1, callCount = 0, solutionCount = 0, explanation = "", isSolution = false, finished = false } = state;

  const n = board.length;

  const colorMapping = {
    purple: "text-purple",
    cyan: "text-teal",
    yellow: "text-warning",
    orange: "text-orange",
    "light-gray": "text-theme-tertiary",
    "": "text-theme-secondary",
  };

  const CodeLine = ({ line, content }) => (
    <div className={`block rounded-md transition-colors ${state.line === line ? "bg-accent-primary-light" : ""}`}>
      <span className="text-theme-muted w-8 inline-block text-right pr-4 select-none">{line}</span>
      {content.map((token, index) => (
        <span key={index} className={colorMapping[token.c]}>{token.t}</span>
      ))}
    </div>
  );

  const nQueensCode = [
    { l: 1, c: [{ t: "function solveNQueens(board, row) {", c: "" }] },
    { l: 2, c: [{ t: "  if", c: "purple" }, { t: " (row == n) {", c: "" }] },
    { l: 3, c: [{ t: "    solutions.push(board);", c: "" }] },
    { l: 4, c: [{ t: "    return", c: "purple" }, { t: ";", c: "" }] },
    { l: 5, c: [{ t: "  }", c: "light-gray" }] },
    { l: 6, c: [{ t: "  for", c: "purple" }, { t: " (col = 0; col < n; col++) {", c: "" }] },
    { l: 7, c: [{ t: "    if", c: "purple" }, { t: " (isSafe(board, row, col)) {", c: "" }] },
    { l: 8, c: [{ t: "      board[row] = col;", c: "" }] },
    { l: 9, c: [{ t: "      solveNQueens(board, row + 1);", c: "" }] },
    { l: 10, c: [{ t: "      board[row] = -1;", c: "light-gray" }, { t: " // backtrack", c: "light-gray" }] },
    { l: 11, c: [{ t: "    }", c: "light-gray" }] },
    { l: 12, c: [{ t: "  }", c: "light-gray" }] },
    { l: 13, c: [{ t: "}", c: "light-gray" }] },
  ];

  const renderBoard = () => {
    if (n === 0) return null;

    const cellSize = Math.min(60, 400 / n);

    return (
      <div className="flex justify-center">
        <div className="inline-block">
          {Array.from({ length: n }, (_, row) => (
            <div key={row} className="flex">
              {Array.from({ length: n }, (_, col) => {
                const hasQueen = board[row] === col;
                const isCurrentRow = row === currentRow;
                const isTrying = isCurrentRow && col === tryingCol;
                const isPlaced = isCurrentRow && col === placedCol;
                const isAttacked = isCurrentRow && col === attackedCol;
                const isBacktrack = isCurrentRow && col === backtrackCol;
                const isLightSquare = (row + col) % 2 === 0;

                let bgColor = isLightSquare ? "bg-theme-elevated" : "bg-theme-tertiary";
                if (isTrying) bgColor = "bg-warning-hover/50";
                if (isPlaced) bgColor = "bg-success-hover/50";
                if (isAttacked) bgColor = "bg-danger-hover/50";
                if (isBacktrack) bgColor = "bg-orangehover/50";
                if (isSolution) bgColor = "bg-success-light";

                return (
                  <div
                    key={col}
                    className={`${bgColor} border border-theme-primary flex items-center justify-center transition-all duration-300`}
                    style={{ width: cellSize, height: cellSize }}
                  >
                    {hasQueen && (
                      <Crown className="text-warning" size={cellSize * 0.6} />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-accent-primary flex items-center justify-center gap-3">
          <Crown /> N-Queens Visualizer
        </h1>
        <p className="text-lg text-theme-tertiary mt-2">
          Visualize N-Queens backtracking algorithm
        </p>
      </header>

      <div className="bg-theme-tertiary p-4 rounded-lg shadow-xl border border-theme-primary flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-grow w-full">
          <label htmlFor="n-input" className="font-medium text-theme-secondary font-mono">Board size (n × n), n =</label>
          <input id="n-input" type="number" min="1" max="8" value={nInput} onChange={(e) => setNInput(e.target.value)} disabled={isLoaded} className="font-mono w-24 bg-theme-secondary border border-theme-primary rounded-md p-2 focus:ring-2 focus:ring-accent-primary" />
        </div>
        <div className="flex items-center gap-2">
          {!isLoaded ? (
            <button onClick={loadProblem} className="bg-accent-primary hover:bg-accent-primary-hover cursor-pointer text-theme-primary font-bold py-2 px-4 rounded-lg">Load & Visualize</button>
          ) : (
            <>
              <button onClick={stepBackward} disabled={currentStep <= 0} className="bg-theme-elevated p-2 rounded-md disabled:opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
              </button>
              <span className="font-mono w-24 text-center">{currentStep >= 0 ? currentStep + 1 : 0}/{history.length}</span>
              <button onClick={stepForward} disabled={currentStep >= history.length - 1} className="bg-theme-elevated p-2 rounded-md disabled:opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
              </button>
            </>
          )}
          <button onClick={reset} className="ml-4 bg-danger-hover hover:bg-danger-hover cursor-pointer font-bold py-2 px-4 rounded-lg">Reset</button>
        </div>
      </div>

      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-theme-tertiary/50 p-5 rounded-xl shadow-2xl border border-theme-primary/50">
            <h3 className="font-bold text-xl text-accent-primary mb-4 pb-3 border-b border-theme-primary/50 flex items-center gap-2">
              <Code size={20} />
              Pseudocode
            </h3>
            <pre className="text-sm overflow-auto">
              <code className="font-mono leading-relaxed">
                {nQueensCode.map((line) => (
                  <CodeLine key={line.l} line={line.l} content={line.c} />
                ))}
              </code>
            </pre>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-theme-tertiary/50 p-6 rounded-xl border border-theme-primary/50 shadow-2xl">
              <h3 className="font-bold text-lg text-theme-secondary mb-4 flex items-center gap-2">
                <Grid3x3 size={20} />
                Chess Board
              </h3>
              {renderBoard()}
              <div className="mt-4 flex flex-wrap gap-3 justify-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-warning-hover/50 border border-theme-primary"></div>
                  <span className="text-theme-secondary">Trying</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-success-hover/50 border border-theme-primary"></div>
                  <span className="text-theme-secondary">Placed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-danger-hover/50 border border-theme-primary"></div>
                  <span className="text-theme-secondary">Attacked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orangehover/50 border border-theme-primary"></div>
                  <span className="text-theme-secondary">Backtrack</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-teal800/30 p-4 rounded-xl border border-teal700/50">
                <h3 className="text-teal300 text-sm flex items-center gap-2">
                  <AlertCircle size={16} /> Recursive Calls
                </h3>
                <p className="font-mono text-4xl text-teal mt-2">{callCount}</p>
              </div>
              <div className="bg-purple800/30 p-4 rounded-xl border border-purple700/50">
                <h3 className="text-purple text-sm flex items-center gap-2">
                  <CheckCircle size={16} /> Solutions Found
                </h3>
                <p className="font-mono text-4xl text-purple mt-2">{solutionCount}</p>
              </div>
            </div>

            <div className="bg-theme-tertiary/50 p-4 rounded-xl border border-theme-primary/50 min-h-[5rem]">
              <h3 className="text-theme-tertiary text-sm mb-1">Explanation</h3>
              <p className="text-theme-secondary">{explanation}</p>
              {finished && (
                <div className="mt-2 flex items-center gap-2">
                  <CheckCircle className="text-success" />
                  <span className="text-success font-bold">
                    Backtracking Complete: {solutionCount} solution(s) found
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3 bg-theme-tertiary/50 p-5 rounded-xl shadow-2xl border border-theme-primary/50">
            <h3 className="font-bold text-xl text-accent-primary mb-4 pb-3 border-b border-theme-primary/50 flex items-center gap-2">
              <Clock size={20} /> Complexity Analysis
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <h4 className="font-semibold text-accent-primary">Time Complexity</h4>
                <p className="text-theme-tertiary">
                  <strong className="text-teal300 font-mono">O(n!)</strong>
                  <br />
                  In the worst case, the algorithm explores all possible placements. For each row, we try n positions, but many branches are pruned due to the safety check, making it more efficient than brute force O(n^n).
                </p>
                <h4 className="font-semibold text-accent-primary mt-4">Backtracking</h4>
                <p className="text-theme-tertiary">
                  The algorithm uses backtracking to explore the solution space. When a conflict is detected, it backtracks to try alternative placements, pruning invalid branches early.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-accent-primary">Space Complexity</h4>
                <p className="text-theme-tertiary">
                  <strong className="text-teal300 font-mono">O(n)</strong>
                  <br />
                  The recursion depth is at most n (one call per row), and we store the board state using an array of size n. The space for storing solutions is O(n × s) where s is the number of solutions.
                </p>
                <h4 className="font-semibold text-accent-primary mt-4">Constraint Satisfaction</h4>
                <p className="text-theme-tertiary">
                  N-Queens is a classic constraint satisfaction problem. Each queen must be placed such that no two queens attack each other (same row, column, or diagonal).
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-theme-muted py-10">Enter a board size to begin visualization.</p>
      )}
    </div>
  );
};

export default NQueensVisualizer;
