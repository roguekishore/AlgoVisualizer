import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ProblemCard from "../../components/ProblemCard.jsx";
import { problems as PROBLEM_CATALOG } from "../../search/catalog";
import "../HomePage.css";

/**
 * TopicPage - A reusable template for all algorithm topic pages.
 * Lists the individual problems/visualizers belonging to a topic.
 * 
 * @param {Object} props
 * @param {string} props.topicKey - The topic key to filter problems (e.g., "Sorting", "Arrays")
 * @param {string} props.title - Display title for the page
 * @param {string} props.eyebrow - Small text above the title
 * @param {string} props.description - Page description
 * @param {React.ComponentType} props.icon - Lucide icon component
 * @param {string} props.basePath - Base path for problem links (e.g., "/sorting")
 */
const TopicPage = ({ 
  topicKey, 
  title, 
  eyebrow, 
  description, 
  icon: Icon,
  basePath 
}) => {
  const navigate = useNavigate();
  
  // Get problems for this topic from the master catalog
  const algorithms = PROBLEM_CATALOG.filter(
    (p) => p.topic === topicKey
  );

  return (
    <>
      <div className="home-shell pt-24 md:pt-28">
        <div className="home-content">
          {/* Back Navigation */}
          <nav className="category-nav">
            <button onClick={() => navigate(-1)} className="category-nav__back">
              <ArrowLeft className="category-nav__icon" />
              Back
            </button>
          </nav>

          {/* Hero Section */}
          <section className="home-hero">
            <span className="home-hero__eyebrow">{eyebrow}</span>
            <h1 className="home-title">{title}</h1>
            <p className="home-lede">{description}</p>
          </section>

          {/* Problem List */}
          <section>
            <div className="flex flex-col gap-2.5">
              {algorithms.map((algo, index) => (
                <ProblemCard
                  key={algo.subpage || algo.label}
                  algo={algo}
                  onClick={algo.subpage ? () => navigate(`${basePath}/${algo.subpage}`) : undefined}
                  fallbackIcon={Icon}
                  index={index}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default TopicPage;
