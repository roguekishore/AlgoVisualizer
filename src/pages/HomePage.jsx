import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchCode } from "lucide-react";
import { CardSpotlight } from "../components/ui/card-spotlight.jsx";
import categories from "../data/categories";
import { problems as PROBLEM_CATALOG } from "../search/catalog";
import "./HomePage.css";
import CardFlip from "../components/kokonut-ui/card-flip.jsx";

// Map category page names to URL paths
const categoryPathMap = {
  Sorting: "/sorting",
  Arrays: "/arrays",
  BinarySearch: "/binary-search",
  Strings: "/strings",
  Searching: "/searching",
  Hashing: "/hashing",
  LinkedList: "/linked-list",
  Recursion: "/recursion",
  BitManipulation: "/bit-manipulation",
  Stack: "/stack",
  Queue: "/queue",
  SlidingWindows: "/sliding-windows",
  Heaps: "/heaps",
  Trees: "/trees",
  Graphs: "/graphs",
  Pathfinding: "/pathfinding",
  GreedyAlgorithms: "/greedy",
  Backtracking: "/backtracking",
  DynamicProgramming: "/dynamic-programming",
  Design: "/design",
  MathematicalMiscellaneous: "/maths-misc",
  Starred: "/starred",
};

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
      const categoryPath = categoryPathMap[item.category] || `/${item.category.toLowerCase()}`;
      navigate(categoryPath);
    } else {
      // Navigate to specific algorithm
      const categoryPath = categoryPathMap[item.category] || `/${item.category.toLowerCase()}`;
      const subpagePath = item.subpage.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
      navigate(`${categoryPath}/${subpagePath}`);
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
          <CategoryGrid onSelect={(categoryPage) => {
            const path = categoryPathMap[categoryPage] || `/${categoryPage.toLowerCase()}`;
            navigate(path);
          }} />
        </section>

        <CardSpotlight className="home-footnote" color="#475569" radius={260}>
          More categories coming soon. Built with React and vanilla CSS.
        </CardSpotlight>
      </div>
    </div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();

  return <AlgorithmHome navigate={navigate} />;
};

export default HomePage;
