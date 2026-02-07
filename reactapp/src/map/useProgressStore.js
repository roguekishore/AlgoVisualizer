import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * ============================================
 * DSA CONQUEST MAP - PROGRESS STORE
 * ============================================
 * 
 * This store manages user progress through the 164-problem learning path.
 * All problem data is imported from the unified data source.
 * 
 * Countries = Individual DSA Problems
 * Stages = 27 learning stages (24 main + 3 bonus)
 * Progression: Sequential within stages, stages unlock as you progress
 */

// Import all data from the unified source
import {
  ALL_PROBLEMS,
  STAGES,
  STAGE_ORDER,
  TOPICS,
  ROADMAP_ORDER,
  FULL_ROADMAP,
  ALL_COUNTRY_IDS,
  COUNTRY_NAME_TO_CODE,
  CODE_TO_COUNTRY_NAME,
  PROBLEM_TO_COUNTRY,
  COUNTRY_TO_PROBLEM,
  getProblemById,
  getProblemsByStage,
  getProblemsByTopic,
  getCountryForProblem,
  getProblemForCountry,
  isPlaceholderCountry,
  getLeetCodeUrl,
  getLeetCodeUrlForProblem,
  getVisualizerRoute,
  getNewProblems,
  getProblemsWithVisualizers,
  getProblemsWithLeetCode,
  Difficulty,
  STATS,
} from '../data/dsa-conquest-map';

// Re-export everything from the data source for backward compatibility
export {
  ALL_PROBLEMS,
  STAGES,
  STAGE_ORDER,
  TOPICS,
  ROADMAP_ORDER,
  FULL_ROADMAP,
  ALL_COUNTRY_IDS,
  COUNTRY_NAME_TO_CODE,
  CODE_TO_COUNTRY_NAME,
  PROBLEM_TO_COUNTRY,
  COUNTRY_TO_PROBLEM,
  getProblemById,
  getProblemsByStage,
  getProblemsByTopic,
  getCountryForProblem,
  getProblemForCountry,
  isPlaceholderCountry,
  getLeetCodeUrl,
  getLeetCodeUrlForProblem,
  getVisualizerRoute,
  getNewProblems,
  getProblemsWithVisualizers,
  getProblemsWithLeetCode,
  Difficulty,
  STATS,
};
/**
 * ============================================
 * ZUSTAND STORE
 * ============================================
 */
const useProgressStore = create(
  persist(
    (set, get) => ({
      // State: Array of completed problem IDs
      completedProblems: [],
      
      // Check if a problem is completed
      isProblemCompleted: (problemId) => {
        return get().completedProblems.includes(problemId);
      },
      
      // Check if a problem is unlocked
      // Rule: First problem in each STAGE is ALWAYS unlocked (free stage access)
      // Sequential within stage: must complete previous to unlock next
      isProblemUnlocked: (problemId) => {
        const problem = getProblemById(problemId);
        if (!problem) return false;
        
        // First problem in any stage is always unlocked
        if (problem.order === 1) return true;
        
        // Find previous problem in same stage
        const stageProblems = getProblemsByStage(problem.stage);
        const prevProblem = stageProblems.find(p => p.order === problem.order - 1);
        
        if (!prevProblem) return true;
        
        // Previous must be completed
        return get().completedProblems.includes(prevProblem.id);
      },
      
      // Get problem state: 'locked' | 'available' | 'completed' | 'current'
      getProblemState: (problemId) => {
        const { completedProblems, isProblemUnlocked, getCurrentRoadmapProblem } = get();
        
        if (completedProblems.includes(problemId)) return 'completed';
        
        const currentProblem = getCurrentRoadmapProblem();
        if (currentProblem && currentProblem.id === problemId) return 'current';
        
        if (isProblemUnlocked(problemId)) return 'available';
        
        return 'locked';
      },
      
      // Get the current roadmap problem (first uncompleted in roadmap order)
      getCurrentRoadmapProblem: () => {
        const { completedProblems } = get();
        return FULL_ROADMAP.find(p => !completedProblems.includes(p.id)) || null;
      },
      
      // Get roadmap index
      getRoadmapIndex: () => {
        const { completedProblems } = get();
        const currentProblem = FULL_ROADMAP.find(p => !completedProblems.includes(p.id));
        return currentProblem ? FULL_ROADMAP.indexOf(currentProblem) : FULL_ROADMAP.length;
      },
      
      // Get next problem in roadmap after completing current
      getNextRoadmapProblem: () => {
        const index = get().getRoadmapIndex();
        return FULL_ROADMAP[index + 1] || null;
      },
      
      // Complete a problem
      completeProblem: (problemId) => {
        const { completedProblems, isProblemUnlocked } = get();
        
        // Must be unlocked to complete
        if (!isProblemUnlocked(problemId)) return { success: false, nextProblem: null };
        
        // Already completed
        if (completedProblems.includes(problemId)) return { success: false, nextProblem: null };
        
        // Get next roadmap problem BEFORE updating state
        const currentIndex = FULL_ROADMAP.findIndex(p => p.id === problemId);
        const nextProblem = FULL_ROADMAP[currentIndex + 1] || null;
        
        set({ completedProblems: [...completedProblems, problemId] });
        
        return { success: true, nextProblem };
      },
      
      // Mark all problems in a stage as complete (DEBUG/TESTING)
      markStageComplete: (stage) => {
        const { completedProblems } = get();
        const stageProblems = getProblemsByStage(stage);
        const newCompleted = [...new Set([...completedProblems, ...stageProblems.map(p => p.id)])];
        set({ completedProblems: newCompleted });
      },
      
      // Get stage progress
      getStageProgress: (stage) => {
        const { completedProblems } = get();
        const stageProblems = getProblemsByStage(stage);
        const completed = stageProblems.filter(p => completedProblems.includes(p.id)).length;
        return {
          completed,
          total: stageProblems.length,
          percentage: stageProblems.length > 0 ? Math.round((completed / stageProblems.length) * 100) : 0,
          isComplete: completed === stageProblems.length
        };
      },
      
      // Get topic progress (backward compatibility)
      getTopicProgress: (topic) => {
        const { completedProblems } = get();
        const topicProblems = getProblemsByTopic(topic);
        const completed = topicProblems.filter(p => completedProblems.includes(p.id)).length;
        return {
          completed,
          total: topicProblems.length,
          percentage: topicProblems.length > 0 ? Math.round((completed / topicProblems.length) * 100) : 0,
          isComplete: completed === topicProblems.length
        };
      },
      
      // Get overall progress
      getTotalProgress: () => {
        const { completedProblems } = get();
        return {
          completed: completedProblems.length,
          total: ALL_PROBLEMS.length,
          percentage: Math.round((completedProblems.length / ALL_PROBLEMS.length) * 100)
        };
      },
      
      // Reset all progress
      resetProgress: () => {
        set({ completedProblems: [] });
      },
    }),
    {
      name: 'dsa-conquest-map-progress-v4', // Updated version for 164-problem learning path
    }
  )
);

export default useProgressStore;