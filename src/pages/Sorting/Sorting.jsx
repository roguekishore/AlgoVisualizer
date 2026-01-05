import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowDownUp,
  Clock,
} from "lucide-react";

// --- Import your specific sorting algorithm visualizer components ---
import BubbleSortVisualizer from "./BubbleSort";
import MergeSortVisualizer from "./MergeSort";
import QuickSortVisualizer from "./QuickSort";
import InsertionSortVisualizer from "./InsertionSort";
import RadixSortVisualizer from "./RadixSort";
import CountingSortVisualizer from "./CountingSort";
import HeapSortVisualizer from "./HeapSort";
import SelectionSortVisualizer from "./SelectionSort";
import CombSortVisualizer from "./CombSort";
import BucketSortVisualizer from "./BucketSort";
import ShellSortVisualizer from "./ShellSort";
import PancakeSortVisualizer from "./PancakeSort";

// --- ✅ Import the master catalog and CardSpotlight ---
import { problems as PROBLEM_CATALOG } from "../../search/catalog";
import { CardSpotlight } from "../../components/ui/card-spotlight.jsx";
import "../HomePage.css";

// --- AlgorithmList component using CardSpotlight and HomePage styling ---
const AlgorithmList = ({ navigate }) => {
  // ✅ Get Sorting problems directly from the master catalog
  const sortingAlgorithms = PROBLEM_CATALOG.filter(
    (p) => p.category === "Sorting"
  );

  return (
    <div className="home-shell">
      <div className="home-content">
        <section className="home-hero">
          <span className="home-hero__eyebrow">Sorting algorithms</span>
          <h1 className="home-title">Master Sorting Techniques</h1>
          <p className="home-lede">
            Understand how different sorting algorithms work step-by-step. From simple swaps to complex divide-and-conquer strategies.
          </p>
        </section>

        <section>
          <div className="section-header">
            <h2 className="section-header__title">Available Algorithms</h2>
            <p className="section-header__note">
              {sortingAlgorithms.length} sorting algorithms to explore
            </p>
          </div>
          
          <div className="category-grid">
            {sortingAlgorithms.map((algo) => {
              const Icon = algo.icon || ArrowDownUp;
              return (
                <CardSpotlight
                  key={algo.subpage}
                  className="category-card"
                  radius={300}
                  onClick={() => navigate(algo.subpage)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(algo.subpage);
                    }
                  }}
                >
                  <div className="category-card__header z-20 relative">
                    <span className="category-card__icon" aria-hidden="true">
                      <Icon size={22} />
                    </span>
                    <h3 className="category-card__title z-20 relative">{algo.label}</h3>
                  </div>
                  <p className="category-card__description z-20 relative">{algo.description}</p>
                  <div className="category-card__footer z-20 relative flex flex-col gap-2">
                    <div className="flex items-center gap-4 text-xs">
                      <span className="px-2 py-1 rounded text-white/80" style={{
                        backgroundColor: algo.difficultyBg || "var(--color-bg-tertiary)",
                        border: `1px solid var(--color-border-primary)`
                      }}>
                        {algo.difficulty}
                      </span>
                      <span style={{ color: "var(--home-muted)" }}>{algo.technique}</span>
                      <div className="flex items-center gap-1" style={{ color: "var(--home-muted)" }}>
                        <Clock className="h-3 w-3" />
                        <span className="font-mono">{algo.timeComplexity}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1" style={{ color: "var(--home-muted)" }}>
                      <span className="text-xs">Open algorithm</span>
                      <span>→</span>
                    </div>
                  </div>
                </CardSpotlight>
              );
            })}
          </div>
        </section>

        <CardSpotlight className="home-footnote" radius={260}>
          Click on any algorithm to explore its interactive visualization.
        </CardSpotlight>
      </div>
    </div>
  );
};
// --- End of AlgorithmList component ---

const SortingPage = ({ navigate: parentNavigate, initialPage = null }) => {
  const [page, setPage] = useState(initialPage || "home");
  const navigate = (newPage) => setPage(newPage);
  const renderPage = () => {
    switch (page) {
      case "BubbleSort":
        return <BubbleSortVisualizer navigate={navigate} />;
      case "MergeSort":
        return <MergeSortVisualizer navigate={navigate} />;
      case "QuickSort":
        return <QuickSortVisualizer navigate={navigate} />;
      case "InsertionSort":
        return <InsertionSortVisualizer navigate={navigate} />;
      case "RadixSort":
        return <RadixSortVisualizer navigate={navigate} />;
      case "CountingSort":
        return <CountingSortVisualizer navigate={navigate} />;
      case "HeapSort":
        return <HeapSortVisualizer navigate={navigate} />;
      case "SelectionSort":
        return <SelectionSortVisualizer navigate={navigate} />;
      case "CombSort":
        return <CombSortVisualizer navigate={navigate} />;
      case "BucketSort":
        return <BucketSortVisualizer navigate={navigate} />;
      case "ShellSort":
        return <ShellSortVisualizer navigate={navigate} />; // Removed: import is commented out
      case "PancakeSort":
        return <PancakeSortVisualizer navigate={navigate} />; // Removed: import is commented out
      case "home":
      default:
        return <AlgorithmList navigate={navigate} />;
    }
  };
  const PageWrapper = ({ children }) => (
    <div className="bg-theme-primary text-theme-primary min-h-screen relative overflow-hidden">
      <div className="relative z-10">{children}</div>
    </div>
  );
  return (
    <PageWrapper>
      {page !== "home" && (
        <nav style={{ 
          backgroundColor: "var(--home-surface)", 
          borderColor: "var(--home-card-border)"
        }} className="backdrop-blur-xl border-b sticky top-0 z-50 h-16 flex items-center shadow-lg">
          <div className="max-w-7xl px-6 w-full mx-auto flex items-center justify-between">
            <button
              onClick={() => navigate("home")}
              style={{
                backgroundColor: "var(--home-card-hover)",
                color: "var(--home-text)",
                borderColor: "var(--home-card-border)"
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 border cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Problems
            </button>
            <div className="flex items-center gap-2">
              <ArrowDownUp className="h-5 w-5" style={{ color: "var(--home-accent)" }} />
              <span className="text-sm font-semibold" style={{ color: "var(--home-text)" }}>
                Sorting Algorithms
              </span>
            </div>
          </div>
        </nav>
      )}
      {page === "home" && parentNavigate && (
        <nav style={{ 
          backgroundColor: "var(--home-surface)", 
          borderColor: "var(--home-card-border)"
        }} className="backdrop-blur-xl border-b sticky top-0 z-50 h-16 flex items-center shadow-lg">
          <div className="max-w-7xl px-6 w-full mx-auto">
            <button
              onClick={() => parentNavigate("home")}
              style={{
                backgroundColor: "var(--home-card-hover)",
                color: "var(--home-text)",
                borderColor: "var(--home-card-border)"
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 border cursor-pointer"
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

export default SortingPage;
