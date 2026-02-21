import React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "../../components/theme-toggle.jsx";
import "../HomePage.css";

/**
 * VisualizerLayout - A wrapper component for individual algorithm visualizers
 * Provides consistent navigation and styling
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The visualizer content
 * @param {string} props.title - Algorithm name
 * @param {string} props.categoryName - Category display name
 * @param {string} props.categoryPath - Path back to category page
 * @param {React.ComponentType} props.icon - Lucide icon for the category
 */
const VisualizerLayout = ({ 
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

export default VisualizerLayout;
