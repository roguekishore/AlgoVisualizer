import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Lock, CheckCircle, Play, RotateCcw, ZoomIn, ZoomOut, Home, MapPin, Bug, ChevronRight, Sparkles } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as Map } from './world.svg';
import useProgressStore, {
  TOPICS,
  ROADMAP_ORDER,
  FULL_ROADMAP,
  COUNTRY_NAME_TO_CODE,
  CODE_TO_COUNTRY_NAME,
  getProblemsByTopic,
  getProblemForCountry,
  getCountryForProblem,
} from './useProgressStore';
import './WorldMap.css';

/**
 * DSA Skill Tree World Map
 * Countries = Individual DSA Problems
 * Topics = Logical Groupings
 * Hybrid progression: Free topic access + Sequential within topics
 */
const WorldMap = () => {
  const navigate = useNavigate();
  const transformRef = useRef(null);
  const mapContainerRef = useRef(null);
  
  // State
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: '' });
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [currentPositionMarker, setCurrentPositionMarker] = useState(null);
  const [isHighRes, setIsHighRes] = useState(false);
  
  // Toggle high resolution mode
  const toggleResolution = useCallback(() => {
    setIsHighRes(prev => !prev);
  }, []);
  
  // Zustand store - subscribe to completedProblems for reactivity
  const completedProblems = useProgressStore((state) => state.completedProblems);
  const {
    completeProblem,
    getProblemState,
    getCurrentRoadmapProblem,
    getRoadmapIndex,
    getTopicProgress,
    getTotalProgress,
    resetProgress,
    markTopicComplete,
  } = useProgressStore();

  /**
   * Get normalized country ID from SVG path element
   */
  const getCountryId = useCallback((path) => {
    // Try id attribute first (e.g., id="US")
    const id = path.getAttribute('id');
    if (id && id.length >= 2 && id.length <= 3) return id;
    
    // Try original class from data attribute (preserved before adding state classes)
    const originalClass = path.dataset.originalClass;
    if (originalClass && COUNTRY_NAME_TO_CODE[originalClass]) {
      return COUNTRY_NAME_TO_CODE[originalClass];
    }
    
    // Try class attribute (e.g., class="Australia")
    const className = path.getAttribute('class');
    if (className && COUNTRY_NAME_TO_CODE[className]) {
      return COUNTRY_NAME_TO_CODE[className];
    }
    
    // Try name attribute
    const name = path.getAttribute('name');
    if (name && COUNTRY_NAME_TO_CODE[name]) {
      return COUNTRY_NAME_TO_CODE[name];
    }
    
    return id || className || null;
  }, []);

  /**
   * Get country center coordinates dynamically from SVG element
   * Returns coordinates in the SVG's actual rendered pixel space
   */
  const getCountryCenter = useCallback((countryId) => {
    const svg = mapContainerRef.current?.querySelector('svg');
    if (!svg) {
      return null;
    }
    
    const paths = svg.querySelectorAll('path');
    let element = null;
    
    // Get the country name from code for class-based lookup
    const countryName = CODE_TO_COUNTRY_NAME[countryId];
    
    // Search all paths for matching country
    for (const path of paths) {
      const pathId = path.getAttribute('id');
      if (pathId === countryId) {
        element = path;
        break;
      }
      
      // Get the original class (data attribute stores original, or use class attribute)
      const originalClass = path.dataset.originalClass || path.getAttribute('class');
      if (originalClass) {
        // Direct match with country name
        if (countryName && originalClass === countryName) {
          element = path;
          break;
        }
        // Check COUNTRY_NAME_TO_CODE mapping
        const mappedCode = COUNTRY_NAME_TO_CODE[originalClass];
        if (mappedCode === countryId) {
          element = path;
          break;
        }
      }
    }
    
    if (!element) {
      return null;
    }
    
    // Get the SVG's viewBox and actual rendered dimensions
    const viewBox = svg.viewBox.baseVal;
    const svgRect = svg.getBoundingClientRect();
    
    // Get element bounding box in SVG coordinates
    const bbox = element.getBBox();
    
    // Calculate center in SVG viewBox coordinates
    const centerX = bbox.x + bbox.width / 2;
    const centerY = bbox.y + bbox.height / 2;
    
    // Scale from viewBox coordinates to actual pixel coordinates
    const scaleX = svgRect.width / viewBox.width;
    const scaleY = svgRect.height / viewBox.height;
    
    return {
      x: centerX * scaleX,
      y: centerY * scaleY,
      // Also return viewBox coords for the marker overlay
      svgX: centerX,
      svgY: centerY
    };
  }, []);

  /**
   * Update current position marker
   */
  const updatePositionMarker = useCallback(() => {
    const currentProblem = getCurrentRoadmapProblem();
    
    if (!currentProblem) {
      setCurrentPositionMarker(null);
      return;
    }
    
    const countryId = getCountryForProblem(currentProblem.id);
    
    if (!countryId) {
      setCurrentPositionMarker(null);
      return;
    }
    
    const coords = getCountryCenter(countryId);
    
    if (!coords) {
      setCurrentPositionMarker(null);
      return;
    }
    
    setCurrentPositionMarker({
      x: coords.svgX,  // Use SVG viewBox coordinates for marker overlay
      y: coords.svgY,
      problem: currentProblem,
      countryId
    });
  }, [getCurrentRoadmapProblem, getCountryCenter]);

  /**
   * Apply CSS class-based styling to SVG paths (much faster than inline styles)
   * Only updates paths that have changed state
   */
  const applyCountryStyles = useCallback(() => {
    const svg = mapContainerRef.current?.querySelector('svg');
    if (!svg) return;

    const paths = svg.querySelectorAll('path');
    
    paths.forEach((path) => {
      // Store original class name if not already stored
      if (!path.dataset.originalClass) {
        const originalClass = path.getAttribute('class');
        if (originalClass) {
          path.dataset.originalClass = originalClass;
        }
      }
      
      const countryId = getCountryId(path);
      if (!countryId) return;
      
      const problem = getProblemForCountry(countryId);
      
      // Remove all state classes first
      path.classList.remove('country-completed', 'country-current', 'country-available', 'country-locked', 'country-placeholder');
      
      if (!problem) {
        path.classList.add('country-placeholder');
        return;
      }
      
      const state = getProblemState(problem.id);
      const topicColor = TOPICS[problem.topic]?.color || '#6366f1';
      
      // Set topic color as CSS variable for this element
      path.style.setProperty('--topic-color', topicColor);
      
      // Add appropriate state class
      path.classList.add(`country-${state}`);
    });
  }, [getCountryId, getProblemState, completedProblems]);

  // Apply styles on initial load and when completedProblems changes
  useEffect(() => {
    // Initial application
    applyCountryStyles();
    
    // Also apply after a short delay to ensure SVG is fully loaded
    const timer = setTimeout(() => {
      applyCountryStyles();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [applyCountryStyles]);

  // Update marker when current problem changes
  useEffect(() => {
    updatePositionMarker();
  }, [completedProblems, updatePositionMarker]);

  // Update marker and styles after SVG loads - use MutationObserver to detect when SVG is ready
  useEffect(() => {
    const checkAndApply = () => {
      const svg = mapContainerRef.current?.querySelector('svg');
      if (svg && svg.querySelectorAll('path').length > 0) {
        applyCountryStyles();
        updatePositionMarker();
        return true;
      }
      return false;
    };

    // Try immediately
    if (checkAndApply()) return;

    // If not ready, try a few more times with increasing delays
    const timers = [
      setTimeout(checkAndApply, 100),
      setTimeout(checkAndApply, 300),
      setTimeout(checkAndApply, 500),
      setTimeout(checkAndApply, 1000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [applyCountryStyles, updatePositionMarker]);

  /**
   * Zoom to a specific country with smooth animation
   */
  const zoomToCountry = useCallback((countryId, scale = 4) => {
    if (!transformRef.current || !mapContainerRef.current) return;
    
    const svg = mapContainerRef.current.querySelector('svg');
    if (!svg) return;
    
    // Find the country element
    const paths = svg.querySelectorAll('path');
    let element = null;
    const countryName = CODE_TO_COUNTRY_NAME[countryId];
    
    for (const path of paths) {
      const pathId = path.getAttribute('id');
      if (pathId === countryId) {
        element = path;
        break;
      }
      const pathClass = path.getAttribute('class');
      if (pathClass && (pathClass === countryName || COUNTRY_NAME_TO_CODE[pathClass] === countryId)) {
        element = path;
        break;
      }
    }
    
    if (!element) return;
    
    // Use zoomToElement which handles all the coordinate math internally
    // Reduced animation time for snappier feel
    transformRef.current.zoomToElement(element, scale, 400, 'easeOut');
  }, []);

  /**
   * Handle map click - country selection
   */
  const handleMapClick = useCallback((e) => {
    const path = e.target.closest('path');
    if (!path) return;

    const countryId = getCountryId(path);
    if (!countryId) return;

    const problem = getProblemForCountry(countryId);
    if (!problem) {
      // Placeholder country
      setTooltip({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        content: '🗺️ This region has no problems yet',
      });
      setTimeout(() => setTooltip(t => ({ ...t, visible: false })), 2000);
      return;
    }

    const state = getProblemState(problem.id);
    
    if (state === 'locked') {
      setTooltip({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        content: '🔒 Complete previous problems in this topic first',
      });
      setTimeout(() => setTooltip(t => ({ ...t, visible: false })), 2000);
      return;
    }

    // Open side panel
    setSelectedProblem({ ...problem, state, countryId });
    setIsOpen(true);
  }, [getCountryId, getProblemState]);

  /**
   * Navigate to problem route
   */
  const goToProblem = useCallback(() => {
    if (!selectedProblem) return;
    navigate(selectedProblem.route);
  }, [selectedProblem, navigate]);

  /**
   * Mark problem as complete and auto-advance
   */
  const markComplete = useCallback(() => {
    if (!selectedProblem) return;
    
    const result = completeProblem(selectedProblem.id);
    
    if (result.success) {
      // If there's a next problem, show it in the side panel and zoom to it
      if (result.nextProblem) {
        const nextCountryId = getCountryForProblem(result.nextProblem.id);
        const nextState = getProblemState(result.nextProblem.id);
        
        // Update side panel to show next problem
        setSelectedProblem({
          ...result.nextProblem,
          state: nextState,
          countryId: nextCountryId
        });
        
        // Zoom to next problem's country
        if (nextCountryId) {
          setTimeout(() => {
            zoomToCountry(nextCountryId, 5);
          }, 300);
        }
      } else {
        // No next problem - mark current as completed and close panel
        setSelectedProblem(prev => prev ? { ...prev, state: 'completed' } : null);
      }
    }
  }, [selectedProblem, completeProblem, getProblemState, zoomToCountry]);

  /**
   * Reset zoom to world view
   */
  const resetZoom = useCallback(() => {
    if (!transformRef.current) return;
    transformRef.current.resetTransform(500, 'easeOut');
  }, []);

  /**
   * Jump to current roadmap position
   */
  const jumpToCurrentProblem = useCallback(() => {
    const currentProblem = getCurrentRoadmapProblem();
    if (!currentProblem) return;
    
    const countryId = getCountryForProblem(currentProblem.id);
    if (countryId) {
      zoomToCountry(countryId, 5);
    }
  }, [getCurrentRoadmapProblem, zoomToCountry]);

  // Get progress data
  const totalProgress = getTotalProgress();
  const roadmapIndex = getRoadmapIndex();
  const currentRoadmapProblem = getCurrentRoadmapProblem();

  return (
    <div className={`skill-tree-wrapper ${isHighRes ? 'high-res-mode' : ''}`}>
      {/* Top Progress Bar */}
      <div className="progress-header">
        <div className="progress-info">
          <h1 className="progress-title">🗺️ DSA Skill Tree</h1>
          <div className="progress-stats">
            <span>{totalProgress.completed}/{totalProgress.total} Problems</span>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${totalProgress.percentage}%` }}
              />
            </div>
            <span>{totalProgress.percentage}%</span>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className={`action-icon-btn ${isHighRes ? 'active' : ''}`}
            onClick={toggleResolution}
            title={isHighRes ? 'Switch to Low Resolution (Better Performance)' : 'Switch to High Resolution (Better Quality)'}
          >
            <Sparkles size={18} />
            <span className="resolution-label">{isHighRes ? 'HD' : 'SD'}</span>
          </button>
          <button 
            className="action-icon-btn" 
            onClick={jumpToCurrentProblem}
            title="Jump to Current Problem"
          >
            <MapPin size={18} />
          </button>
          <button 
            className="action-icon-btn" 
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            title="Debug Panel"
          >
            <Bug size={18} />
          </button>
          <button 
            className="action-icon-btn danger" 
            onClick={resetProgress} 
            title="Reset Progress"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Topic Legend - Scrollable */}
      <div className="topic-legend">
        {ROADMAP_ORDER.map((topicKey) => {
          const topic = TOPICS[topicKey];
          const progress = getTopicProgress(topicKey);
          return (
            <button
              key={topicKey}
              className={`topic-btn ${progress.isComplete ? 'complete' : ''}`}
              style={{ '--topic-color': topic.color }}
              onClick={() => {
                const problems = getProblemsByTopic(topicKey);
                if (problems.length > 0) {
                  const countryId = getCountryForProblem(problems[0].id);
                  if (countryId) zoomToCountry(countryId, 3);
                }
              }}
            >
              <span className="topic-icon">{topic.icon}</span>
              <span className="topic-name">{topic.name}</span>
              <span className="topic-progress">{progress.completed}/{progress.total}</span>
            </button>
          );
        })}
      </div>

      {/* Current Position Indicator */}
      {currentRoadmapProblem && (
        <div className="current-position-indicator" onClick={jumpToCurrentProblem}>
          <MapPin size={16} className="pulse" />
          <span>Next: {currentRoadmapProblem.title}</span>
          <span className="roadmap-index">#{roadmapIndex + 1}</span>
          <ChevronRight size={16} />
        </div>
      )}

      {/* Zoom Controls */}
      <div className="zoom-controls">
        <button onClick={() => transformRef.current?.zoomIn()} title="Zoom In">
          <ZoomIn size={20} />
        </button>
        <button onClick={resetZoom} title="Reset View">
          <Home size={20} />
        </button>
        <button onClick={() => transformRef.current?.zoomOut()} title="Zoom Out">
          <ZoomOut size={20} />
        </button>
      </div>

      {/* Map Container with Zoom/Pan */}
      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={0.5}
        maxScale={10}
        limitToBounds={false}
        centerOnInit={true}
        wheel={{ step: 0.08, smoothStep: 0.004 }}
        panning={{ velocityDisabled: true }}
        doubleClick={{ disabled: true }}
        alignmentAnimation={{ disabled: true }}
        velocityAnimation={{ disabled: true }}
      >
        <TransformComponent
          wrapperStyle={{ width: '100%', height: '100%' }}
          contentStyle={{ width: '100%', height: '100%' }}
        >
          <div
            ref={mapContainerRef}
            className="map-container"
            onClick={handleMapClick}
          >
            <Map className="world-svg" />
            
            {/* Current Position Marker Overlay */}
            {currentPositionMarker && (
              <svg 
                className="position-marker-overlay"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  overflow: 'visible'
                }}
                viewBox="0 0 2000 857"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Pulsing circle */}
                <circle
                  cx={currentPositionMarker.x}
                  cy={currentPositionMarker.y}
                  r="12"
                  fill="rgba(250, 204, 21, 0.3)"
                  className="pulse-ring"
                />
                {/* Inner marker */}
                <circle
                  cx={currentPositionMarker.x}
                  cy={currentPositionMarker.y}
                  r="6"
                  fill="#facc15"
                  stroke="#1e293b"
                  strokeWidth="2"
                />
              </svg>
            )}
          </div>
        </TransformComponent>
      </TransformWrapper>

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="tooltip"
          style={{ left: tooltip.x + 10, top: tooltip.y + 10 }}
        >
          {tooltip.content}
        </div>
      )}

      {/* Debug Panel */}
      {showDebugPanel && (
        <div className="debug-panel">
          <h3>🐛 Debug Panel</h3>
          <p>Mark topics complete for testing:</p>
          <div className="debug-topics">
            {ROADMAP_ORDER.map(topicKey => {
              const topic = TOPICS[topicKey];
              const progress = getTopicProgress(topicKey);
              return (
                <button
                  key={topicKey}
                  className="debug-topic-btn"
                  style={{ '--topic-color': topic.color }}
                  onClick={() => markTopicComplete(topicKey)}
                  disabled={progress.isComplete}
                >
                  {topic.icon} {topic.name}
                  {progress.isComplete && ' ✓'}
                </button>
              );
            })}
          </div>
          <button className="debug-close" onClick={() => setShowDebugPanel(false)}>
            Close
          </button>
        </div>
      )}

      {/* Side Panel */}
      <div className={`side-panel ${isOpen ? 'active' : ''}`}>
        <button className="close-btn" onClick={() => setIsOpen(false)}>
          <X size={24} />
        </button>
        
        {selectedProblem && (
          <div className="panel-content">
            {/* Status Badge */}
            <div className={`status-badge ${selectedProblem.state}`}>
              {selectedProblem.state === 'completed' && <CheckCircle size={16} />}
              {selectedProblem.state === 'current' && <MapPin size={16} />}
              {selectedProblem.state === 'available' && <Play size={16} />}
              {selectedProblem.state === 'locked' && <Lock size={16} />}
              <span>
                {selectedProblem.state === 'current' ? 'Current' : 
                 selectedProblem.state.charAt(0).toUpperCase() + selectedProblem.state.slice(1)}
              </span>
            </div>

            {/* Problem Info */}
            <div className="problem-card">
              <div 
                className="problem-topic"
                style={{ backgroundColor: TOPICS[selectedProblem.topic]?.color }}
              >
                {TOPICS[selectedProblem.topic]?.icon} {TOPICS[selectedProblem.topic]?.name}
              </div>
              <h2 className="problem-title">{selectedProblem.title}</h2>
              <div className="problem-meta">
                <span>Problem #{selectedProblem.order} in topic</span>
                <span>•</span>
                <span>Roadmap #{FULL_ROADMAP.findIndex(p => p.id === selectedProblem.id) + 1}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="panel-actions">
              {(selectedProblem.state === 'available' || selectedProblem.state === 'current') && (
                <>
                  <button className="action-btn primary" onClick={goToProblem}>
                    <Play size={18} />
                    Start Problem
                  </button>
                  <button className="action-btn secondary" onClick={markComplete}>
                    <CheckCircle size={18} />
                    Mark Complete
                  </button>
                </>
              )}
              {selectedProblem.state === 'completed' && (
                <>
                  <button className="action-btn primary" onClick={goToProblem}>
                    <Play size={18} />
                    Review Problem
                  </button>
                  <div className="completed-message">
                    ✨ You've conquered this challenge!
                  </div>
                </>
              )}
            </div>

            {/* Route Info */}
            <div className="route-info">
              <code>{selectedProblem.route}</code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorldMap;
