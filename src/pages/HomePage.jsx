import React, { useMemo, useState } from "react";
import { SearchCode } from "lucide-react";
import Footer from "../components/Footer.jsx";
import { CardSpotlight } from "../components/ui/card-spotlight.jsx";
import categories from "../data/categories";
import { problems as PROBLEM_CATALOG } from "../search/catalog";
import ArrayPage from "./Arrays/Arrays.jsx";
import SlidingWindowsPage from "./SlidingWindows/SlidingWindows.jsx";
import LinkedListPage from "./LinkedList/LinkedList.jsx";
import StackPage from "./Stack/Stack.jsx";
import TreesPage from "./Trees/Trees.jsx";
import HeapsPage from "./Heaps/Heaps.jsx";
import SearchingPage from "./Searching/Searching.jsx";
import DesignPage from "./Design/Design.jsx";
import RecursionPage from "./Recursion/Recursion.jsx";
import SortingPage from "./Sorting/Sorting.jsx";
import PathfindingPage from "./Pathfinding/Pathfinding.jsx";
import QueuePage from "./Queue/Queue.jsx";
import BinarySearchPage from "./BinarySearch/BinarySearch.jsx";
import DPPage from "./DynamicProgramming/DynamicProgramming.jsx";
import GraphsPage from "./Graphs/Graphs.jsx";
import GreedyPage from "./GreedyAlgorithms/Greedy.jsx";
import BacktrackingPage from "./Backtracking/Backtracking.jsx";
import StringPage from "./Strings/Strings.jsx";
import BitPage from "./BitManipulation/BitManipulation.jsx";
import HashingPage from "./Hashing/Hashing.jsx";
import MathsMiscPage from "./MathematicalMiscellaneous/MathematicalMiscellaneous.jsx";
import StarredProblems from "./Starred/StarredProblems.jsx";
import "./HomePage.css";
import CardFlip from "../components/kokonut-ui/card-flip.jsx";

const CategoryCard = ({ category, onSelect }) => {
  const Icon = category.icon;

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(category.page);
    }
  };

  return (
      <CardFlip
        title={category.name}
        subtitle={category.subtitle}
        description={category.description}
        features={category.topics}
        icon={Icon}
        onNavigate={() => onSelect(category.page)}
      ></CardFlip>
  );
};

const CategoryGrid = ({ onSelect }) => (
  <div className="category-grid">
    {categories.map((category) => (
      <CategoryCard
        key={category.name}
        category={category}
        onSelect={onSelect}
      />
    ))}
  </div>
);

const SearchBar = ({
  query,
  onQueryChange,
  results,
  onSelect,
  open,
  setOpen,
  onSubmit,
}) => {
  return (
    <div className="search">
      <form className="search__form" onSubmit={onSubmit}>
        <SearchCode className="search__icon" aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => {
            onQueryChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          placeholder="Search problems or topics"
          className="search__input"
          aria-label="Search problems or topics"
        />
        <button type="submit" className="search__button">
          Search
        </button>
      </form>

      {open && query && (
        <div className="search__panel" role="listbox">
          {results.length === 0 ? (
            <div className="search__empty">No matches yet.</div>
          ) : (
            results.map((item) => (
              <button
                key={`${item.type}-${item.label}`}
                type="button"
                className="search-result"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onSelect(item)}
              >
                <span className="search-result__badge">
                  {item.type === "problem" ? "Problem" : "Category"}
                </span>
                <span>
                  <span className="search-result__label">{item.label}</span>
                  {item.type === "problem" && (
                    <span className="search-result__meta">
                      {item.category}
                      {item.platforms?.length ? ` • ${item.platforms.join(", ")}` : ""}
                    </span>
                  )}
                  {item.type === "category" && (
                    <span className="search-result__meta">{item.category}</span>
                  )}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const AlgorithmHome = ({ navigate }) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const searchIndex = useMemo(() => {
    const categoryItems = categories.map((category) => ({
      type: "category",
      label: category.name,
      category: category.page,
      keywords: [category.name.toLowerCase()],
    }));

    const problemItems = PROBLEM_CATALOG.map((problem) => ({
      type: "problem",
      ...problem,
    })).filter((problem) => problem.category && problem.subpage);

    return [...categoryItems, ...problemItems];
  }, []);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];

    const tokens = term.split(/\s+/);
    const matches = searchIndex.filter((item) => {
      const haystack = [
        item.label?.toLowerCase?.() || "",
        item.category?.toLowerCase?.() || "",
        ...(item.keywords || []),
      ].join(" ");
      return tokens.every((token) => haystack.includes(token));
    });

    return matches.slice(0, 10);
  }, [query, searchIndex]);

  const handleSelect = (item) => {
    if (item.type === "category") {
      navigate(item.category);
    } else {
      navigate({ page: item.category, subpage: item.subpage });
    }
    setOpen(false);
    setQuery("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (results.length > 0) {
      handleSelect(results[0]);
    }
  };

  return (
    <div className="home-shell">
      <div className="home-content">
        <section className="home-hero">
          <span className="home-hero__eyebrow">Interactive algorithm studio</span>
          <h1 className="home-title">AlgoVisualizer</h1>
          <p className="home-lede">
            Master algorithms through clear explanations, interactive walkthroughs, and visual problem guides.
          </p>
        </section>

        <SearchBar
          query={query}
          onQueryChange={setQuery}
          results={results}
          onSelect={handleSelect}
          open={open}
          setOpen={setOpen}
          onSubmit={handleSubmit}
        />

        <section>
          <CategoryGrid onSelect={navigate} />
        </section>

        <CardSpotlight className="home-footnote" color="#475569" radius={260}>
          More categories coming soon. Built with React and vanilla CSS.
        </CardSpotlight>
      </div>
    </div>
  );
};

const PAGE_RENDERERS = {
  Starred: (navigate, initialSubPage) => <StarredProblems navigate={navigate} initialPage={initialSubPage} />,
  Arrays: (navigate, initialSubPage) => <ArrayPage navigate={navigate} initialPage={initialSubPage} />,
  Strings: (navigate, initialSubPage) => <StringPage navigate={navigate} initialPage={initialSubPage} />,
  Hashing: (navigate, initialSubPage) => <HashingPage navigate={navigate} initialPage={initialSubPage} />,
  SlidingWindows: (navigate, initialSubPage) => <SlidingWindowsPage navigate={navigate} initialPage={initialSubPage} />,
  LinkedList: (navigate, initialSubPage) => <LinkedListPage navigate={navigate} initialPage={initialSubPage} />,
  Stack: (navigate, initialSubPage) => <StackPage navigate={navigate} initialPage={initialSubPage} />,
  Sorting: (navigate, initialSubPage) => <SortingPage navigate={navigate} initialPage={initialSubPage} />,
  Searching: (navigate, initialSubPage) => <SearchingPage navigate={navigate} initialPage={initialSubPage} />,
  Trees: (navigate, initialSubPage) => <TreesPage navigate={navigate} initialPage={initialSubPage} />,
  Design: (navigate, initialSubPage) => <DesignPage navigate={navigate} initialPage={initialSubPage} />,
  Queue: (navigate, initialSubPage) => <QueuePage navigate={navigate} initialPage={initialSubPage} />,
  BinarySearch: (navigate, initialSubPage) => <BinarySearchPage navigate={navigate} initialPage={initialSubPage} />,
  Heaps: (navigate, initialSubPage) => <HeapsPage navigate={navigate} initialPage={initialSubPage} />,
  Recursion: (navigate, initialSubPage) => <RecursionPage navigate={navigate} initialPage={initialSubPage} />,
  Pathfinding: (navigate, initialSubPage) => <PathfindingPage navigate={navigate} initialPage={initialSubPage} />,
  Graphs: (navigate, initialSubPage) => <GraphsPage navigate={navigate} initialPage={initialSubPage} />,
  GreedyPage: (navigate, initialSubPage) => <GreedyPage navigate={navigate} initialPage={initialSubPage} />,
  BacktrackingPage: (navigate, initialSubPage) => <BacktrackingPage navigate={navigate} initialPage={initialSubPage} />,
  DynamicProgramming: (navigate, initialSubPage) => <DPPage navigate={navigate} initialPage={initialSubPage} />,
  MathsMiscPage: (navigate, initialSubPage) => <MathsMiscPage navigate={navigate} initialPage={initialSubPage} />,
  BitManipulation: (navigate, initialSubPage) => <BitPage navigate={navigate} initialPage={initialSubPage} />,
};

const HomePage = () => {
  const [page, setPage] = useState("home");
  const [initialSubPage, setInitialSubPage] = useState(null);

  const navigate = (target) => {
    if (typeof target === "string") {
      setPage(target);
      setInitialSubPage(null);
      return;
    }

    if (target && typeof target === "object" && target.page) {
      setPage(target.page);
      setInitialSubPage(target.subpage || null);
    }
  };

  const renderPage = () => {
    if (page === "home") {
      return <AlgorithmHome navigate={navigate} />;
    }

    const renderer = PAGE_RENDERERS[page];
    if (renderer) {
      return renderer(navigate, initialSubPage);
    }

    return <AlgorithmHome navigate={navigate} />;
  };

  return (
    <>
      {renderPage()}
      <Footer />
    </>
  );
};

export default HomePage;
