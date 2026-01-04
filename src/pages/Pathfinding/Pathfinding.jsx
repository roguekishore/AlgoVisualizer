import React, { useState } from "react";
import {
  ArrowLeft,
  Navigation,
  Code2,
  Clock,
  TrendingUp,
  Star,
  Zap,
  MapPin,
  Grid,
  Target
} from "lucide-react";

// --- Import your specific algorithm visualizer components ---
import RatInMaze from "./RatInMaze.jsx";
import BFSVisualizer from "./BFS";
import { FloodFill } from "./FloodFill.jsx";
import { ColorIslands } from "./ColorIslands.jsx";
import AStarVisualizer from "./AStar.jsx";

// --- ✅ Import the master catalog and your StarButton ---
import { problems as PROBLEM_CATALOG } from '../../search/catalog';
import StarButton from '../../components/StarButton';

// ✅ (Optional but Recommended) Default values for visual properties
const defaultVisuals = {
  icon: Navigation,
  gradient: "from-theme-elevated to-gray-800",
  borderColor: "border-theme-primary",
  iconBg: "bg-theme-elevated/20",
  iconColor: "text-theme-secondary",
};

const AlgorithmList = ({ navigate }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // ✅ Get Pathfinding problems directly from the master catalog
  const pathfindingAlgorithms = PROBLEM_CATALOG.filter(p => p.category === 'Pathfinding');

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <header className="text-center mb-16 mt-8 relative">
        <div className="absolute top-0 left-1/3 w-64 h-64 bg-purplelight rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
        <div className="absolute top-10 right-1/3 w-80 h-80 bg-pinklight rounded-full blur-3xl animate-pulse-slow-delayed pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-5 mb-6">
            <div className="relative">
              <Navigation className="h-14 sm:h-16 w-14 sm:w-16 text-purple animated-icon" />
              <Zap className="h-5 w-5 text-pink absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple400 via-pink-400 to-pink400 animated-gradient">
              Pathfinding Algorithms
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-theme-secondary mt-6 max-w-3xl mx-auto leading-relaxed px-4">
            Navigate through complex mazes and grids. Visualize different
            pathfinding strategies including{" "}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-danger400 to-pink400">
              A* (A-Star)
            </span>
            ,{" "}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple400 to-pink400">
              BFS
            </span>{" "}
            and{" "}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink400 to-pink400">
              DFS
            </span>.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8 px-4">
            <div className="px-4 py-2 bg-gradient-to-r from-purple500/10 to-pink500/10 rounded-full border border-purple/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Code2 className="h-3.5 w-3.5 text-purple" />
                <span className="text-xs font-medium text-theme-secondary">
                  {pathfindingAlgorithms.length} Problem(s)
                </span>
              </div>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-accent-primary500/10 to-teal500/10 rounded-full border border-accent-primary/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-accent-primary" />
                <span className="text-xs font-medium text-theme-secondary">
                  Graph Traversal
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        {pathfindingAlgorithms.map((algo, index) => {
          const isHovered = hoveredIndex === index;
          const Icon = algo.icon || defaultVisuals.icon;
          return (
            <div
              key={algo.subpage}
              onClick={() => navigate(algo.subpage)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`group relative overflow-hidden rounded-2xl border cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl ${algo.borderColor || defaultVisuals.borderColor} ${isHovered ? "border-opacity-60" : "border-opacity-30"} ${isHovered ? "shadow-2xl shadow-purple/25" : ""}`}
              style={{ background: `linear-gradient(135deg, rgba(147, 51, 234, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-gray-800/80 backdrop-blur-sm" />
              <div className="relative z-10 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${algo.iconBg || defaultVisuals.iconBg} ${algo.borderColor || defaultVisuals.borderColor} border transition-all duration-300 ${isHovered ? "scale-110" : ""}`}>
                      <Icon className={`h-6 w-6 ${algo.iconColor || defaultVisuals.iconColor}`} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            {algo.number !== "N/A" && (
                              <span className="text-xs font-mono text-theme-muted">#{algo.number}</span>
                            )}
                            <div className={`px-2 py-0.5 rounded-md text-xs font-bold ${algo.difficultyBg} ${algo.difficultyColor} border ${algo.difficultyBorder}`}>
                              {algo.difficulty}
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-theme-primary mb-1 group-hover:text-purple transition-colors">
                            {algo.label}
                        </h3>
                    </div>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <StarButton problemId={algo.subpage} />
                  </div>
                </div>
                <p className="text-theme-secondary text-sm leading-relaxed mb-4">
                  {algo.description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-theme-secondary/50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Code2 className="h-3.5 w-3.5 text-purple" />
                      <span className="text-xs text-theme-tertiary">{algo.technique}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-pink" />
                      <span className="text-xs text-theme-tertiary">{algo.timeComplexity}</span>
                    </div>
                  </div>
                  <span className="text-xs text-purple font-medium group-hover:text-purple transition-colors">
                    Visualize →
                  </span>
                </div>
              </div>
              <div className={`absolute inset-0 bg-gradient-to-br ${algo.gradient || defaultVisuals.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
            </div>
          );
        })}
      </div>
      <div className="mt-16 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple500/10 to-pink500/10 rounded-full border border-purple/30 backdrop-blur-sm">
          <Navigation className="h-4 w-4 text-purple" />
          <span className="text-sm text-theme-secondary">
            More pathfinding algorithms coming soon!
          </span>
        </div>
      </div>
    </div>
  );
};

const PathfindingPage = ({ navigate: parentNavigate, initialPage = null }) => {
  const [page, setPage] = useState(initialPage || "home");
  const navigate = (newPage) => setPage(newPage);

  const renderPage = () => {
    switch (page) {
      case "AStar":
        return <AStarVisualizer navigate={navigate} />;
      case "RatInMaze":
        return <RatInMaze navigate={navigate} />;
      case "BFS":
        return <BFSVisualizer navigate={navigate} />;
      case "FloodFill":
        return <FloodFill navigate={navigate} />;
      case "ColorIslands":
        return <ColorIslands navigate={navigate} />;
      case "home":
      default:
        return <AlgorithmList navigate={navigate} />;
    }
  };

  const PageWrapper = ({ children }) => (
    // PageWrapper remains the same
    <div className="bg-theme-primary text-theme-primary min-h-screen relative overflow-hidden"> ... </div>
  );

  return (
    // Navigation and rendering logic remains the same
    <PageWrapper> ... </PageWrapper>
  );
};

export default PathfindingPage;