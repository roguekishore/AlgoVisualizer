import React from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "../../components/theme-toggle.jsx";
import ProblemCard from "../../components/ProblemCard.jsx";
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
      <div className="home-shell pt-24 md:pt-28">
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

            {/* Algorithm List - horizontal row layout */}
            <div className="flex flex-col gap-2.5">
              {algorithms.map((algo, index) => (
                <ProblemCard
                  key={algo.subpage}
                  algo={algo}
                  onClick={() => navigate(`${basePath}/${algo.subpage}`)}
                  fallbackIcon={Icon}
                  index={index}
                />
              ))}
            </div>
          </section>

          {/* Footnote */}
          <div className="mt-8 text-center">
              <p className="text-muted-foreground text-sm">
                Click on any algorithm to explore its interactive visualization.
              </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryPage;
