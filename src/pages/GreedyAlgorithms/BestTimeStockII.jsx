import React, { useState, useEffect, useCallback } from "react";

import {
  Code,
  TrendingUp,
  DollarSign,
  Calendar,
  Play,
  Pause,
  RotateCcw,
  ArrowLeft,
  SkipBack,
  SkipForward,
  Clock,
} from "lucide-react";

const BestTimeStockII = ({ navigate }) => {
  const [mode, setMode] = useState("greedy");
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [pricesInput, setPricesInput] = useState("7,1,5,3,6,4");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);

  // Simple and reliable history generation
  const generateGreedyHistory = useCallback((prices) => {
    const newHistory = [];
    let totalProfit = 0;
    let transactions = [];

    // Initial state
    newHistory.push({
      prices: [...prices],
      totalProfit: 0,
      transactions: [],
      explanation: "Starting greedy algorithm - Buy on every price increase",
      line: 1,
      finished: false,
    });

    // Process each day
    for (let i = 1; i < prices.length; i++) {
      const priceDiff = prices[i] - prices[i - 1];
      
      // Show current day analysis
      newHistory.push({
        prices: [...prices],
        totalProfit,
        transactions: [...transactions],
        explanation: `Day ${i + 1}: Price = $${prices[i]}, Previous = $${prices[i - 1]}, Difference = $${priceDiff}`,
        line: 2,
        finished: false,
        currentDay: i,
        previousDay: i - 1,
        priceDiff,
      });

      if (priceDiff > 0) {
        // Show transaction opportunity
        newHistory.push({
          prices: [...prices],
          totalProfit,
          transactions: [...transactions],
          explanation: `PROFIT: Buy at day ${i} ($${prices[i - 1]}), Sell at day ${i + 1} ($${prices[i]})`,
          line: 3,
          finished: false,
          currentDay: i,
          previousDay: i - 1,
          priceDiff,
          isTransaction: true,
        });

        // Execute transaction
        totalProfit += priceDiff;
        transactions.push({
          buyDay: i - 1,
          buyPrice: prices[i - 1],
          sellDay: i,
          sellPrice: prices[i],
          profit: priceDiff
        });

        newHistory.push({
          prices: [...prices],
          totalProfit,
          transactions: [...transactions],
          explanation: `Profit: +$${priceDiff}, Total: $${totalProfit}`,
          line: 4,
          finished: false,
          currentDay: i,
          isTransaction: true,
        });
      } else {
        newHistory.push({
          prices: [...prices],
          totalProfit,
          transactions: [...transactions],
          explanation: `No transaction - Price didn't increase`,
          line: 5,
          finished: false,
          currentDay: i,
        });
      }
    }

    // Final state
    newHistory.push({
      prices: [...prices],
      totalProfit,
      transactions: [...transactions],
      explanation: `Complete! Total profit: $${totalProfit} from ${transactions.length} transactions`,
      line: 6,
      finished: true,
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const generatePeakValleyHistory = useCallback((prices) => {
    const newHistory = [];
    let totalProfit = 0;
    let transactions = [];
    let i = 0;

    newHistory.push({
      prices: [...prices],
      totalProfit: 0,
      transactions: [],
      explanation: "Starting peak-valley algorithm",
      line: 1,
      finished: false,
    });

    while (i < prices.length - 1) {
      let valley = i;
      let peak = i;

      // Find valley
      while (i < prices.length - 1 && prices[i] >= prices[i + 1]) {
        i++;
      }
      valley = i;

      newHistory.push({
        prices: [...prices],
        totalProfit,
        transactions: [...transactions],
        explanation: `Valley found: Day ${valley + 1} at $${prices[valley]}`,
        line: 4,
        finished: false,
        valley,
        isValleyFound: true,
      });

      // Find peak
      while (i < prices.length - 1 && prices[i] <= prices[i + 1]) {
        i++;
      }
      peak = i;

      newHistory.push({
        prices: [...prices],
        totalProfit,
        transactions: [...transactions],
        explanation: `Peak found: Day ${peak + 1} at $${prices[peak]}`,
        line: 7,
        finished: false,
        peak,
        isPeakFound: true,
      });

      if (valley < peak) {
        const profit = prices[peak] - prices[valley];
        
        newHistory.push({
          prices: [...prices],
          totalProfit,
          transactions: [...transactions],
          explanation: `Buy at valley (Day ${valley + 1}), Sell at peak (Day ${peak + 1})`,
          line: 8,
          finished: false,
          valley,
          peak,
          isTransaction: true,
        });

        totalProfit += profit;
        transactions.push({
          buyDay: valley,
          buyPrice: prices[valley],
          sellDay: peak,
          sellPrice: prices[peak],
          profit
        });

        newHistory.push({
          prices: [...prices],
          totalProfit,
          transactions: [...transactions],
          explanation: `Profit: +$${profit}, Total: $${totalProfit}`,
          line: 9,
          finished: false,
          isTransaction: true,
        });
      }

      i++;
    }

    newHistory.push({
      prices: [...prices],
      totalProfit,
      transactions: [...transactions],
      explanation: `Complete! Total profit: $${totalProfit} from ${transactions.length} transactions`,
      line: 10,
      finished: true,
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const loadPrices = () => {
    try {
      const prices = pricesInput.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      if (prices.length < 2) {
        alert("Please enter at least 2 valid prices");
        return;
      }

      setIsLoaded(true);
      setCurrentStep(0);
      
      if (mode === "greedy") {
        generateGreedyHistory(prices);
      } else {
        generatePeakValleyHistory(prices);
      }
    } catch (error) {
      alert("Invalid input format");
    }
  };

  const reset = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const stepForward = () => {
    setCurrentStep(prev => Math.min(prev + 1, history.length - 1));
  };

  const stepBackward = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const playAnimation = () => {
    if (currentStep >= history.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
  };

  const pauseAnimation = () => {
    setIsPlaying(false);
  };

  useEffect(() => {
    let timer;
    if (isPlaying && currentStep < history.length - 1) {
      timer = setTimeout(stepForward, speed);
    } else {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, history.length, speed]);

  const generateNewPrices = () => {
    const prices = Array.from({ length: 8 }, () => Math.floor(Math.random() * 20) + 1);
    setPricesInput(prices.join(","));
    reset();
  };

  // Get current state safely
  const state = history[currentStep] || {};
  const { 
    prices = [], 
    totalProfit = 0, 
    transactions = [], 
    explanation = "Ready to start...",
    line = 1,
    finished = false,
    currentDay,
    previousDay,
    valley,
    peak,
    isTransaction = false,
    isValleyFound = false,
    isPeakFound = false
  } = state;

  // Clean chart rendering
  const renderPriceChart = () => {
    if (prices.length === 0) {
      return (
        <div className="bg-theme-tertiary p-6 rounded-xl border border-theme-primary">
          <div className="h-64 flex items-center justify-center text-theme-muted">
            No data to display
          </div>
        </div>
      );
    }

    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const chartHeight = 250;
    const barWidth = Math.max(30, 400 / prices.length);

    return (
      <div className="bg-theme-tertiary p-6 rounded-xl border border-theme-primary">
        <h3 className="font-bold text-lg text-theme-secondary mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Price Chart
        </h3>

        <div className="relative" style={{ height: chartHeight }}>
          {/* Bars */}
          <div className="flex items-end justify-center gap-2 h-full">
            {prices.map((price, index) => {
              const height = ((price - minPrice) / (maxPrice - minPrice || 1)) * (chartHeight - 60);
              
              let barColor = "bg-theme-elevated";
              let borderColor = "border-theme-muted";
              
              if (mode === "greedy") {
                if (index === currentDay && isTransaction) {
                  barColor = "bg-success";
                  borderColor = "border-success";
                } else if (index === previousDay && isTransaction) {
                  barColor = "bg-danger";
                  borderColor = "border-danger";
                } else if (index === currentDay) {
                  barColor = "bg-warning";
                  borderColor = "border-warning";
                }
              } else {
                if (index === valley && isValleyFound) {
                  barColor = "bg-accent-primary";
                  borderColor = "border-accent-primary";
                } else if (index === peak && isPeakFound) {
                  barColor = "bg-danger";
                  borderColor = "border-danger";
                } else if (index === currentDay) {
                  barColor = "bg-warning";
                  borderColor = "border-warning";
                }
              }

              return (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className={`w-8 ${barColor} border-2 ${borderColor} rounded-t transition-all duration-300`}
                    style={{ height: `${height}px` }}
                  />
                  <div className="text-xs text-theme-tertiary mt-2">Day {index + 1}</div>
                  <div className="text-sm font-semibold text-theme-secondary">${price}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 text-xs justify-center">
          {mode === "greedy" ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-danger rounded"></div>
                <span>Buy Point</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success rounded"></div>
                <span>Sell Point</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-warning rounded"></div>
                <span>Current</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-accent-primary rounded"></div>
                <span>Valley</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-danger rounded"></div>
                <span>Peak</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-warning rounded"></div>
                <span>Current</span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderCodePanel = () => {
    const greedyCodeLines = [
      { line: 1, code: "int maxProfit(vector<int>& prices) {", type: "declaration" },
      { line: 2, code: "  int profit = 0;", type: "initialization" },
      { line: 3, code: "  for (int i = 1; i < prices.size(); i++) {", type: "loop" },
      { line: 4, code: "    if (prices[i] > prices[i-1]) {", type: "condition" },
      { line: 5, code: "      profit += prices[i] - prices[i-1];", type: "calculation" },
      { line: 6, code: "    }", type: "closing" },
      { line: 7, code: "  }", type: "closing" },
      { line: 8, code: "  return profit;", type: "return" },
      { line: 9, code: "}", type: "closing" }
    ];

    const peakValleyCodeLines = [
      { line: 1, code: "int maxProfit(vector<int>& prices) {", type: "declaration" },
      { line: 2, code: "  int i = 0, profit = 0;", type: "initialization" },
      { line: 3, code: "  while (i < prices.size() - 1) {", type: "loop" },
      { line: 4, code: "    // Find valley (local minimum)", type: "comment" },
      { line: 5, code: "    while (i < prices.size()-1 &&", type: "loop" },
      { line: 6, code: "           prices[i] >= prices[i+1]) i++;", type: "calculation" },
      { line: 7, code: "    int valley = prices[i];", type: "assignment" },
      { line: 8, code: "    // Find peak (local maximum)", type: "comment" },
      { line: 9, code: "    while (i < prices.size()-1 &&", type: "loop" },
      { line: 10, code: "           prices[i] <= prices[i+1]) i++;", type: "calculation" },
      { line: 11, code: "    int peak = prices[i];", type: "assignment" },
      { line: 12, code: "    profit += peak - valley;", type: "calculation" },
      { line: 13, code: "  }", type: "closing" },
      { line: 14, code: "  return profit;", type: "return" },
      { line: 15, code: "}", type: "closing" }
    ];

    const codeLines = mode === "greedy" ? greedyCodeLines : peakValleyCodeLines;

    return (
      <div className="bg-theme-tertiary p-5 rounded-xl border border-theme-primary">
        <h3 className="font-bold text-xl text-success mb-4 border-b border-theme-primary pb-3 flex items-center gap-2">
          <Code className="w-5 h-5" />
          C++ Solution
        </h3>
        <div className="bg-theme-secondary rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm font-mono">
            {codeLines.map((item) => (
              <div
                key={item.line}
                className={`flex transition-all duration-300 py-1 px-2 rounded ${
                  state.line === item.line
                    ? "bg-success-light border-l-4 border-success shadow-lg"
                    : "hover:bg-theme-tertiary/50"
                }`}
              >
                <span className={`w-8 text-right pr-3 select-none ${
                  state.line === item.line ? "text-success font-bold" : "text-theme-muted"
                }`}>
                  {item.line}
                </span>
                <span className={`flex-1 ${
                  state.line === item.line 
                    ? "text-success font-semibold" 
                    : item.type === "comment" 
                    ? "text-theme-muted italic" 
                    : "text-theme-secondary"
                }`}>
                  {item.code}
                </span>
              </div>
            ))}
          </pre>
        </div>
        
        {/* Code Legend */}
        <div className="mt-4 p-3 bg-theme-elevated/50 rounded-lg border border-theme-primary">
          <h4 className="text-xs font-semibold text-theme-tertiary mb-2">Current Execution:</h4>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-success-light border-l-4 border-success rounded"></div>
            <span className="text-xs text-theme-secondary">Executing this line</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-theme-secondary text-theme-primary p-4">
      <div className="max-w-7xl mx-auto">
{/* Header */}
<header className="text-center mb-8">
  <div className="flex items-center justify-center mb-4">
    <div className="text-center">
      <h1 className="text-5xl font-bold text-success">
        Best Time to Buy and Sell Stock II
      </h1>
      <p className="text-lg text-theme-tertiary mt-2">
        LeetCode 122 - Maximize profit with multiple transactions
      </p>
    </div>
  </div>
</header>

        {/* Controls */}
        <div className="bg-theme-tertiary p-6 rounded-xl border border-theme-primary mb-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-grow">
              <label className="font-medium text-theme-secondary min-w-16">Prices:</label>
              <input
                type="text"
                value={pricesInput}
                onChange={(e) => setPricesInput(e.target.value)}
                disabled={isLoaded}
                className="flex-grow bg-theme-elevated border border-theme-primary rounded-lg p-3 focus:ring-2 focus:ring-success focus:outline-none"
                placeholder="e.g., 7,1,5,3,6,4"
              />
              <button
                onClick={generateNewPrices}
                className="bg-purplehover hover:bg-purple700 text-theme-primary font-bold py-3 px-4 rounded-lg transition-colors"
              >
                New Prices
              </button>
            </div>
            
            {!isLoaded ? (
              <button
                onClick={loadPrices}
                className="bg-success hover:bg-success-hover text-theme-primary font-bold py-3 px-8 rounded-lg transition-colors"
              >
                Load & Visualize
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={stepBackward}
                  disabled={currentStep <= 0}
                  className="bg-theme-elevated hover:bg-theme-elevated p-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  <SkipBack className="h-5 w-5" />
                </button>
                
                {!isPlaying ? (
                  <button
                    onClick={playAnimation}
                    disabled={currentStep >= history.length - 1}
                    className="bg-success hover:bg-success-hover p-3 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Play className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    onClick={pauseAnimation}
                    className="bg-warning hover:bg-warning-hover p-3 rounded-lg transition-colors"
                  >
                    <Pause className="h-5 w-5" />
                  </button>
                )}

                <span className="text-lg text-theme-secondary min-w-24 text-center">
                  {currentStep + 1}/{history.length}
                </span>
                
                <button
                  onClick={stepForward}
                  disabled={currentStep >= history.length - 1}
                  className="bg-theme-elevated hover:bg-theme-elevated p-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  <SkipForward className="h-5 w-5" />
                </button>

                <select
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="bg-theme-elevated border border-theme-primary rounded-lg px-3 py-2 text-theme-primary"
                >
                  <option value={1500}>Slow</option>
                  <option value={1000}>Medium</option>
                  <option value={500}>Fast</option>
                </select>

                <button
                  onClick={reset}
                  className="bg-danger-hover hover:bg-danger-hover text-theme-primary font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Algorithm Tabs */}
        <div className="flex border-b border-theme-primary mb-6">
          <button
            onClick={() => {
              setMode("greedy");
              reset();
            }}
            className={`flex-1 p-4 border-b-4 transition-all font-semibold ${
              mode === "greedy" ? "border-success text-success bg-success/10" : "border-transparent text-theme-tertiary"
            }`}
          >
            🚀 Greedy Approach
          </button>
          <button
            onClick={() => {
              setMode("peak-valley");
              reset();
            }}
            className={`flex-1 p-4 border-b-4 transition-all font-semibold ${
              mode === "peak-valley" ? "border-success text-success bg-success/10" : "border-transparent text-theme-tertiary"
            }`}
          >
            ⛰️ Peak-Valley Approach
          </button>
        </div>

        {isLoaded && history.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="xl:col-span-1 space-y-6">
              {renderCodePanel()}
              
              {/* Statistics */}
              <div className="bg-theme-tertiary p-6 rounded-xl border border-theme-primary">
                <h3 className="font-bold text-lg text-theme-secondary mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Statistics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Profit:</span>
                    <span className="text-2xl font-bold text-success">${totalProfit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transactions:</span>
                    <span className="text-lg text-accent-primary">{transactions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Step:</span>
                    <span className="text-lg text-warning">{currentStep + 1}/{history.length}</span>
                  </div>
                </div>
              </div>

              {/* Transactions */}
              <div className="bg-theme-tertiary p-6 rounded-xl border border-theme-primary">
                <h3 className="font-bold text-lg text-theme-secondary mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Transactions
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {transactions.map((t, i) => (
                    <div key={i} className="bg-theme-elevated/50 p-3 rounded border border-theme-primary">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-accent-primary font-semibold">Trade {i + 1}</span>
                        <span className="text-success font-bold">+${t.profit}</span>
                      </div>
                      <div className="text-xs text-theme-secondary">
                        <div>Buy: Day {t.buyDay + 1} (${t.buyPrice})</div>
                        <div>Sell: Day {t.sellDay + 1} (${t.sellPrice})</div>
                      </div>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <div className="text-theme-muted text-center py-4">No transactions</div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="xl:col-span-2 space-y-6">
              {renderPriceChart()}
              
              {/* Explanation */}
              <div className="bg-theme-tertiary p-6 rounded-xl border border-theme-primary">
                <h3 className="font-bold text-lg text-orange mb-4">Step Explanation</h3>
                <div className={`p-4 rounded-lg border-l-4 ${
                  finished ? 'border-success bg-success/10' : 'border-orange bg-orange/10'
                }`}>
                  {explanation}
                </div>
              </div>

              {/* Complexity */}
              <div className="bg-theme-tertiary p-6 rounded-xl border border-theme-primary">
                <h3 className="font-bold text-lg text-accent-primary mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Complexity Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-theme-elevated/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-accent-primary mb-2">Time: O(n)</h4>
                    <p className="text-theme-secondary text-sm">Single pass through prices</p>
                  </div>
                  <div className="bg-theme-elevated/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-accent-primary mb-2">Space: O(1)</h4>
                    <p className="text-theme-secondary text-sm">Constant extra space</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-theme-muted text-lg mb-4">
              {isLoaded ? "Loading..." : "Enter prices and click 'Load & Visualize'"}
            </div>
            <div className="text-theme-muted text-sm">
              Example: "7,1,5,3,6,4" or click "New Prices"
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BestTimeStockII;