import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "../HomePage.css";

/**
 * VisualizerLayout - A wrapper component for individual algorithm visualizers
 * Provides consistent navigation and styling.
 * Uses navigate(-1) so the back button returns to wherever the user came from
 * (topic page, map, search, etc.).
 */
const VisualizerLayout = ({ 
  children, 
  title, 
  icon: Icon 
}) => {
  const navigate = useNavigate();

  return (
    <div className="visualizer-shell">
      <nav className="visualizer-nav">
        <button onClick={() => navigate(-1)} className="visualizer-nav__back">
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="visualizer-nav__title">
          {Icon && <Icon size={20} />}
          <span>{title}</span>
        </div>
      </nav>
      <div className="visualizer-content">
        {children}
      </div>
    </div>
  );
};

export default VisualizerLayout;
