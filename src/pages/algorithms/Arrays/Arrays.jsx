import React, { useState } from "react";
import {
  ArrowLeft,
  Brackets,
  Code2,
  Clock,
  TrendingUp,
  Star,
  Zap,
  ArrowRight,
  Layers, // For 4-Sum icon
  Container, 
  Droplets, 
  ToggleRight, 
  ArrowUpDown, 
  Target, 
  Calculator, 
  Merge, 
  Maximize2, 
  Minus, 
  Plus, 
  MoveRight, 
  BarChart3, 
  RotateCcw, 
  RefreshCw, 
  Hash
} from "lucide-react";

// --- Import your specific algorithm visualizer components here ---
import TrappingRainWater from "./TrappingRainWater.jsx";
import ContainerWithMostWater from "./ContainerWithMostWater.jsx";
import MaxConsecutiveOnesIII from "./MaxConsecutiveOnesIII.jsx";
import SubarrayRanges from "./SubarrayRanges.jsx";
import FindMaxElement from "./FindMaxElement.jsx";
import FindMinElement from "./FindMinElement.jsx";
import MoveZeros from "./MoveZeros.jsx";
import CountZeros from "./CountZeros.jsx";
import ArraySum from "./ArraySum.jsx";
import ReverseArray from "./ReverseArray.jsx";
import TwoSum from "./TwoSum.jsx";
import ThreeSum from "./3Sum.jsx";
import FourSum from "./4-sum.jsx"; // ✅ Maintainer's new import
import SplitArrayLargestSum from "./SplitArrayLargestSum.jsx";
import SquaresOfSortedArray from "./SquaresOfSortedArray.tsx";
import ProductOfArrayExceptSelf from "./ProductOfArrayExceptSelf.jsx";
import MaximumSubarray from "./MaximumSubarray.jsx";
import MergeIntervals from "./MergeIntervals.jsx";
import RotateArray from "./RotateArray.jsx";
import MaximumGap from "./MaximumGap.jsx";

// --- ✅ Import the master catalog and your StarButton ---
import { problems as PROBLEM_CATALOG } from '../../../search/catalog';
import StarButton from '../../../components/StarButton';

// ✅ (Optional but Recommended) Default values for visual properties
const defaultVisuals = {
  icon: Brackets,
  gradient: "from-theme-elevated to-gray-800",
  borderColor: "border-theme-primary",
  iconBg: "bg-theme-elevated/20",
  iconColor: "text-theme-secondary",
  difficulty: "N/A",
  tier: "N/A",
  difficultyColor: "text-theme-tertiary",
  difficultyBg: "bg-theme-muted/10",
  difficultyBorder: "border-theme-muted/30",
  description: "An array-based algorithm.",
  tags: [],
  technique: "Array Logic",
  timeComplexity: "N/A",
  platforms: [],
};

function AlgorithmList({ navigate }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [filter, setFilter] = useState("all");

  // ✅ Get Array problems directly from the master catalog
  const arrayProblems = PROBLEM_CATALOG.filter(p => p.category === 'Arrays');

  // ❌ The local 'algorithms' array has been DELETED.

  // ✅ Use the filtered list derived from the master catalog
  const filteredAlgorithms = arrayProblems.filter((algo) => {
    // Note: Add 'tier' property to catalog.js items for this filter to work fully
    if (filter === "all") return true;
    if (filter === "beginner") return algo.tier === "Tier 1";
    if (filter === "easy") return algo.tier === "Tier 2";
    if (filter === "intermediate") return algo.tier === "Tier 3";
    return true;
  });

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <header className="text-center mb-16 mt-8 relative">
        <div className="absolute top-0 left-1/3 w-64 h-64 bg-orange/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
        <div className="absolute top-10 right-1/3 w-80 h-80 bg-orangelight rounded-full blur-3xl animate-pulse-slow-delayed pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-5 mb-6">
            <div className="relative">
              <Brackets className="h-14 sm:h-16 w-14 sm:w-16 text-orange animated-icon" />
              <Zap className="h-5 w-5 text-warning absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange via-orange-400 to-danger400 animated-gradient">
              Array Algorithms
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-theme-secondary mt-6 max-w-3xl mx-auto leading-relaxed px-4">
            Master array problems with powerful techniques like{" "}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange to-orange400">
              two-pointers
            </span>{" "}
            and{" "}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal400 to-accent-primary400">
              sliding windows
            </span>
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8 px-4">
            <div className="px-4 py-2 bg-gradient-to-r from-orange/10 to-orange/10 rounded-full border border-orange500/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Code2 className="h-3.5 w-3.5 text-orange" />
                <span className="text-xs font-medium text-theme-secondary">
                  {arrayProblems.length} Problems
                </span>
              </div>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-success500/10 to-success500/10 rounded-full border border-success/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-success" />
                <span className="text-xs font-medium text-theme-secondary">
                  Multiple Techniques
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* ✅ Keep filter buttons from maintainer */}
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
          onClick={() => setFilter("beginner")}
          className={`px-4 py-2 rounded-full border backdrop-blur-sm transition-all ${
            filter === "beginner"
              ? "bg-success-light border-success/50 text-success"
              : "bg-theme-tertiary/50 border-theme-primary text-theme-tertiary hover:border-theme-primary"
          }`}
        >
          Beginner (Tier 1)
        </button>
        <button
          onClick={() => setFilter("easy")}
          className={`px-4 py-2 rounded-full border backdrop-blur-sm transition-all ${
            filter === "easy"
              ? "bg-accent-primary-light border-accent-primary/50 text-accent-primary"
              : "bg-theme-tertiary/50 border-theme-primary text-theme-tertiary hover:border-theme-primary"
          }`}
        >
          Easy (Tier 2)
        </button>
        <button
          onClick={() => setFilter("intermediate")}
          className={`px-4 py-2 rounded-full border backdrop-blur-sm transition-all ${
            filter === "intermediate"
              ? "bg-warning-light border-warning/50 text-warning"
              : "bg-theme-tertiary/50 border-theme-primary text-theme-tertiary hover:border-theme-primary"
          }`}
        >
          Intermediate+ (Tier 3)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        {filteredAlgorithms.map((algo, index) => {
          const isHovered = hoveredIndex === index;
          const Icon = algo.icon || defaultVisuals.icon; 
          return (
            <div
              key={algo.subpage}
              onClick={() => navigate(algo.subpage)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="group relative cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${algo.gradient || defaultVisuals.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
              <div className={`relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm rounded-2xl p-6 border ${algo.borderColor || defaultVisuals.borderColor} transition-all duration-300 transform group-hover:-translate-y-2 group-hover:scale-[1.02] group-hover:shadow-2xl`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 ${algo.iconBg || defaultVisuals.iconBg} rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                      <Icon className={`h-10 w-10 ${isHovered ? "text-theme-primary" : (algo.iconColor || defaultVisuals.iconColor)} transition-colors duration-300`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-theme-muted">#{algo.number || 'N/A'}</span>
                        <div className={`px-2 py-0.5 rounded-md text-xs font-bold ${algo.difficultyBg || defaultVisuals.difficultyBg} ${algo.difficultyColor || defaultVisuals.difficultyColor} border ${algo.difficultyBorder || defaultVisuals.difficultyBorder}`}>
                          {algo.difficulty || defaultVisuals.difficulty}
                        </div>
                        <div className="px-2 py-0.5 bg-theme-elevated/50 rounded-md text-xs text-theme-secondary border border-theme-primary">
                          {algo.tier || defaultVisuals.tier}
                        </div>
                      </div>
                      <h2 className={`text-xl font-bold transition-colors duration-300 ${isHovered ? "text-theme-primary" : "text-theme-secondary"}`}>
                        {algo.label}
                      </h2>
                    </div>
                  </div>
                  {/* ✅ StarButton included */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <StarButton problemId={algo.subpage} />
                  </div>
                </div>
                <p className={`text-sm leading-relaxed mb-5 transition-colors duration-300 ${isHovered ? "text-theme-secondary" : "text-theme-tertiary"}`}>
                  {algo.description || defaultVisuals.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(algo.tags || defaultVisuals.tags).map((tag, tagIndex) => (
                    <span key={tagIndex} className="px-2 py-1 bg-theme-elevated/30 rounded text-xs text-theme-secondary border border-theme-primary">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-theme-secondary">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 text-orange" />
                      <span className="text-xs font-medium text-theme-tertiary">{algo.technique || defaultVisuals.technique}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-accent-primary" />
                      <span className="text-xs font-mono text-theme-tertiary">{algo.timeComplexity || defaultVisuals.timeComplexity}</span>
                    </div>
                  </div>
                  <div className={`transition-all duration-300 ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium text-theme-tertiary">Solve</span>
                      <ArrowRight className="h-4 w-4 text-theme-tertiary" />
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
          <div className="text-theme-muted text-lg">No problems found for the selected filter.</div>
        </div>
      )}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800/80 to-gray-900/80 rounded-full border border-theme-primary backdrop-blur-sm">
          <TrendingUp className="h-4 w-4 text-success" />
          <span className="text-sm text-theme-tertiary">More array problems coming soon</span>
        </div>
      </div>
    </div>
  );
}

const ArrayPage = ({ navigate: parentNavigate, initialPage = null }) => {
  const [page, setPage] = useState(initialPage || "home");
  const navigate = (newPage) => setPage(newPage);
  const renderPage = () => {
    switch (page) {
      // Basic problems
      case "FindMaxElement": return <FindMaxElement navigate={navigate} />;
      case "FindMinElement": return <FindMinElement navigate={navigate} />;
      case "ArraySum": return <ArraySum navigate={navigate} />;
      case "ReverseArray": return <ReverseArray navigate={navigate} />;
      case "TwoSum": return <TwoSum navigate={navigate} />;
      case "RotateArray": return <RotateArray navigate={navigate} />;
      // case "RemoveDuplicates": return <RemoveDuplicates navigate={navigate} />; // This was in HEAD but not in your branch
      case "MoveZeros": return <MoveZeros navigate={navigate} />;
      case "CountZeros": return <CountZeros navigate={navigate} />;
      case "SquaresOfSortedArray": return <SquaresOfSortedArray navigate={navigate} />;
      case "MaximumGap": return <MaximumGap navigate={navigate} />;
      case "4-Sum": return <FourSum navigate={navigate} />; // ✅ Maintainer's new route
      
      // Existing problems
      case "TrappingRainWater": return <TrappingRainWater navigate={navigate} />;
      case "ContainerWithMostWater": return <ContainerWithMostWater navigate={navigate} />;
      case "MaxConsecutiveOnesIII": return <MaxConsecutiveOnesIII navigate={navigate} />;
      case "SubarrayRanges": return <SubarrayRanges navigate={navigate} />;
      case "BestTimeToBuyAndSellStock": /* This case was in HEAD but not your branch, add if in catalog */ break;
      case "SplitArrayLargestSum": return <SplitArrayLargestSum navigate={navigate} />;
      case "ThreeSum": return <ThreeSum navigate={navigate} />;
      case "ProductOfArrayExceptSelf": return <ProductOfArrayExceptSelf navigate={navigate} />;
      case "MaximumSubarray": return <MaximumSubarray navigate={navigate} />;
      case "MergeIntervals": return <MergeIntervals navigate={navigate} />;
      
      case "home":
      default:
        return <AlgorithmList navigate={navigate} />;
    }
  };

  const PageWrapper = ({ children }) => (
    <div className="bg-theme-primary text-theme-primary min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orangelight rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-danger-light rounded-full blur-3xl animate-pulse-slow" />
      </div>
      <style>{`
        .animated-gradient { background-size: 200% auto; animation: gradient-animation 4s ease-in-out infinite; }
        @keyframes gradient-animation { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .animate-fade-in-up { animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animated-icon { animation: float-rotate 8s ease-in-out infinite; filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.6)); }
        @keyframes float-rotate { 0%, 100% { transform: translateY(0) rotate(0deg); } 33% { transform: translateY(-8px) rotate(120deg); } 66% { transform: translateY(-4px) rotate(240deg); } }
        .animate-pulse-slow, .animate-pulse-slow-delayed { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-pulse-slow-delayed { animation-delay: 2s; }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } }
        .animate-float { animation: float 20s ease-in-out infinite; }
        .animate-float-delayed { animation: float 20s ease-in-out infinite; animation-delay: 10s; }
        @keyframes float { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(30px, -30px) scale(1.1); } }
      `}</style>
      <div className="relative z-10">{children}</div>
    </div>
  );

  return (
    <PageWrapper>
      {page !== "home" && (
        <nav className="bg-theme-secondary/80 backdrop-blur-xl border-b border-theme-secondary sticky top-0 z-50 h-16 flex items-center shadow-xl">
          <div className="max-w-7xl px-6 w-full mx-auto flex items-center justify-between">
            <button onClick={() => navigate("home")} className="flex items-center gap-2 text-theme-secondary bg-theme-tertiary/80 hover:bg-theme-elevated active:bg-theme-elevated px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 border border-theme-primary hover:border-theme-primary cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
              Back to Problems
            </button>
            <div className="flex items-center gap-2">
              <Brackets className="h-5 w-5 text-orange" />
              <span className="text-sm font-semibold text-theme-secondary">Array Algorithms</span>
            </div>
          </div>
        </nav>
      )}
      {page === "home" && parentNavigate && (
        <nav className="bg-theme-secondary/80 backdrop-blur-xl border-b border-theme-secondary sticky top-0 z-50 h-16 flex items-center shadow-xl">
          <div className="max-w-7xl px-6 w-full mx-auto">
            <button onClick={() => parentNavigate("home")} className="flex items-center gap-2 text-theme-secondary bg-theme-tertiary/80 hover:bg-theme-elevated active:bg-theme-elevated px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 border border-theme-primary hover:border-theme-primary cursor-pointer">
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

export default ArrayPage;