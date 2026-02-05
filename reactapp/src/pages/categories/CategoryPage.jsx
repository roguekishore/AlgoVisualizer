import React from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, ChevronRight } from "lucide-react";
import { MagicCard } from "../../components/magic-ui/magic-card.jsx";
import { ThemeToggle } from "../../components/theme-toggle.jsx";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../components/ui/card.jsx";
import { problems as PROBLEM_CATALOG } from "../../search/catalog";
import "../HomePage.css";

/**
 * CategoryPage - A reusable template for all algorithm category pages
 * Uses the same styling as HomePage for consistency
 * 
 * @param {Object} props
 * @param {string} props.categoryKey - The category key to filter problems (e.g., "Sorting", "Arrays")
 * @param {string} props.title - Display title for the page
 * @param {string} props.eyebrow - Small text above the title
 * @param {string} props.description - Page description
 * @param {React.ComponentType} props.icon - Lucide icon component
 * @param {string} props.basePath - Base path for algorithm links (e.g., "/sorting")
 */
const CategoryPage = ({ 
  categoryKey, 
  title, 
  eyebrow, 
  description, 
  icon: Icon,
  basePath 
}) => {
  const navigate = useNavigate();
  
  // Get problems for this category from the master catalog
  const algorithms = PROBLEM_CATALOG.filter(
    (p) => p.category === categoryKey
  );

  return (
    <>
      <div className="home-shell">
        {/* Theme Toggle - Fixed position */}
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        
        <div className="home-content">
          {/* Back Navigation */}
          <nav className="category-nav">
            <Link to="/" className="category-nav__back">
              <ArrowLeft className="category-nav__icon" />
              Back to Home
            </Link>
            {/* <div className="category-nav__title">
              {Icon && <Icon className="category-nav__category-icon" />}
              <span>{title}</span>
            </div> */}
          </nav>

          {/* Hero Section - Same as HomePage */}
          <section className="home-hero">
            <span className="home-hero__eyebrow">{eyebrow}</span>
            <h1 className="home-title">{title}</h1>
            <p className="home-lede">{description}</p>
          </section>

          {/* Section Header */}
          <section>
            {/* <div className="section-header">
              <h2 className="section-header__title">Available Algorithms</h2>
              <p className="section-header__note">
                {algorithms.length} {algorithms.length === 1 ? 'algorithm' : 'algorithms'} to explore
              </p>
            </div> */}

            {/* Algorithm Grid - Same as HomePage category grid */}
            <div className="category-grid">
              {algorithms.map((algo) => {
                const AlgoIcon = algo.icon || Icon;
                const gradient = (() => {
                  switch (algo.difficulty) {
                    case "Easy":
                      return {
                        gradientFrom: "#10B981",
                        gradientTo: "#34D399",
                        // gradientColor: "#064e3b",
                      };
                    case "Medium":
                      return {
                        gradientFrom: "#F59E0B",
                        gradientTo: "#FCD34D",
                        // gradientColor: "#92400e",
                      };
                    default:
                      return {
                        gradientFrom: "#EF4444",
                        gradientTo: "#F87171",
                        // gradientColor: "#7f1d1d",
                      };
                  }
                })();
                return (
                  <Card
                    key={algo.subpage}
                    className="border-none p-0 shadow-none bg-card cursor-pointer group/card min-h-[300px] h-full"
                    onClick={() => navigate(`${basePath}/${algo.subpage}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`${basePath}/${algo.subpage}`);
                      }
                    }}
                  >
                    <MagicCard
                      className="h-full flex flex-col"
                      background="bg-card"
                      gradientSize={200}
                      gradientColor={gradient.gradientColor}
                      gradientFrom={gradient.gradientFrom}
                      gradientTo={gradient.gradientTo}
                      // texture="dor"
                      // textureOpacity={100}
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="flex items-center justify-center w-9 h-9 bg-secondary text-foreground">
                            <AlgoIcon size={20} />
                          </span>
                          <CardTitle className="text-base font-semibold text-foreground">
                            {algo.label}
                          </CardTitle>
                        </div>
                        <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                          {algo.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="p-4 pt-2 flex-1">
                        <div className="flex flex-wrap gap-2">
                          {algo.difficulty && (
                            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${
                              algo.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                              algo.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {algo.difficulty}
                            </span>
                          )}
                          {algo.technique && (
                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-purple-500/20 text-purple-400">
                              {algo.technique}
                            </span>
                          )}
                        </div>
                      </CardContent>

                      <CardFooter className="p-4 pt-2 flex items-center justify-between border-t border-border">
                        {algo.timeComplexity ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock size={12} />
                            {algo.timeComplexity}
                          </span>
                        ) : (
                          <span />
                        )}
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground group-hover/card:text-foreground transition-colors">
                          Explore
                          <ChevronRight size={14} className="group-hover/card:translate-x-0.5 transition-transform" />
                        </span>
                      </CardFooter>
                    </MagicCard>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Footnote */}
          <Card className="border-none p-0 shadow-none bg-transparent mt-8">
            {/* <MagicCard
              className="p-6 text-center"
              gradientSize={260}
              gradientColor="#262626"
              gradientFrom="#9E7AFF"
              gradientTo="#FE8BBB"
            > */}
              <p className="text-muted-foreground text-sm">
                Click on any algorithm to explore its interactive visualization.
              </p>
            {/* </MagicCard> */}
          </Card>
        </div>
      </div>
    </>
  );
};

export default CategoryPage;
