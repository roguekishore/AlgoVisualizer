import React, { useState } from "react";
import {
  ArrowLeft,
  RectangleHorizontal,
  ToggleRight,
  Code2,
  Clock,
  TrendingUp,
  Star,
  Zap,
  BarChart3,
  ArrowRight,
  Hash, // Added from HEAD
  ShoppingBasket,
  Target, // Added from HEAD
} from "lucide-react";

// --- Import your specific algorithm visualizer components ---
import MaxConsecutiveOnesIII from "./MaxConsecutiveOnesIII.jsx";
import SlidingWindowMaximum from "./SlidingWindowMaximum.jsx";
import FruitIntoBaskets from "./FruitsIntoBaskets.jsx";
import LongestSubstring from "./LongestSubstring.jsx"; // ✅ Maintainer's new import
import MinimumWindow from "./MinimumWindow.jsx"; // ✅ Maintainer's new import

// --- ✅ Import the master catalog and your StarButton ---
import { problems as PROBLEM_CATALOG } from '../../search/catalog';
import StarButton from '../../components/StarButton';

// ✅ (Optional but Recommended) Default values for visual properties
const defaultVisuals = {
  icon: RectangleHorizontal,
  gradient: "from-theme-elevated to-gray-800",
  borderColor: "border-theme-primary",
  iconBg: "bg-theme-elevated/20",
  iconColor: "text-theme-secondary",
};


const AlgorithmList = ({ navigate }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [filter, setFilter] = useState("all"); // ✅ Keep maintainer's filter state

  // ✅ Get Sliding Window problems directly from the master catalog
  const slidingWindowAlgorithms = PROBLEM_CATALOG.filter(p => p.category === 'SlidingWindows');

  // ❌ The local 'algorithms' array is gone.

  // ✅ Keep maintainer's filter logic, using the catalog data
  const filteredAlgorithms = slidingWindowAlgorithms.filter((algo) => {
    // Note: Add 'tier' property to catalog.js items for this filter to work fully
    if (filter === "all") return true;
    if (filter === "medium") return algo.tier === "Tier 2"; // Assuming "easy" filter was meant for Medium/Tier 2
    if (filter === "hard") return algo.tier === "Tier 3";
    return true;
  });

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <header className="text-center mb-16 mt-8 relative">
        <div className="absolute top-0 left-1/3 w-64 h-64 bg-teal/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
        <div className="absolute top-10 right-1/3 w-80 h-80 bg-accent-primary/10 rounded-full blur-3xl animate-pulse-slow-delayed pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-5 mb-6">
            <div className="relative">
              <RectangleHorizontal className="h-14 sm:h-16 w-14 sm:w-16 text-teal animated-icon" />
              <Zap className="h-5 w-5 text-accent-primary300 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal400 via-sky-400 to-accent-primary400 animated-gradient">
              Sliding Window
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-theme-secondary mt-6 max-w-3xl mx-auto leading-relaxed px-4">
            Master the art of efficiently processing{" "}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal400 to-accent-primary400">contiguous subarrays</span>{" "}
            by maintaining a{" "}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-primary400 to-accent-primary400">dynamic window</span>.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8 px-4">
            <div className="px-4 py-2 bg-gradient-to-r from-teal500/10 to-accent-primary500/10 rounded-full border border-teal500/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Code2 className="h-3.5 w-3.5 text-teal" />
                <span className="text-xs font-medium text-theme-secondary">{slidingWindowAlgorithms.length} Problem{slidingWindowAlgorithms.length > 1 ? "s" : ""}</span>
              </div>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-success500/10 to-success500/10 rounded-full border border-success/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-success" />
                <span className="text-xs font-medium text-theme-secondary">Optimal Solutions</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ✅ Keep maintainer's filter buttons */}
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

      {/* ✅ Keep your card rendering logic using catalog data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${algo.gradient || defaultVisuals.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`}/>
              <div className={`relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm rounded-2xl p-6 border ${algo.borderColor || defaultVisuals.borderColor} transition-all duration-300 transform group-hover:-translate-y-2 group-hover:scale-[1.02] group-hover:shadow-2xl`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 ${algo.iconBg || defaultVisuals.iconBg} rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                      <Icon className={`h-10 w-10 ${isHovered ? "text-theme-primary" : (algo.iconColor || defaultVisuals.iconColor)} transition-colors duration-300`}/>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-theme-muted">#{algo.number}</span>
                        <div className={`px-2 py-0.5 rounded-md text-xs font-bold ${algo.difficultyBg} ${algo.difficultyColor} border ${algo.difficultyBorder}`}>
                          {algo.difficulty}
                        </div>
                        <div className="px-2 py-0.5 bg-theme-elevated/50 rounded-md text-xs text-theme-secondary border border-theme-primary">
                          {algo.tier}
                        </div>
                      </div>
                      <h2 className={`text-xl font-bold transition-colors duration-300 ${isHovered ? "text-theme-primary" : "text-theme-secondary"}`}>{algo.label}</h2>
                    </div>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <StarButton problemId={algo.subpage} />
                  </div>
                </div>
                <p className={`text-sm leading-relaxed mb-5 transition-colors duration-300 ${isHovered ? "text-theme-secondary" : "text-theme-tertiary"}`}>{algo.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(algo.tags || []).map((tag, tagIndex) => ( <span key={tagIndex} className="..."> {tag} </span> ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-theme-secondary">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5"><Star className="h-4 w-4 text-orange" /><span className="text-xs font-medium text-theme-tertiary">{algo.technique}</span></div>
                    <div className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-accent-primary" /><span className="text-xs font-mono text-theme-tertiary">{algo.timeComplexity}</span></div>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="flex flex-wrap gap-1">
                      {(algo.platforms || []).map((platform, platformIndex) => ( <span key={platformIndex} className="..."> {platform} </span> ))}
                    </div>
                    <div className={`transition-all duration-300 ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}>
                      <div className="flex items-center gap-1"><span className="text-xs font-medium text-theme-tertiary">Solve</span><ArrowRight className="h-4 w-4 text-theme-tertiary" /></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {filteredAlgorithms.length === 0 && ( <div className="...">...</div> )}
      <div className="mt-12 text-center"> ... </div>
    </div>
  );
};

const SlidingWindowsPage = ({ navigate: parentNavigate, initialPage = null }) => {
  const [page, setPage] = useState(initialPage || "home");
  const navigate = (newPage) => setPage(newPage);

  const renderPage = () => {
    switch (page) {
      case "MaxConsecutiveOnesIII": return <MaxConsecutiveOnesIII navigate={navigate} />;
      case "SlidingWindowMaximum": return <SlidingWindowMaximum navigate={navigate} />;
      case "LongestSubstring": return <LongestSubstring navigate={navigate} />; // ✅ Keep maintainer's route
      case "MinimumWindow": return <MinimumWindow navigate={navigate} />; // ✅ Keep maintainer's route
      case "FruitIntoBaskets": return <FruitIntoBaskets navigate={navigate} />;
      case "home":
      default:
        return <AlgorithmList navigate={navigate} />;
    }
  };

  const PageWrapper = ({ children }) => (
    <div className="bg-theme-primary text-theme-primary min-h-screen relative overflow-hidden">
        {/* ... Styles and background elements remain the same ... */}
      <div className="relative z-10">{children}</div>
    </div>
  );

  return (
    <PageWrapper>
        {/* ... Navigation remains the same ... */}
      {renderPage()}
    </PageWrapper>
  );
};

export default SlidingWindowsPage;