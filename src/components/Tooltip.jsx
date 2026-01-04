import React, { useState } from "react";

/**
 * Reusable Tooltip component for adding descriptive text to UI elements
 * 
 * @param {React.ReactNode} children - The element to wrap with tooltip
 * @param {string} content - The tooltip text to display
 * @param {string} [position='top'] - Position of tooltip: 'top', 'bottom', 'left', 'right'
 */
const Tooltip = ({ children, content, position = "top" }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Position classes for tooltip
  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
  };

  // Arrow position classes
  const arrowClasses = {
    top: "top-full left-1/2 transform -translate-x-1/2 border-t border-theme-primary",
    bottom: "bottom-full left-1/2 transform -translate-x-1/2 border-b border-theme-primary",
    left: "right-full top-1/2 transform -translate-y-1/2 border-l border-theme-primary",
    right: "left-full top-1/2 transform -translate-y-1/2 border-r border-theme-primary",
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && (
        <div 
          className={`absolute z-50 px-3 py-2 text-sm font-medium text-theme-primary bg-theme-secondary rounded-lg border border-theme-primary shadow-sm whitespace-nowrap transition-opacity duration-200 ${positionClasses[position]}`}
          role="tooltip"
        >
          {content}
          <div 
            className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses[position]}`}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;