import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Code2,
  Clock,
  TrendingUp,
  Star,
  Zap,
  Hash,
  Binary,
  Cpu,
  Calculator,
  FlipHorizontal,
  Power,
} from "lucide-react";

// --- Import your specific algorithm visualizer components ---
import SingleNumberVisualizer from "./SingleNumber.jsx";
import NumberOf1Bits from "./NumberOf1Bits.jsx";
import CountingBits from "./CountingBits.jsx";
import ReverseBits from "./ReverseBits.jsx";
import PowerOfTwo from "./PowerOfTwo.jsx";

// --- ✅ Import the master catalog and your StarButton ---
import { problems as PROBLEM_CATALOG } from '../../../search/catalog';
import StarButton from '../../../components/StarButton';

const AlgorithmList = ({ navigate }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [filter, setFilter] = useState("all");

  // ✅ Enhanced Bit Manipulation algorithms with all required questions
  const bitManipulationAlgorithms = [
    {
      name: "Single Number",
      label: "Single Number",
      number: "136",
      subpage: "SingleNumber",
      icon: Hash,
      description: "Find the number that appears exactly once in an array where all other numbers appear twice using XOR operation.",
      difficulty: "Easy",
      tier: "Tier 1",
      difficultyColor: "text-success",
      difficultyBg: "bg-success/10",
      difficultyBorder: "border-success/30",
      gradient: "from-teal500 to-accent-primary500",
      iconColor: "text-teal",
      iconBg: "bg-teal/20",
      borderColor: "border-teal500/30",
      technique: "XOR Operation",
      timeComplexity: "O(n)",
      platforms: ["LeetCode #136", "GfG"],
      tags: ["XOR", "Array", "Bit Manipulation"]
    },
    {
      name: "Counting Bits",
      label: "Counting Bits",
      number: "338",
      subpage: "CountingBits",
      icon: Calculator,
      description: "Count the number of set bits for all numbers from 0 to n efficiently using dynamic programming and bit manipulation.",
      difficulty: "Easy",
      tier: "Tier 1",
      difficultyColor: "text-success",
      difficultyBg: "bg-success/10",
      difficultyBorder: "border-success/30",
      gradient: "from-purple500 to-purple500",
      iconColor: "text-purple",
      iconBg: "bg-purple/20",
      borderColor: "border-purple500/30",
      technique: "Dynamic Programming",
      timeComplexity: "O(n)",
      platforms: ["LeetCode #338", "GfG"],
      tags: ["DP", "Bit Count", "Pattern"]
    },
    {
      name: "Number of 1 Bits",
      label: "Number of 1 Bits",
      number: "191",
      subpage: "NumberOf1Bits",
      icon: Binary,
      description: "Count the number of set bits (1s) in the binary representation of a number using bit manipulation techniques.",
      difficulty: "Easy",
      tier: "Tier 1",
      difficultyColor: "text-success",
      difficultyBg: "bg-success/10",
      difficultyBorder: "border-success/30",
      gradient: "from-success to-teal500",
      iconColor: "text-success",
      iconBg: "bg-success/20",
      borderColor: "border-success500/30",
      technique: "Bit Counting",
      timeComplexity: "O(1)",
      platforms: ["LeetCode #191", "GfG"],
      tags: ["Bit Count", "Hamming Weight", "Binary"]
    },
    {
      name: "Reverse Bits",
      label: "Reverse Bits",
      number: "190",
      subpage: "ReverseBits",
      icon: FlipHorizontal,
      description: "Reverse the bits of a given 32-bit unsigned integer using bit shifting and masking operations.",
      difficulty: "Easy",
      tier: "Tier 1",
      difficultyColor: "text-success",
      difficultyBg: "bg-success/10",
      difficultyBorder: "border-success/30",
      gradient: "from-accent-primary500 to-accent-primary500",
      iconColor: "text-accent-primary",
      iconBg: "bg-accent-primary-light",
      borderColor: "border-accent-primary/30",
      technique: "Bit Reversal",
      timeComplexity: "O(1)",
      platforms: ["LeetCode #190", "GfG"],
      tags: ["Bit Reversal", "Shifting", "Masking"]
    },
    {
      name: "Power of Two",
      label: "Power of Two",
      number: "231",
      subpage: "PowerOfTwo",
      icon: Power,
      description: "Determine if a number is a power of two using bit manipulation properties of powers of two.",
      difficulty: "Easy",
      tier: "Tier 1",
      difficultyColor: "text-success",
      difficultyBg: "bg-success/10",
      difficultyBorder: "border-success/30",
      gradient: "from-orange to-orange",
      iconColor: "text-orange",
      iconBg: "bg-orange/20",
      borderColor: "border-orange500/30",
      technique: "Power Check",
      timeComplexity: "O(1)",
      platforms: ["LeetCode #231", "GfG"],
      tags: ["Power Check", "Bit Mask", "Math"]
    }
  ];

  const filteredAlgorithms = bitManipulationAlgorithms.filter(algo => {
    if (filter === "all") return true;
    if (filter === "easy") return algo.tier === "Tier 1";
    if (filter === "medium") return algo.tier === "Tier 2";
    if (filter === "hard") return algo.tier === "Tier 3";
    return true;
  });

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <header className="text-center mb-16 mt-8 relative">
        <div className="absolute top-0 left-1/3 w-64 h-64 bg-teal/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
        <div className="absolute top-10 right-1/3 w-80 h-80 bg-teal/10 rounded-full blur-3xl animate-pulse-slow-delayed pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-5 mb-6">
            <div className="relative">
              <Binary className="h-14 sm:h-16 w-14 sm:w-16 text-teal animated-icon" />
              <Zap className="h-5 w-5 text-teal300 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal400 via-teal-400 to-accent-primary500 animated-gradient">
              Bit Manipulation
            </h1>
          </div>

          <p className="text-lg sm:text-xl text-theme-secondary mt-6 max-w-3xl mx-auto leading-relaxed px-4">
            Master classic Bit Manipulation problems with techniques like{" "}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal400 to-teal400">
              XOR accumulation
            </span>{" "}
            and{" "}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple400 to-accent-primary400">
              bit masking & shifts.
            </span>
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-8 px-4">
            <div className="px-4 py-2 bg-gradient-to-r from-teal500/10 to-teal500/10 rounded-full border border-teal500/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Code2 className="h-3.5 w-3.5 text-teal" />
                <span className="text-xs font-medium text-theme-secondary">
                  {bitManipulationAlgorithms.length} Problems
                </span>
              </div>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-accent-primary500/10 to-purple500/10 rounded-full border border-accent-primary/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-accent-primary" />
                <span className="text-xs font-medium text-theme-secondary">
                  Multiple Techniques
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
              ? "bg-teal/20 border-teal500/50 text-teal300"
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
              key={algo.subpage}
              onClick={() => navigate(algo.subpage)}
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
                  
                  {/* ✅ Add the StarButton here */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <StarButton problemId={algo.subpage} />
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
          <TrendingUp className="h-4 w-4 text-teal" />
          <span className="text-sm text-theme-tertiary">
            More Bit Manipulation problems coming soon
          </span>
        </div>
      </div>
    </div>
  );
};

const BitPage = ({ navigate: parentNavigate, initialPage = null }) => {
  const [page, setPage] = useState(initialPage || "home");
  const navigate = (newPage) => setPage(newPage);

  const renderPage = () => {
    switch (page) {
      case "SingleNumber": 
        return <SingleNumberVisualizer navigate={navigate} />;
      case "NumberOf1Bits": 
        return <NumberOf1Bits navigate={navigate} />;
      case "CountingBits": 
        return <CountingBits navigate={navigate} />;
      case "ReverseBits": 
        return <ReverseBits navigate={navigate} />;
      case "PowerOfTwo": 
        return <PowerOfTwo navigate={navigate} />;
      case "home":
      default:
        return <AlgorithmList navigate={navigate} />;
    }
  };

  const PageWrapper = ({ children }) => (
    <div className="bg-theme-primary text-theme-primary min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teallight rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-primary/10 rounded-full blur-3xl animate-pulse-slow" />
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
          filter: drop-shadow(0 0 20px rgba(34, 211, 238, 0.6)); 
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
              <Binary className="h-5 w-5 text-teal" />
              <span className="text-sm font-semibold text-theme-secondary">
                Bit Manipulation
              </span>
            </div>
          </div>
        </nav>
      )}

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

export default BitPage;