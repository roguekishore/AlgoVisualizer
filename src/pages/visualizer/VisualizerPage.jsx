 import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "../HomePage.css";

/**
 * VisualizerWrapper - A HOC that wraps algorithm visualizers with consistent navigation
 * 
 * @param {React.ComponentType} VisualizerComponent - The visualizer component to wrap
 * @param {Object} config - Configuration object
 * @param {string} config.title - Algorithm name
 * @param {string} config.categoryName - Category display name  
 * @param {string} config.categoryPath - Path back to category page
 * @param {React.ComponentType} config.icon - Lucide icon for the category
 */
export function withVisualizerLayout(VisualizerComponent, config) {
  const { title, categoryName, categoryPath, icon: Icon } = config;
  
  return function WrappedVisualizer(props) {
    return (
      <>
        <div className="visualizer-shell">
          <nav className="visualizer-nav">
            <Link to={categoryPath} className="visualizer-nav__back">
              <ArrowLeft size={16} />
              Back to {categoryName}
            </Link>
            <div className="visualizer-nav__title">
              {Icon && <Icon size={20} />}
              <span>{title}</span>
            </div>
          </nav>
          <div className="visualizer-content">
            <VisualizerComponent {...props} />
          </div>
        </div>
      </>
    );
  };
}

/**
 * VisualizerPage - A wrapper component for algorithm visualizers
 * Use this in route definitions
 */
const VisualizerPage = ({ 
  children, 
  title, 
  categoryName, 
  categoryPath, 
  icon: Icon 
}) => {
  return (
    <>
      <div className="visualizer-shell">
        <nav className="visualizer-nav">
          <Link to={categoryPath} className="visualizer-nav__back">
            <ArrowLeft size={16} />
            Back to {categoryName}
          </Link>
          <div className="visualizer-nav__title">
            {Icon && <Icon size={20} />}
            <span>{title}</span>
          </div>
        </nav>
        <div className="visualizer-content">
          {children}
        </div>
      </div>
    </>
  );
};

export default VisualizerPage;
