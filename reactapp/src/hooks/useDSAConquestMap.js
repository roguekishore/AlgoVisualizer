/**
 * React Hook for DSA Conquest Map
 * Provides easy access to problems with memoization and lazy loading support
 */

import { useMemo, useCallback, lazy, Suspense } from 'react';
import {
  getProblemById,
  getProblemByLeetCode,
  getProblemByCountry,
  getProblemsByStage,
  getProblemsByCategory,
  getProblemsWithVisualizer,
  searchProblems,
  getVisualizerRoute,
  getLeetCodeUrlForProblem,
  getComponentImport,
  stages,
  getStats,
  LEETCODE_BASE_URL,
} from '../data/dsa-conquest-map';

/**
 * Hook for accessing a single problem by ID
 * @param {string} problemId - Problem ID
 * @returns {Object} Problem data and utilities
 */
export function useProblem(problemId) {
  const problem = useMemo(() => getProblemById(problemId), [problemId]);

  const visualizerRoute = useMemo(
    () => (problem ? getVisualizerRoute(problem) : null),
    [problem]
  );

  const leetCodeUrl = useMemo(
    () => (problem ? getLeetCodeUrlForProblem(problem) : null),
    [problem]
  );

  const judgeRoute = useMemo(
    () => (problem?.judgeId ? `/judge/${problem.judgeId}` : null),
    [problem]
  );

  const openLeetCode = useCallback(() => {
    if (leetCodeUrl) {
      window.open(leetCodeUrl, '_blank', 'noopener,noreferrer');
    }
  }, [leetCodeUrl]);

  return {
    problem,
    visualizerRoute,
    leetCodeUrl,
    judgeRoute,
    openLeetCode,
    hasVisualizer: problem?.hasVisualizer ?? false,
    hasLeetCode: !!problem?.lcNumber,
    hasJudge: !!problem?.judgeId,
  };
}

/**
 * Hook for accessing a problem by LeetCode number
 * @param {number} lcNumber - LeetCode problem number
 * @returns {Object} Problem data and utilities
 */
export function useProblemByLeetCode(lcNumber) {
  const problem = useMemo(() => getProblemByLeetCode(lcNumber), [lcNumber]);

  return {
    problem,
    visualizerRoute: problem ? getVisualizerRoute(problem) : null,
    leetCodeUrl: problem ? getLeetCodeUrlForProblem(problem) : null,
  };
}

/**
 * Hook for accessing a problem by country ID (for map gamification)
 * @param {string} countryId - ISO country code
 * @returns {Object} Problem data and utilities
 */
export function useProblemByCountry(countryId) {
  const problem = useMemo(() => getProblemByCountry(countryId), [countryId]);

  return {
    problem,
    visualizerRoute: problem ? getVisualizerRoute(problem) : null,
    leetCodeUrl: problem ? getLeetCodeUrlForProblem(problem) : null,
    stageName: problem?.stageName,
    stageNumber: problem?.stageNumber,
  };
}

/**
 * Hook for accessing all problems in a stage
 * @param {number|string} stageNumber - Stage number or identifier
 * @returns {Object} Stage problems and metadata
 */
export function useStage(stageNumber) {
  const stage = useMemo(
    () => stages.find((s) => s.stage === stageNumber),
    [stageNumber]
  );

  const problems = useMemo(
    () => getProblemsByStage(stageNumber),
    [stageNumber]
  );

  const completedCount = useMemo(() => {
    // This would integrate with your progress store
    return 0; // Placeholder - integrate with useProgressStore
  }, [problems]);

  return {
    stage,
    problems,
    name: stage?.name ?? '',
    goal: stage?.goal ?? '',
    pattern: stage?.pattern ?? '',
    totalProblems: problems.length,
    completedCount,
    progress: problems.length > 0 ? completedCount / problems.length : 0,
  };
}

/**
 * Hook for lazy loading a problem's visualizer component
 * @param {string} problemId - Problem ID
 * @returns {Object} LazyComponent and loading utilities
 */
export function useLazyVisualizer(problemId) {
  const problem = useMemo(() => getProblemById(problemId), [problemId]);

  const LazyComponent = useMemo(() => {
    if (!problem?.hasVisualizer) return null;
    const importFn = getComponentImport(problem);
    if (!importFn) return null;
    return lazy(importFn);
  }, [problem]);

  const renderVisualizer = useCallback(
    (fallback = null) => {
      if (!LazyComponent) return fallback;
      return (
        <Suspense fallback={<div>Loading visualizer...</div>}>
          <LazyComponent />
        </Suspense>
      );
    },
    [LazyComponent]
  );

  return {
    LazyComponent,
    renderVisualizer,
    canRender: !!LazyComponent,
  };
}

/**
 * Hook for searching problems
 * @param {string} query - Search query
 * @param {Object} options - Filter options
 * @returns {Object} Search results
 */
export function useProblemSearch(query, options = {}) {
  const { topic, difficulty, hasVisualizerOnly } = options;

  const results = useMemo(() => {
    let filtered = query ? searchProblems(query) : [];

    if (topic) {
      filtered = filtered.filter((p) => p.topic === topic);
    }

    if (difficulty) {
      filtered = filtered.filter((p) => p.difficulty === difficulty);
    }

    if (hasVisualizerOnly) {
      filtered = filtered.filter((p) => p.hasVisualizer);
    }

    return filtered;
  }, [query, topic, difficulty, hasVisualizerOnly]);

  return {
    results,
    count: results.length,
    isEmpty: results.length === 0,
  };
}

/**
 * Hook for problems by category
 * @param {string} category - Category name
 * @returns {Object} Category problems
 */
export function useProblemsByCategory(category) {
  const problems = useMemo(
    () => getProblemsByCategory(category),
    [category]
  );

  return {
    problems,
    count: problems.length,
  };
}

/**
 * Hook for all stages data (useful for world map)
 * @returns {Object} All stages and statistics
 */
export function useAllStages() {
  const allStages = useMemo(() => stages, []);
  const stats = useMemo(() => getStats(), []);

  const mainStages = useMemo(
    () => allStages.filter((s) => typeof s.stage === 'number'),
    [allStages]
  );

  const bonusStages = useMemo(
    () => allStages.filter((s) => typeof s.stage === 'string'),
    [allStages]
  );

  return {
    stages: allStages,
    mainStages,
    bonusStages,
    stats,
  };
}

/**
 * Hook for URL generation utilities
 * @returns {Object} URL generation functions
 */
export function useURLGenerators() {
  const generateLeetCodeUrl = useCallback((slug) => {
    return `${LEETCODE_BASE_URL}/${slug}`;
  }, []);

  const generateVisualizerUrl = useCallback((category, component) => {
    return `/visualizer/${category}/${component}`;
  }, []);

  const openLeetCode = useCallback((slug) => {
    window.open(generateLeetCodeUrl(slug), '_blank', 'noopener,noreferrer');
  }, [generateLeetCodeUrl]);

  return {
    generateLeetCodeUrl,
    generateVisualizerUrl,
    openLeetCode,
  };
}

/**
 * Hook for getting problems with visualizers only
 * @returns {Object} Problems with visualizers
 */
export function useVisualizerProblems() {
  const problems = useMemo(() => getProblemsWithVisualizer(), []);

  return {
    problems,
    count: problems.length,
  };
}

export default {
  useProblem,
  useProblemByLeetCode,
  useProblemByCountry,
  useStage,
  useLazyVisualizer,
  useProblemSearch,
  useProblemsByCategory,
  useAllStages,
  useURLGenerators,
  useVisualizerProblems,
};
