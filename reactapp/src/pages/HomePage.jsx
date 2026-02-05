import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { SearchCode, Map } from "lucide-react";
import { CardSpotlight } from "../components/ui/card-spotlight.jsx";
import categories from "../data/categories";
import { problems as PROBLEM_CATALOG } from "../search/catalog";
import { categoryConfig, getCategoryByKey } from "../routes/config";
import "./HomePage.css";
import CardFlip from "../components/kokonut-ui/card-flip.jsx";
import { MagicCard } from "../components/magic-ui/magic-card.jsx";
import { Card } from "../components/ui/card.jsx";
import { CardHeader } from "../components/ui/card.jsx";
import { CardTitle } from "../components/ui/card.jsx";
import { CardDescription } from "../components/ui/card.jsx";
import { CardContent } from "../components/ui/card.jsx";
import { CardFooter } from "../components/ui/card.jsx";

const CategoryCard = ({ category }) => {
  const navigate = useNavigate();
  const Icon = category.icon;
  
  // Get the route path from categoryConfig
  const config = getCategoryByKey(category.page);
  const routePath = config?.path || `/${category.page.toLowerCase()}`;

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigate(routePath);
    }
  };

  return (
    <CardFlip
      title={category.name}
      subtitle={category.subtitle}
      description={category.description}
      features={category.topics}
      icon={Icon}
      onNavigate={() => navigate(routePath)}
    />
  );
};

const CategoryGrid = () => (
  <div className="category-grid">
    {categories.map((category) => (
      <CategoryCard
        key={category.name}
        category={category}
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

const HomePage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const searchIndex = useMemo(() => {
    const categoryItems = categories.map((category) => {
      const config = getCategoryByKey(category.page);
      return {
        type: "category",
        label: category.name,
        category: category.page,
        path: config?.path || `/${category.page.toLowerCase()}`,
        keywords: [category.name.toLowerCase()],
      };
    });

    const problemItems = PROBLEM_CATALOG.map((problem) => {
      const config = getCategoryByKey(problem.category);
      return {
        type: "problem",
        ...problem,
        categoryPath: config?.path || `/${problem.category.toLowerCase()}`,
      };
    }).filter((problem) => problem.category && problem.subpage);

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
      navigate(item.path);
    } else {
      navigate(`${item.categoryPath}/${item.subpage}`);
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
    <>
      <div className="home-shell">
        <div className="home-content">
          <section className="home-hero">
            <span className="home-hero__eyebrow">Interactive algorithm studio</span>
            <h1 className="home-title">AlgoVisualizer</h1>
            <p className="home-lede">
              Master algorithms through clear explanations, interactive walkthroughs, and visual problem guides.
            </p>
            <button
              onClick={() => navigate('/map')}
              className="skill-tree-btn"
            >
              <Map size={18} />
              <span>Open Skill Tree Map</span>
            </button>
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
            <CategoryGrid />
          </section>
        </div>
      </div>
      
    </>
  );
};

export default HomePage;
