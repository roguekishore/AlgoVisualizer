import React, { useState } from "react";
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  Zap, 
  ArrowRight, 
  TrendingUp,
  Code2,
  Calculator,
  PieChart,
  Binary,
  Network,
  Hash,
  Grid,
  Puzzle,
  Cpu,
  Power
} from "lucide-react";
import CountPrimes from "./CountPrimes.jsx";
import PowerPage from "./Power.jsx";
import PrimePalindrome from "./PrimePalindrome.jsx";
import ExcelSheetColumnTitle from "./ExcelSheetColumnTitle.jsx";
import FactorialZeroes from "./FactorialZeroes.jsx";

const AlgorithmList = ({ navigate }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [filter, setFilter] = useState("all");

  const algorithms = [
  {
    name: "Count Primes",
    number: "204",
    icon: Hash,
    description: "Count the number of prime numbers less than a non-negative number.",
    page: "CountPrimes",
    difficulty: "Medium",
    tier: "Tier 2",
    difficultyColor: "text-warning",
    difficultyBg: "bg-warning/10",
    difficultyBorder: "border-warning/30",
    gradient: "from-accent-primary500 to-teal500",
    iconColor: "text-accent-primary",
    iconBg: "bg-accent-primary-light",
    borderColor: "border-accent-primary/30",
    technique: "Sieve Method",
    timeComplexity: "O(n log log n)",
    platforms: ["LeetCode #204", "GfG"],
    tags: ["Number Theory", "Sieve", "Primes"]
  },
  {
    name: "Pow(x, n)",
    number: "50",
    icon: Zap,
    description: "Implement pow(x, n) which calculates x raised to the power n using fast exponentiation.",
    page: "PowerPage",
    difficulty: "Medium",
    tier: "Tier 2",
    difficultyColor: "text-warning",
    difficultyBg: "bg-warning/10",
    difficultyBorder: "border-warning/30",
    gradient: "from-success to-teal500",
    iconColor: "text-success",
    iconBg: "bg-success/20",
    borderColor: "border-success500/30",
    technique: "Fast Exponentiation",
    timeComplexity: "O(log n)",
    platforms: ["LeetCode #50", "GfG"],
    tags: ["Exponentiation", "Math", "Recursion"]
  },
  {
    name: "Excel Sheet Column Title",
    number: "168",
    icon: Grid,
    description: "Convert a column number to its corresponding Excel sheet column title (1->A, 28->AB).",
    page: "ExcelColumnTitle",
    difficulty: "Easy",
    tier: "Tier 1",
    difficultyColor: "text-success",
    difficultyBg: "bg-success/10",
    difficultyBorder: "border-success/30",
    gradient: "from-purple500 to-purple500",
    iconColor: "text-purple",
    iconBg: "bg-purple/20",
    borderColor: "border-purple500/30",
    technique: "Base Conversion",
    timeComplexity: "O(log n)",
    platforms: ["LeetCode #168", "GfG"],
    tags: ["String", "Base-26", "Conversion"]
  },
  {
    name: "Factorial Trailing Zeroes",
    number: "172",
    icon: Calculator,
    description: "Count trailing zeroes in factorial without computing the factorial.",
    page: "FactorialZeroes",
    difficulty: "Medium",
    tier: "Tier 2",
    difficultyColor: "text-warning",
    difficultyBg: "bg-warning/10",
    difficultyBorder: "border-warning/30",
    gradient: "from-accent-primary500 to-accent-primary500",
    iconColor: "text-accent-primary",
    iconBg: "bg-accent-primary-light",
    borderColor: "border-accent-primary/30",
    technique: "Mathematical Analysis",
    timeComplexity: "O(log n)",
    platforms: ["LeetCode #172", "GfG"],
    tags: ["Math", "Counting", "Optimization"]
  },
  {
    name: "Prime Palindrome",
    number: "866",
    icon: Calculator,
    description: "Find the smallest prime palindrome greater than or equal to a given number.",
    page: "PrimePalindrome",
    difficulty: "Medium",
    tier: "Tier 2",
    difficultyColor: "text-warning",
    difficultyBg: "bg-warning/10",
    difficultyBorder: "border-warning/30",
    gradient: "from-accent-primary500 to-accent-primary500",
    iconColor: "text-accent-primary",
    iconBg: "bg-accent-primary-light",
    borderColor: "border-accent-primary/30",
    technique: "Mathematical Analysis",
    timeComplexity: "O(log n)",
    platforms: ["LeetCode #866"],
    tags: ["Math", "Counting", "Optimization"]
  }
];

  const filteredAlgorithms = algorithms.filter(algo => {
    if (filter === "all") return true;
    if (filter === "easy") return algo.tier === "Tier 1";
    if (filter === "medium") return algo.tier === "Tier 2";
    if (filter === "hard") return algo.tier === "Tier 3";
    return true;
  });

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <header className="text-center mb-16 mt-8 relative">
        <div className="absolute top-0 left-1/3 w-64 h-64 bg-accent-primary-light rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
        <div className="absolute top-10 right-1/3 w-80 h-80 bg-teal/10 rounded-full blur-3xl animate-pulse-slow-delayed pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-5 mb-6">
            <div className="relative">
              <svg className="h-14 sm:h-16 w-14 sm:w-16 text-accent-primary animated-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <Cpu className="h-5 w-5 text-teal300 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-accent-primary400 via-cyan-400 to-teal400 animated-gradient">
              Mathematical & Miscellaneous
            </h1>
          </div>

          <p className="text-lg sm:text-xl text-theme-secondary mt-6 max-w-3xl mx-auto leading-relaxed px-4">
            Master the numerical foundations and essential utilities for efficient{" "}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-primary400 to-teal400">
              problem-solving
            </span>{" "}
            with mathematical insights and{" "}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal400 to-success400">
              algorithmic thinking.
            </span>
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-8 px-4">
            <div className="px-4 py-2 bg-gradient-to-r from-accent-primary500/10 to-teal500/10 rounded-full border border-accent-primary/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Code2 className="h-3.5 w-3.5 text-accent-primary" />
                <span className="text-xs font-medium text-theme-secondary">
                  {algorithms.length} Problems
                </span>
              </div>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-teal500/10 to-success500/10 rounded-full border border-teal/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-teal" />
                <span className="text-xs font-medium text-theme-secondary">
                  Mathematical Foundations
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-full border backdrop-blur-sm transition-all ${
            filter === "all"
              ? "bg-accent-primary-light border-accent-primary/50 text-accent-primary"
              : "bg-theme-tertiary/50 border-theme-primary text-theme-tertiary hover:border-theme-primary"
          }`}
        >
          All Problems
        </button>
        <button
          onClick={() => setFilter("easy")}
          className={`px-4 py-2 rounded-full border backdrop-blur-sm transition-all ${
            filter === "easy"
              ? "bg-success-light border-success/50 text-success"
              : "bg-theme-tertiary/50 border-theme-primary text-theme-tertiary hover:border-theme-primary"
          }`}
        >
          Easy (Tier 1)
        </button>
        <button
          onClick={() => setFilter("medium")}
          className={`px-4 py-2 rounded-full border backdrop-blur-sm transition-all ${
            filter === "medium"
              ? "bg-warning-light border-warning/50 text-warning"
              : "bg-theme-tertiary/50 border-theme-primary text-theme-tertiary hover:border-theme-primary"
          }`}
        >
          Medium (Tier 2)
        </button>
        <button
          onClick={() => setFilter("hard")}
          className={`px-4 py-2 rounded-full border backdrop-blur-sm transition-all ${
            filter === "hard"
              ? "bg-danger-light border-danger/50 text-danger"
              : "bg-theme-tertiary/50 border-theme-primary text-theme-tertiary hover:border-theme-primary"
          }`}
        >
          Hard (Tier 3)
        </button>
      </div>

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
                        className={`h-10 w-10 ${isHovered ? "text-theme-primary" : algo.iconColor} transition-colors duration-300`}
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
                        className={`text-xl font-bold transition-colors duration-300 ${isHovered ? "text-theme-primary" : "text-theme-secondary"}`}
                      >
                        {algo.name}
                      </h2>
                    </div>
                  </div>
                </div>

                <p
                  className={`text-sm leading-relaxed mb-5 transition-colors duration-300 ${isHovered ? "text-theme-secondary" : "text-theme-tertiary"}`}
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
                    <div className="flex flex-wrap gap-1">
                      {algo.platforms.map((platform, platformIndex) => (
                        <span
                          key={platformIndex}
                          className="px-2 py-1 bg-theme-tertiary/50 rounded text-xs text-theme-tertiary border border-theme-primary"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>

                    <div
                      className={`transition-all duration-300 ${
                        isHovered
                          ? "opacity-100 translate-x-0"
                          : "opacity-0 -translate-x-2"
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium text-theme-tertiary">
                          Solve
                        </span>
                        <ArrowRight className="h-4 w-4 text-theme-tertiary" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAlgorithms.length === 0 && (
        <div className="text-center py-12">
          <div className="text-theme-muted text-lg">
            No problems found for the selected filter.
          </div>
        </div>
      )}

      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800/80 to-gray-900/80 rounded-full border border-theme-primary backdrop-blur-sm">
          <TrendingUp className="h-4 w-4 text-accent-primary" />
          <span className="text-sm text-theme-tertiary">
            More mathematical problems coming soon
          </span>
        </div>
      </div>
    </div>
  );
};

const MathsMiscPage = ({ navigate: parentNavigate, initialPage = null }) => {
  const [page, setPage] = useState(initialPage || "home");
  const navigate = (newPage) => setPage(newPage);

  const renderPage = () => {
  switch (page) {
    case "CountPrimes":
      return <CountPrimes />;
    case "PowerPage":
      return <PowerPage />;
    case "ExcelColumnTitle":
      return <ExcelSheetColumnTitle />;
    case "FactorialZeroes":
      return <FactorialZeroes />;
    case "PrimePalindrome":
      return <PrimePalindrome />;
    case "home":
    default:
      return <AlgorithmList navigate={navigate} />;
  }
};

  const PageWrapper = ({ children }) => (
    <div className="bg-theme-primary text-theme-primary min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-primary-light rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal/10 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <style>{`
        .animated-gradient {
          background-size: 200% auto;
          animation: gradient-animation 4s ease-in-out infinite;
        }
        @keyframes gradient-animation {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animated-icon {
          animation: float-rotate 8s ease-in-out infinite;
          filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.6));
        }
        @keyframes float-rotate {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-8px) rotate(120deg); }
          66% { transform: translateY(-4px) rotate(240deg); }
        }
        .animate-pulse-slow, .animate-pulse-slow-delayed {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-pulse-slow-delayed {
          animation-delay: 2s;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 20s ease-in-out infinite;
          animation-delay: 10s;
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }
      `}</style>
      <div className="relative z-10">{children}</div>
    </div>
  );

  return (
    <PageWrapper>
      {/* Navigation to go back to the problem list within this category */}
      {page !== "home" && (
        <nav className="bg-theme-secondary/80 backdrop-blur-xl border-b border-theme-secondary sticky top-0 z-50 h-16 flex items-center shadow-xl">
          <div className="max-w-7xl px-6 w-full mx-auto flex items-center justify-between">
            <button
              onClick={() => navigate("home")}
              className="flex items-center gap-2 text-theme-secondary bg-theme-tertiary/80 hover:bg-theme-elevated active:bg-theme-elevated px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 border border-theme-primary hover:border-theme-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Problems
            </button>
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-accent-primary" />
              <span className="text-sm font-semibold text-theme-secondary">
                Mathematical & Miscellaneous
              </span>
            </div>
          </div>
        </nav>
      )}

      {/* Navigation to go back to the main category homepage */}
      {page === "home" && parentNavigate && (
        <nav className="bg-theme-secondary/80 backdrop-blur-xl border-b border-theme-secondary sticky top-0 z-50 h-16 flex items-center shadow-xl">
          <div className="max-w-7xl px-6 w-full mx-auto">
            <button
              onClick={() => parentNavigate("home")}
              className="flex items-center gap-2 text-theme-secondary bg-theme-tertiary/80 hover:bg-theme-elevated active:bg-theme-elevated px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 border border-theme-primary hover:border-theme-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </button>
          </div>
        </nav>
      )}

      {renderPage()}
    </PageWrapper>
  );
};

export default MathsMiscPage;