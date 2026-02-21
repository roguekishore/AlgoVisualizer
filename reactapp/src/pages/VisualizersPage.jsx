import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchCode } from "lucide-react";
import categories from "../data/categories";
import { problems as PROBLEM_CATALOG } from "../search/catalog";
import { categoryConfig, getCategoryByKey } from "../routes/config";
import "./HomePage.css";
import TopicPixelCard from "../components/TopicPixelCard";

const CategoryGrid = () => (
  <div className="category-grid">
    {categories.map((category) => (
      <TopicPixelCard key={category.name} category={category} />
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

const VisualizersPage = () => {
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
    <div className="relative min-h-screen w-screen bg-blue-50 dark:bg-[#0a0a0a] pt-24 md:pt-28">
      <div className="home-content">
        <section className="home-hero">
          <h2 className="font-zentry font-black uppercase text-3xl sm:text-5xl md:text-6xl text-blue-200 dark:text-blue-50 text-center">
            Expl<b className="special-font">o</b>re Topics
          </h2>
          <p className="home-lede text-blue-200/60 dark:text-blue-50/50">
            Pick a category and dive into interactive algorithm visualizations.
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
          <CategoryGrid />
        </section>
      </div>
    </div>
  );
};

export default VisualizersPage;
