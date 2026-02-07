/**
 * Example Usage of DSA Conquest Map
 * 
 * This file demonstrates how to use the DSA Conquest Map lookup system
 * in various scenarios.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';

// Direct imports for non-React contexts
import {
  getProblemById,
  getProblemByLeetCode,
  getProblemByCountry,
  getLeetCodeUrl,
  getVisualizerRoute,
  stages,
  getStats,
} from '../data/dsa-conquest-map';

// React hooks for component usage
import {
  useProblem,
  useProblemByCountry,
  useStage,
  useLazyVisualizer,
  useAllStages,
} from '../hooks/useDSAConquestMap';

// =============================================================================
// EXAMPLE 1: Direct lookup (non-React, utility functions)
// =============================================================================

export function directLookupExamples() {
  // Get problem by ID
  const twoSum = getProblemById('two-sum');
  console.log(twoSum);
  // {
  //   id: 'two-sum',
  //   name: 'Two Sum',
  //   lcNumber: 1,
  //   lcSlug: 'two-sum',
  //   category: 'Arrays',
  //   component: 'TwoSum',
  //   hasVisualizer: true,
  //   difficulty: 'Easy',
  //   countryId: 'CN',
  //   tags: ['hashmap', 'two-pointers', 'classic'],
  //   stageNumber: 4,
  //   stageName: 'Two Pointers',
  // }

  // Get LeetCode URL
  const lcUrl = getLeetCodeUrl('two-sum');
  console.log(lcUrl); // 'https://leetcode.com/problems/two-sum'

  // Get problem by LeetCode number
  const problem = getProblemByLeetCode(15);
  console.log(problem?.name); // '3Sum'

  // Get problem by country (for map gamification)
  const countryProblem = getProblemByCountry('JP');
  console.log(countryProblem?.name); // '3Sum' (Japan is mapped to 3Sum)

  // Get visualizer route
  if (twoSum) {
    const route = getVisualizerRoute(twoSum);
    console.log(route); // '/visualizer/Arrays/TwoSum'
  }

  // Get statistics
  const stats = getStats();
  console.log(stats);
  // {
  //   totalProblems: 164,
  //   withVisualizer: 144,
  //   withLeetCode: 115,
  //   ...
  // }
}

// =============================================================================
// EXAMPLE 2: React Component - Problem Card
// =============================================================================

export function ProblemCard({ problemId }) {
  const navigate = useNavigate();
  const {
    problem,
    visualizerRoute,
    leetCodeUrl,
    openLeetCode,
    hasVisualizer,
    hasLeetCode,
  } = useProblem(problemId);

  if (!problem) {
    return <div>Problem not found</div>;
  }

  return (
    <div className="problem-card">
      <h3>{problem.name}</h3>
      <span className={`difficulty-${problem.difficulty.toLowerCase()}`}>
        {problem.difficulty}
      </span>

      <div className="tags">
        {problem.tags.map((tag) => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>

      <div className="actions">
        {hasVisualizer && (
          <button onClick={() => navigate(visualizerRoute)}>
            Open Visualizer
          </button>
        )}

        {hasLeetCode && (
          <button onClick={openLeetCode}>
            Solve on LeetCode #{problem.lcNumber}
          </button>
        )}
      </div>

      <div className="meta">
        <span>Stage {problem.stageNumber}: {problem.stageName}</span>
      </div>
    </div>
  );
}

// =============================================================================
// EXAMPLE 3: Country Click Handler (World Map)
// =============================================================================

export function CountryOnMap({ countryId, onCountryClick }) {
  const { problem, visualizerRoute, leetCodeUrl, stageName } =
    useProblemByCountry(countryId);

  const handleClick = () => {
    if (problem) {
      onCountryClick({
        countryId,
        problem,
        visualizerRoute,
        leetCodeUrl,
      });
    }
  };

  // Country color based on completion status (integrate with progress store)
  const getCountryColor = () => {
    if (!problem) return '#ccc'; // No problem mapped
    // This would integrate with your progress store
    // return problem completed ? 'green' : 'red';
    return problem.hasVisualizer ? '#3b82f6' : '#9ca3af';
  };

  return (
    <path
      id={countryId}
      onClick={handleClick}
      fill={getCountryColor()}
      title={problem?.name}
      style={{ cursor: problem ? 'pointer' : 'default' }}
    />
  );
}

// =============================================================================
// EXAMPLE 4: Stage Progress Display
// =============================================================================

export function StageProgress({ stageNumber }) {
  const { stage, problems, name, goal, pattern, progress, totalProblems } =
    useStage(stageNumber);

  if (!stage) {
    return <div>Stage not found</div>;
  }

  return (
    <div className="stage-progress">
      <h2>Stage {stageNumber}: {name}</h2>
      <p className="goal">{goal}</p>
      <p className="pattern">Pattern: {pattern}</p>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progress * 100}%` }}
        />
        <span>{Math.round(progress * 100)}%</span>
      </div>

      <div className="problems-list">
        {problems.map((problem) => (
          <ProblemCard key={problem.id} problemId={problem.id} />
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// EXAMPLE 5: Lazy Loading Visualizer Component
// =============================================================================

export function VisualizerLoader({ problemId }) {
  const { renderVisualizer, canRender } = useLazyVisualizer(problemId);

  if (!canRender) {
    return (
      <div className="no-visualizer">
        No visualizer available for this problem yet.
      </div>
    );
  }

  return (
    <div className="visualizer-container">
      {renderVisualizer(
        <div className="loading">Loading visualizer...</div>
      )}
    </div>
  );
}

// =============================================================================
// EXAMPLE 6: World Map Overview
// =============================================================================

export function WorldMapOverview() {
  const { stages, mainStages, bonusStages, stats } = useAllStages();

  return (
    <div className="world-map-overview">
      <h1>DSA Conquest Map</h1>

      <div className="stats">
        <div>Total Problems: {stats.totalProblems}</div>
        <div>With Visualizer: {stats.withVisualizer}</div>
        <div>LeetCode Problems: {stats.withLeetCode}</div>
        <div>Main Stages: {stats.mainStages}</div>
        <div>Bonus Stages: {stats.bonusStages}</div>
      </div>

      <div className="main-stages">
        <h2>Main Journey ({mainStages.length} stages)</h2>
        {mainStages.map((stage) => (
          <div key={stage.stage} className="stage-item">
            <strong>Stage {stage.stage}:</strong> {stage.name}
            <span className="problem-count">
              ({stage.problems.length} problems)
            </span>
          </div>
        ))}
      </div>

      <div className="bonus-stages">
        <h2>Bonus Stages ({bonusStages.length} stages)</h2>
        {bonusStages.map((stage) => (
          <div key={stage.stage} className="stage-item">
            <strong>{stage.stage}:</strong> {stage.name}
            <span className="problem-count">
              ({stage.problems.length} problems)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// EXAMPLE 7: URL Navigation Helpers
// =============================================================================

export function NavigationExample({ problem }) {
  const navigate = useNavigate();

  // Navigate to visualizer
  const goToVisualizer = () => {
    if (problem.hasVisualizer) {
      navigate(`/visualizer/${problem.category}/${problem.component}`);
    }
  };

  // Open LeetCode in new tab
  const goToLeetCode = () => {
    if (problem.lcSlug) {
      window.open(
        `https://leetcode.com/problems/${problem.lcSlug}`,
        '_blank',
        'noopener,noreferrer'
      );
    }
  };

  return (
    <div>
      <button onClick={goToVisualizer} disabled={!problem.hasVisualizer}>
        Visualize
      </button>
      <button onClick={goToLeetCode} disabled={!problem.lcSlug}>
        LeetCode
      </button>
    </div>
  );
}

export default {
  directLookupExamples,
  ProblemCard,
  CountryOnMap,
  StageProgress,
  VisualizerLoader,
  WorldMapOverview,
  NavigationExample,
};
