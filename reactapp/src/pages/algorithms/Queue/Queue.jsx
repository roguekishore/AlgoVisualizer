import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRightLeft,
  Plus,
  Minus,
  List,
  Zap,
  Code2,
  TrendingUp,
  Container,
  Star,
  Clock,
} from "lucide-react";

// --- Import all queue visualizers ---
import BasicQueueVisualizer from "./BasicQueue";
import CircularQueueVisualizer from "./CircularQueue";
import QueueUsingStacks from "./QueueUsingStacks";

// --- ✅ Import the master catalog ---
import { problems as PROBLEM_CATALOG } from '../../../search/catalog';

// ✅ (Optional but Recommended) Default values for visual properties
const defaultVisuals = {
  icon: ArrowRightLeft,
  gradient: "from-theme-elevated to-gray-800",
  borderColor: "border-theme-primary",
  iconBg: "bg-theme-elevated/20",
  iconColor: "text-theme-secondary",
};


const AlgorithmList = ({ navigate }) => {

  // ✅ Get Queue problems directly from the master catalog
  const queueAlgorithms = PROBLEM_CATALOG.filter(p => p.category === 'Queue');

  // ✅ Group algorithms based on their type for separate sections in the UI
  const dataStructures = queueAlgorithms.filter(a => a.subpage === 'BasicQueue' || a.subpage === 'CircularQueue');
  const leetCodeProblems = queueAlgorithms.filter(a => a.subpage === 'QueueUsingStacks');

  const AlgorithmCard = ({ algo, index }) => {
    const Icon = algo.icon || defaultVisuals.icon;

    return (
      <div
        key={algo.subpage} // ✅ Use subpage
        onClick={() => navigate(algo.subpage)} // ✅ Use subpage
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
                  className={`h-10 w-10 ${algo.iconColor || defaultVisuals.iconColor} group-hover:text-theme-primary transition-colors duration-300`}
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {algo.number !== "N/A" && (
                    <span className="text-xs font-mono text-theme-muted">#{algo.number}</span>
                  )}
                  <div
                    className={`px-2 py-0.5 rounded-md text-xs font-bold ${algo.difficultyBg} ${algo.difficultyColor} border ${algo.difficultyBorder}`}
                  >
                    {algo.difficulty}
                  </div>
                </div>
                <h2 className="text-xl font-bold transition-colors duration-300 text-theme-secondary group-hover:text-theme-primary">
                  {algo.label} {/* ✅ Use label */}
                </h2>
              </div>
            </div>

            <div onClick={(e) => e.stopPropagation()}>
            </div>

          </div>

          <p className="text-sm leading-relaxed mb-5 transition-colors duration-300 text-theme-tertiary group-hover:text-theme-secondary">
            {algo.description}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-theme-secondary">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                {algo.operations ? (
                  <>
                    <Plus className="h-4 w-4 text-success" />
                    <Minus className="h-4 w-4 text-danger" />
                    <span className="text-xs font-medium text-theme-tertiary">{algo.operations}</span>
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4 text-purple" />
                    <span className="text-xs font-medium text-theme-tertiary">{algo.technique}</span>
                  </>
                )}
              </div>
              {algo.timeComplexity && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-accent-primary" />
                  <span className="text-xs font-mono text-theme-tertiary">{algo.timeComplexity}</span>
                </div>
              )}
            </div>
            <div className="transition-all duration-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-theme-tertiary">
                  {algo.technique === "Two Stacks" ? "Solve" : "Visualize"}
                </span>
                <ArrowLeft className="h-4 w-4 text-theme-tertiary rotate-180" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <header className="text-center mb-16 mt-8 relative">
        <div className="absolute top-0 left-1/3 w-64 h-64 bg-pink/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
        <div className="absolute top-10 right-1/3 w-80 h-80 bg-pinklight rounded-full blur-3xl animate-pulse-slow-delayed pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-5 mb-6">
            <div className="relative">
              <ArrowRightLeft className="h-14 sm:h-16 w-14 sm:w-16 text-pink animated-icon" />
              <Zap className="h-5 w-5 text-pink absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink400 via-pink-400 to-fuchsia-400 animated-gradient">
              Queue Algorithms
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-theme-secondary mt-6 max-w-3xl mx-auto leading-relaxed px-4">
            Master the First-In-First-Out principle through interactive
            visualizations and solve real-world problems.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8 px-4">
            <div className="px-4 py-2 bg-gradient-to-r from-pink500/10 to-pink500/10 rounded-full border border-pink500/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Code2 className="h-3.5 w-3.5 text-pink" />
                <span className="text-xs font-medium text-theme-secondary">{queueAlgorithms.length} Algorithms</span>
              </div>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-pink500/10 to-fuchsia-500/10 rounded-full border border-pink/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-pink" />
                <span className="text-xs font-medium text-theme-secondary">Data Structures & Problems</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-theme-secondary mb-6 flex items-center gap-3">
          <div className="h-1 w-12 bg-gradient-to-r from-pink500 to-pink500 rounded"></div>
          Queue Data Structures
          <div className="h-1 flex-1 bg-gradient-to-r from-pink500/50 to-transparent rounded"></div>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dataStructures.map((algo, index) => (
            <AlgorithmCard key={algo.subpage} algo={algo} index={index} />
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-theme-secondary mb-6 flex items-center gap-3">
          <div className="h-1 w-12 bg-gradient-to-r from-accent-primary500 to-accent-primary500 rounded"></div>
          Problems
          <div className="h-1 flex-1 bg-gradient-to-r from-accent-primary500/50 to-transparent rounded"></div>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leetCodeProblems.map((algo, index) => (
            <AlgorithmCard key={algo.subpage} algo={algo} index={dataStructures.length + index} />
          ))}
        </div>
      </div>
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800/80 to-gray-900/80 rounded-full border border-theme-primary backdrop-blur-sm">
          <TrendingUp className="h-4 w-4 text-success" />
          <span className="text-sm text-theme-tertiary">More queue problems coming soon</span>
        </div>
      </div>
    </div>
  );
};

// ✅ This part remains completely the same as before.
const QueuePage = ({ navigate: parentNavigate, initialPage = null }) => {
  const [page, setPage] = useState(initialPage || "home");
  const navigate = (newPage) => setPage(newPage);

  const renderPage = () => {
    switch (page) {
      case "BasicQueue": return <BasicQueueVisualizer navigate={navigate} />;
      case "CircularQueue": return <CircularQueueVisualizer navigate={navigate} />;
      case "QueueUsingStacks": return <QueueUsingStacks navigate={navigate} />;
      case "home":
      default:
        return <AlgorithmList navigate={navigate} />;
    }
  };

  const PageWrapper = ({ children }) => (
    <div className="bg-theme-primary text-theme-primary min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pinklight rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <style>{`
        .animated-gradient { background-size: 200% auto; animation: gradient-animation 4s ease-in-out infinite; }
        @keyframes gradient-animation { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .animate-fade-in-up { animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animated-icon { animation: float-rotate 8s ease-in-out infinite; filter: drop-shadow(0 0 20px rgba(236, 72, 153, 0.45)); }
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
              className="flex items-center gap-2 text-theme-secondary bg-theme-tertiary/80 hover:bg-theme-elevated active:bg-theme-elevated px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 border border-theme-primary hover:border-theme-primary cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Problems
            </button>
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-pink" />
              <span className="text-sm font-semibold text-theme-secondary">Queue Algorithms</span>
            </div>
          </div>
        </nav>
      )}

      {page === "home" && parentNavigate && (
        <nav className="bg-theme-secondary/80 backdrop-blur-xl border-b border-theme-secondary sticky top-0 z-50 h-16 flex items-center shadow-xl">
          <div className="max-w-7xl px-6 w-full mx-auto">
            <button
              onClick={() => parentNavigate("home")}
              className="flex items-center gap-2 text-theme-secondary bg-theme-tertiary/80 cursor-pointer hover:bg-theme-elevated active:bg-theme-elevated px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 border border-theme-primary hover:border-theme-primary"
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

export default QueuePage;