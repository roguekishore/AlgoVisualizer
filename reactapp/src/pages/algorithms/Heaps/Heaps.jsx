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
  Target
} from "lucide-react";

// --- Import your specific algorithm visualizer components ---
import Heapify from "./Heapify";
import TopKFrequentVisualizer from "./TopKFrequentVisualizer";
import TaskSchedulerVisualizer from "./TaskScheduler";

// --- ✅ Import the master catalog ---
import { problems as PROBLEM_CATALOG } from '../../../search/catalog';

// ✅ (Optional but Recommended) Default values for visual properties
const defaultVisuals = {
  icon: Layers,
  gradient: "from-theme-elevated to-gray-800",
  borderColor: "border-theme-primary",
  iconBg: "bg-theme-elevated/20",
  iconColor: "text-theme-secondary",
};

const AlgorithmList = ({ navigate }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [filter, setFilter] = useState("all");

  // ✅ Get Heap problems directly from the master catalog
  const heapAlgorithms = PROBLEM_CATALOG.filter(p => p.category === 'Heaps');

  // ❌ The local 'algorithms' array has been DELETED.

  const filteredAlgorithms = heapAlgorithms.filter(algo => {
    // Note: You can re-enable this filter once 'tier' is added to your catalog.js
    if (filter === "all") return true;
    // if (filter === "beginner") return algo.tier === "Tier 1";
    // if (filter === "easy") return algo.tier === "Tier 2";
    return true;
  });

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <header className="text-center mb-16 mt-8 relative">
        <div className="absolute top-0 left-1/3 w-64 h-64 bg-orangelight rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
        <div className="absolute top-10 right-1/3 w-80 h-80 bg-orange/10 rounded-full blur-3xl animate-pulse-slow-delayed pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-5 mb-6">
            <div className="relative">
              <Layers className="h-14 sm:h-16 w-14 sm:w-16 text-orange animated-icon" />
              <Zap className="h-5 w-5 text-warning absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange400 via-amber-400 to-warning400 animated-gradient">
              Heap Algorithms
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-theme-secondary mt-6 max-w-3xl mx-auto leading-relaxed px-4">
            Master heap-based problems with powerful techniques like{" "}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange400 to-orange400">
              priority queues
            </span>{" "}
            and{" "}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-success400 to-success400">
              heap construction
            </span>.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8 px-4">
            <div className="px-4 py-2 bg-gradient-to-r from-orange500/10 to-orange500/10 rounded-full border border-orange/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Code2 className="h-3.5 w-3.5 text-orange" />
                <span className="text-xs font-medium text-theme-secondary">
                  {heapAlgorithms.length} Problems
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
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {/* ... filter buttons ... */}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        {filteredAlgorithms.map((algo, index) => {
          const isHovered = hoveredIndex === index;
          const Icon = algo.icon || defaultVisuals.icon;

          return (
            <div
              key={algo.subpage} // ✅ Use subpage
              onClick={() => navigate(algo.subpage)} // ✅ Use subpage
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="group relative cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${algo.gradient || defaultVisuals.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`}
              />
              <div
                className={`relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm rounded-2xl p-6 border ${algo.borderColor || defaultVisuals.borderColor} transition-all duration-300 transform group-hover:-translate-y-2 group-hover:scale-[1.02] group-hover:shadow-2xl`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 ${algo.iconBg || defaultVisuals.iconBg} rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}
                    >
                      <Icon
                        className={`h-10 w-10 ${isHovered ? "text-theme-primary" : (algo.iconColor || defaultVisuals.iconColor)} transition-colors duration-300`}
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
                        {algo.label} {/* ✅ Use label */}
                      </h2>
                    </div>
                  </div>
                  
                  <div onClick={(e) => e.stopPropagation()}>
                  </div>

                </div>
                <p
                  className={`text-sm leading-relaxed mb-5 transition-colors duration-300 ${isHovered ? "text-theme-secondary" : "text-theme-tertiary"}`}
                >
                  {algo.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(algo.tags || []).map((tag, tagIndex) => (
                    <span key={tagIndex} className="px-2 py-1 bg-theme-elevated/30 rounded text-xs text-theme-secondary border border-theme-primary">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-theme-secondary">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 text-orange" />
                      <span className="text-xs font-medium text-theme-tertiary">{algo.technique}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-accent-primary" />
                      <span className="text-xs font-mono text-theme-tertiary">{algo.timeComplexity}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-wrap gap-1">
                      {(algo.platforms || []).map((platform, platformIndex) => (
                        <span key={platformIndex} className="px-2 py-1 bg-theme-tertiary/50 rounded text-xs text-theme-tertiary border border-theme-primary">{platform}</span>
                      ))}
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
            </div>
          );
        })}
      </div>
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800/80 to-gray-900/80 rounded-full border border-theme-primary backdrop-blur-sm">
          <TrendingUp className="h-4 w-4 text-success" />
          <span className="text-sm text-theme-tertiary">More heap problems coming soon</span>
        </div>
      </div>
    </div>
  );
};

const HeapsPage = ({ navigate: parentNavigate, initialPage = null }) => {
  const [page, setPage] = useState(initialPage || "home");
  const navigate = (newPage) => setPage(newPage);

  const renderPage = () => {
    switch (page) {
      case "Heapify": return <Heapify navigate={navigate} />;
      case "TopKFrequent": return <TopKFrequentVisualizer navigate={navigate} />;
      case "TaskScheduler":
        return <TaskSchedulerVisualizer navigate={navigate} />;
      case "PriorityQueue":
        return <div className="text-center py-20"><div className="text-2xl text-theme-tertiary">Priority Queue Visualizer - Coming Soon</div><button onClick={() => navigate("home")} className="mt-4 px-6 py-2 bg-orange hover:bg-orangehover rounded-lg transition-colors">Back to Problems</button></div>;
      case "KthLargest":
        return <div className="text-center py-20"><div className="text-2xl text-theme-tertiary">Kth Largest Visualizer - Coming Soon</div><button onClick={() => navigate("home")} className="mt-4 px-6 py-2 bg-orange hover:bg-orangehover rounded-lg transition-colors">Back to Problems</button></div>;
        case "home":
      default:
        return <AlgorithmList navigate={navigate} />;
    }
  };

  const PageWrapper = ({ children }) => (
    <div className="bg-theme-primary text-theme-primary min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orangelight rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-warning-light rounded-full blur-3xl animate-pulse-slow" />
      </div>
      <style>{`
        .animated-gradient { background-size: 200% auto; animation: gradient-animation 4s ease-in-out infinite; }
        @keyframes gradient-animation { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .animate-fade-in-up { animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animated-icon { animation: float-rotate 8s ease-in-out infinite; filter: drop-shadow(0 0 20px rgba(249, 115, 22, 0.6)); }
        @keyframes float-rotate { 0%, 100% { transform: translateY(0) rotate(0deg); } 33% { transform: translateY(-8px) rotate(120deg); } 66% { transform: translateY(-4px) rotate(240deg); } }
        .animate-pulse-slow, .animate-pulse-slow-delayed { animation: pulse-slow 4s ease-in-out infinite; animation-delay: var(--animation-delay, 0s); }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } }
        .animate-float, .animate-float-delayed { animation: float 20s ease-in-out infinite; animation-delay: var(--animation-delay, 0s); }
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
            <button
              onClick={() => navigate("home")}
              className="flex items-center gap-2 text-theme-secondary bg-theme-tertiary/80 hover:bg-theme-elevated active:bg-theme-elevated px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 border border-theme-primary hover:border-theme-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Problems
            </button>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-orange" />
              <span className="text-sm font-semibold text-theme-secondary">
                Heap Algorithms
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

export default HeapsPage;