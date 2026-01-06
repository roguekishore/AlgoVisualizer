// Main component export
export { default as WorldMap } from './WorldMap';
export { default } from './WorldMap';

// Store export
export { default as useProgressStore } from './useProgressStore';

// Data exports
export {
  ALL_PROBLEMS,
  TOPICS,
  ROADMAP_ORDER,
  FULL_ROADMAP,
  ALL_COUNTRY_IDS,
  COUNTRY_NAME_TO_CODE,
  CODE_TO_COUNTRY_NAME,
  PROBLEM_TO_COUNTRY,
  COUNTRY_TO_PROBLEM,
  getProblemById,
  getProblemsByTopic,
  getCountryForProblem,
  getProblemForCountry,
  isPlaceholderCountry,
} from './useProgressStore';
