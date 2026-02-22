import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Layers } from "lucide-react";
import topics from "../data/topics";
import { problems as PROBLEM_CATALOG } from "../search/catalog";
import { topicConfig, getTopicByKey } from "../routes/config";
import "./HomePage.css";
import TopicPixelCard from "../components/TopicPixelCard";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";

const TopicGrid = () => (
  <div className="category-grid">
    {topics.map((topic) => (
      <TopicPixelCard key={topic.name} topic={topic} />
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
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={onSubmit} className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => {
            onQueryChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search problems or topics..."
          className="h-12 pl-11 pr-10 text-sm rounded-xl border-border bg-card shadow-sm focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Search problems or topics"
        />
        {query && (
          <button
            type="button"
            onClick={() => { onQueryChange(""); setOpen(false); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {open && query && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-card border border-border rounded-xl shadow-lg overflow-hidden max-h-80 overflow-y-auto z-50" role="listbox">
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No matches found for "<span className="font-medium text-foreground">{query}</span>"
            </div>
          ) : (
            <div className="py-1">
              {results.map((item) => (
                <button
                  key={`${item.type}-${item.label}`}
                  type="button"
                  className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-accent transition-colors"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => onSelect(item)}
                >
                  <Badge variant={item.type === "problem" ? "secondary" : "outline"} className="text-[10px] uppercase tracking-wider shrink-0">
                    {item.type === "problem" ? "Problem" : "Topic"}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.label}</p>
                    {item.type === "problem" && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {item.topic}
                        {item.platforms?.length ? ` · ${item.platforms.join(", ")}` : ""}
                      </p>
                    )}
                    {item.type === "topic" && (
                      <p className="text-xs text-muted-foreground mt-0.5">{item.topic}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TopicsPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const searchIndex = useMemo(() => {
    const topicItems = topics.map((topic) => {
      const config = getTopicByKey(topic.page);
      return {
        type: "topic",
        label: topic.name,
        topic: topic.page,
        path: config?.path || `/${topic.page.toLowerCase()}`,
        keywords: [topic.name.toLowerCase()],
      };
    });

    const problemItems = PROBLEM_CATALOG
      .filter((problem) => problem.topic && problem.subpage)
      .map((problem) => {
        const config = getTopicByKey(problem.topic);
        return {
          type: "problem",
          ...problem,
          topicPath: config?.path || `/${problem.topic.toLowerCase()}`,
        };
      });

    return [...topicItems, ...problemItems];
  }, []);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];

    const tokens = term.split(/\s+/);
    const matches = searchIndex.filter((item) => {
      const haystack = [
        item.label?.toLowerCase?.() || "",
        item.topic?.toLowerCase?.() || "",
        ...(item.keywords || []),
      ].join(" ");
      return tokens.every((token) => haystack.includes(token));
    });

    return matches.slice(0, 10);
  }, [query, searchIndex]);

  const handleSelect = (item) => {
    if (item.type === "topic") {
      navigate(item.path);
    } else {
      navigate(`${item.topicPath}/${item.subpage}`);
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
    <div className="relative min-h-screen w-screen bg-background pt-24 md:pt-28">
      <div className="home-content">
        {/* ── Hero ── */}
        <section className="flex flex-col items-center gap-4 pt-4 pb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border text-xs font-medium text-muted-foreground">
            <Layers className="h-3 w-3" />
            {topics.length} topics available
          </div>
          <h1 className="font-zentry font-black uppercase text-3xl sm:text-5xl md:text-6xl text-foreground text-center tracking-tight">
            Expl<b className="special-font">o</b>re Topics
          </h1>
          <p className="max-w-lg text-center text-muted-foreground text-sm sm:text-base leading-relaxed">
            Pick a topic and dive into interactive algorithm visualizations.
          </p>
        </section>

        {/* ── Search ── */}
        <section className="pb-2">
          <SearchBar
            query={query}
            onQueryChange={setQuery}
            results={results}
            onSelect={handleSelect}
            open={open}
            setOpen={setOpen}
            onSubmit={handleSubmit}
          />
        </section>

        {/* ── Topic Grid ── */}
        <section>
          <TopicGrid />
        </section>
      </div>
    </div>
  );
};

export default TopicsPage;
