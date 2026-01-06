import React, { useState } from "react";
import {
  ArrowLeft,
  Filter,
  Star,
  Clock,
  Zap,
  ArrowRight,
  TrendingUp,
  Code2,
  Brackets,
  Hash,
  Layers,
  Target,
  Grid,
  List,
  Puzzle,
  Map,
  MoveDiagonal,
} from "lucide-react";

import PermutationsVisualizer from "./Permutations.jsx";
import WordSearchVisualizer from "./WordSearch.jsx";
import SudokuSolver from "./SudokuSolver.jsx";
import ExpressionAddOperators from "./ExpressionAddOperators.jsx";
import KnightsTourVisualizer from "./KnightsTour.jsx"; // 🆕 NEW IMPORT

const AlgorithmList = ({ navigate }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [filter] = useState("all");

  const algorithms = [
    {
      name: "Word Search",
      number: "79",
      icon: Map,
      description:
        "Search for a word in a 2D grid of characters using backtracking.",
      page: "WordSearchVisualizer",
      difficulty: "Medium",
      tier: "Tier 2",
      difficultyColor: "text-warning",
      difficultyBg: "bg-warning/10",
      difficultyBorder: "border-warning/30",
      gradient: "from-danger500 to-pink500",
      iconColor: "text-danger",
      iconBg: "bg-danger-light",
      borderColor: "border-danger/30",
      technique: "Backtracking",
      timeComplexity: "O(M×N×4^L)",
      platforms: ["LeetCode #79", "GfG"],
      tags: ["Grid", "DFS", "String Matching"],
    },
    {
      name: "Permutations",
      number: "46",
      icon: List,
      description:
        "Generate all possible permutations of a distinct integers array.",
      page: "PermutationsVisualizer",
      difficulty: "Medium",
      tier: "Tier 2",
      difficultyColor: "text-warning",
      difficultyBg: "bg-warning/10",
      difficultyBorder: "border-warning/30",
      gradient: "from-success500 to-teal500",
      iconColor: "text-success",
      iconBg: "bg-success-light",
      borderColor: "border-success/30",
      technique: "Backtracking",
      timeComplexity: "O(N×N!)",
      platforms: ["LeetCode #46", "GfG"],
      tags: ["Combinatorics", "Recursion"],
    },
    {
      name: "Sudoku Solver",
      number: "37",
      icon: Puzzle,
      description:
        "Solve a 9x9 Sudoku puzzle by filling empty cells using backtracking.",
      page: "SudokuSolver",
      difficulty: "Hard",
      tier: "Tier 3",
      difficultyColor: "text-danger",
      difficultyBg: "bg-danger/10",
      difficultyBorder: "border-danger/30",
      gradient: "from-accent-primary500 to-accent-primary500",
      iconColor: "text-accent-primary",
      iconBg: "bg-accent-primary-light",
      borderColor: "border-accent-primary/30",
      technique: "Backtracking",
      timeComplexity: "O(9^(N*N))",
      platforms: ["LeetCode #37", "GfG"],
      tags: ["Grid", "Recursion", "Matrix"],
    },
    {
      name: "Expression Add Operators",
      number: "282",
      icon: Layers,
      description:
        "Insert +, -, * between digits to make expressions evaluate to a target.",
      page: "ExpressionAddOperators",
      difficulty: "Hard",
      tier: "Tier 3",
      difficultyColor: "text-danger",
      difficultyBg: "bg-danger/10",
      difficultyBorder: "border-danger/30",
      gradient: "from-purple500 to-fuchsia-500",
      iconColor: "text-purple",
      iconBg: "bg-purplelight",
      borderColor: "border-purple/30",
      technique: "Backtracking + Expression Parsing",
      timeComplexity: "O(4^N)",
      platforms: ["LeetCode #282", "GfG"],
      tags: ["Strings", "Math", "Recursion", "Operators"],
    },
    // 🆕 NEW ADDITION
    {
      name: "Knight's Tour",
      number: "Backtracking Challenge",
      icon: MoveDiagonal,
      description:
        "Move a knight on a chessboard to visit every square exactly once.",
      page: "KnightsTourVisualizer",
      difficulty: "Hard",
      tier: "Tier 3",
      difficultyColor: "text-danger",
      difficultyBg: "bg-danger/10",
      difficultyBorder: "border-danger/30",
      gradient: "from-orange to-orange",
      iconColor: "text-orange",
      iconBg: "bg-orange/20",
      borderColor: "border-orange500/30",
      technique: "Backtracking + Graph Traversal",
      timeComplexity: "O(8^(N*N))",
      platforms: ["Classic Backtracking Problem"],
      tags: ["Recursion", "DFS", "Chess", "Matrix"],
    },
  ];

  const filteredAlgorithms = algorithms.filter((algo) => {
    if (filter === "all") return true;
    if (filter === "medium") return algo.tier === "Tier 2";
    if (filter === "hard") return algo.tier === "Tier 3";
    return false;
  });

  // 🔹 Rest of your UI code (no change)
  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* ...header and filters stay same... */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        {filteredAlgorithms.map((algo, index) => {
          const isHovered = hoveredIndex === index;
          const Icon = algo.icon;
          return (
            <div
              key={algo.name}
              onClick={() => navigate(algo.page)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="group relative cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${algo.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`}
              />
              <div
                className={`relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm rounded-2xl p-6 border ${algo.borderColor} transition-all duration-300 transform group-hover:-translate-y-2 group-hover:scale-[1.02] group-hover:shadow-2xl`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 ${algo.iconBg} rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}
                    >
                      <Icon
                        className={`h-10 w-10 ${
                          isHovered ? "text-theme-primary" : algo.iconColor
                        } transition-colors duration-300`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-theme-muted">
                          #{algo.number}
                        </span>
                        <div
                          className={`px-2 py-0.5 rounded-md text-xs font-bold ${algo.difficultyBg} ${algo.difficultyColor} border ${algo.difficultyBorder}`}
                        >
                          {algo.difficulty}
                        </div>
                        <div className="px-2 py-0.5 bg-theme-elevated/50 rounded-md text-xs text-theme-secondary border border-theme-primary">
                          {algo.tier}
                        </div>
                      </div>
                      <h2
                        className={`text-xl font-bold transition-colors duration-300 ${
                          isHovered ? "text-theme-primary" : "text-theme-secondary"
                        }`}
                      >
                        {algo.name}
                      </h2>
                    </div>
                  </div>
                </div>

                <p
                  className={`text-sm leading-relaxed mb-5 transition-colors duration-300 ${
                    isHovered ? "text-theme-secondary" : "text-theme-tertiary"
                  }`}
                >
                  {algo.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {algo.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-1 bg-theme-elevated/30 rounded text-xs text-theme-secondary border border-theme-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-theme-secondary">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 text-orange" />
                      <span className="text-xs font-medium text-theme-tertiary">
                        {algo.technique}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-accent-primary" />
                      <span className="text-xs font-mono text-theme-tertiary">
                        {algo.timeComplexity}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-theme-tertiary">
                      Solve
                    </span>
                    <ArrowRight className="h-4 w-4 text-theme-tertiary" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const BacktrackingPage = ({ navigate: initialPage = null }) => {
  const [page, setPage] = useState(initialPage || "home");
  const navigate = (newPage) => setPage(newPage);

  const renderPage = () => {
    switch (page) {
      case "SudokuSolver":
        return <SudokuSolver navigate={navigate} />;
      case "PermutationsVisualizer":
        return <PermutationsVisualizer />;
      case "WordSearchVisualizer":
        return <WordSearchVisualizer />;
      case "ExpressionAddOperators":
        return <ExpressionAddOperators navigate={navigate} />;
      case "KnightsTourVisualizer": // 🆕 NEW CASE
        return <KnightsTourVisualizer navigate={navigate} />;
      default:
        return <AlgorithmList navigate={navigate} />;
    }
  };

  return (
    <div className="bg-theme-primary text-theme-primary min-h-screen relative overflow-hidden">
      {renderPage()}
    </div>
  );
};

export default BacktrackingPage;
