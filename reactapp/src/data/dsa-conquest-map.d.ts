/**
 * TypeScript Type Definitions for DSA Conquest Map
 * Provides type safety and IDE autocompletion
 */

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type ProblemStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed_visualizer'
  | 'completed_leetcode'
  | 'completed_both';

export interface Problem {
  /** Unique identifier (kebab-case) */
  id: string;
  /** Display name */
  name: string;
  /** LeetCode problem number (null if not from LC) */
  lcNumber: number | null;
  /** LeetCode URL slug for URL generation */
  lcSlug: string | null;
  /** Category folder name for component loading */
  category: string | null;
  /** Component file name (without extension) */
  component: string | null;
  /** Whether a visualizer component exists */
  hasVisualizer: boolean;
  /** Problem difficulty */
  difficulty: Difficulty;
  /** Mapped country/region ID for gamification */
  countryId: string | null;
  /** Searchable tags */
  tags: string[];
  /** Whether this is a newly added problem */
  isNew?: boolean;
  /** Additional notes */
  note?: string;
}

export interface ProblemWithStage extends Problem {
  stageNumber: number | string;
  stageName: string;
  stagePattern?: string;
}

export interface Stage {
  /** Stage number or identifier (e.g., 1, 2, "Bonus A") */
  stage: number | string;
  /** Stage display name */
  name: string;
  /** Learning objective */
  goal: string;
  /** Core pattern being taught */
  pattern: string;
  /** Region identifier for gamification */
  countryRegion?: string;
  /** Problems in this stage */
  problems: Problem[];
}

export interface Category {
  folder: string;
  color: string;
}

export interface Stats {
  totalProblems: number;
  withVisualizer: number;
  withLeetCode: number;
  withoutVisualizer: number;
  newProblems: number;
  totalStages: number;
  mainStages: number;
  bonusStages: number;
}

// Function signatures
export declare const LEETCODE_BASE_URL: string;
export declare const VISUALIZER_BASE_PATH: string;

export declare const Difficulty: {
  EASY: 'Easy';
  MEDIUM: 'Medium';
  HARD: 'Hard';
};

export declare const ProblemStatus: {
  NOT_STARTED: 'not_started';
  IN_PROGRESS: 'in_progress';
  COMPLETED_VISUALIZER: 'completed_visualizer';
  COMPLETED_LEETCODE: 'completed_leetcode';
  COMPLETED_BOTH: 'completed_both';
};

export declare const categories: Record<string, Category>;
export declare const stages: Stage[];

// Lookup maps
export declare const problemById: Map<string, ProblemWithStage>;
export declare const problemByLeetCode: Map<number, ProblemWithStage>;
export declare const problemByCountry: Map<string, ProblemWithStage>;

// Getter functions
export declare function getLeetCodeUrl(slug: string): string | null;
export declare function getVisualizerPath(category: string, subpage: string): string;
export declare function getProblemById(id: string): ProblemWithStage | undefined;
export declare function getProblemByLeetCode(lcNumber: number): ProblemWithStage | undefined;
export declare function getProblemByCountry(countryId: string): ProblemWithStage | undefined;
export declare function getProblemsByStage(stageNumber: number | string): Problem[];
export declare function getProblemsByCategory(category: string): ProblemWithStage[];
export declare function getProblemsWithVisualizer(): ProblemWithStage[];
export declare function searchProblems(query: string): ProblemWithStage[];
export declare function getComponentImport(problem: Problem): (() => Promise<any>) | null;
export declare function getVisualizerRoute(problem: Problem): string | null;
export declare function getLeetCodeUrlForProblem(problem: Problem): string | null;
export declare function getStats(): Stats;

declare const DSAConquestMap: {
  stages: Stage[];
  categories: Record<string, Category>;
  problemById: Map<string, ProblemWithStage>;
  problemByLeetCode: Map<number, ProblemWithStage>;
  problemByCountry: Map<string, ProblemWithStage>;
  getProblemById: typeof getProblemById;
  getProblemByLeetCode: typeof getProblemByLeetCode;
  getProblemByCountry: typeof getProblemByCountry;
  getProblemsByStage: typeof getProblemsByStage;
  getProblemsByCategory: typeof getProblemsByCategory;
  getProblemsWithVisualizer: typeof getProblemsWithVisualizer;
  searchProblems: typeof searchProblems;
  getLeetCodeUrl: typeof getLeetCodeUrl;
  getVisualizerPath: typeof getVisualizerPath;
  getVisualizerRoute: typeof getVisualizerRoute;
  getLeetCodeUrlForProblem: typeof getLeetCodeUrlForProblem;
  getComponentImport: typeof getComponentImport;
  LEETCODE_BASE_URL: string;
  VISUALIZER_BASE_PATH: string;
  Difficulty: typeof Difficulty;
  ProblemStatus: typeof ProblemStatus;
  getStats: typeof getStats;
};

export default DSAConquestMap;
