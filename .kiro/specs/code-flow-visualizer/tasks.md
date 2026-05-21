# Implementation Plan: Code Flow Visualizer

## Overview

This plan implements the Code Flow Visualizer as a full-stack feature spanning the judge backend (`judge/`, Node + Express) and the React frontend (`reactapp/`). Implementation language is **JavaScript/JSX**, matching the existing stack; property-based tests use **fast-check** (the library named in the design's Testing Strategy).

The work is sequenced bottom-up: backend pure functions first (block tree, event parsing, input tokenizing) since they carry most of the correctness properties and can be tested in isolation, then instrumentation and the tracer orchestrator, then the route wiring, then the frontend service/hook/context, the Monaco highlight engine, the visual components, and finally integration into `JudgePage.jsx`. Each task builds on prior ones and ends wired into the pipeline so no orphaned code remains.

Property-based test sub-tasks (fast-check) are placed next to the pure functions they validate. Backend PBTs target `buildBlockTree`, `parseTraceEvents`, and `tokenizeInput`/`linkConsumedTokens`; frontend PBTs target `resolveBlockAtLine`, `activeBlockIds`, and `useCodeFlow` step clamping.

## Tasks

- [x] 1. Set up backend trace module structure and dependencies
  - [x] 1.1 Add trace dependencies and test tooling
    - Add `tree-sitter`, `tree-sitter-cpp`, `tree-sitter-java` as pinned dependencies and `fast-check` as a dev dependency to `judge/package.json`; add a `test` script and a test runner config
    - _Requirements: 2.5, 3.4_

  - [x] 1.2 Create trace module skeleton (constants and typedefs)
    - Create the `judge/src/trace/` directory and `judge/src/trace/constants.js` exporting `STEP_CAP` (e.g. 10000), `MAX_CODE_SIZE` (64 KB), and `MAX_INPUT_SIZE` (1 MB), reusing the existing `submission.js` limits
    - Define shared JSDoc typedefs (`BlockNode`, `SourceRange`, `TraceStep`, `VarSnapshot`, `InputToken`, `SourceMap`, `TraceResult`, `TraceStatus`) in `judge/src/trace/types.js` for cross-module reference
    - _Requirements: 2.5, 3.4_

- [x] 2. Implement static structural pass (block tree + source map)
  - [x] 2.1 Implement grammar-type mapping and label generation
    - Create `judge/src/trace/structuralPass.js` with `mapGrammarType(language, grammarType)` mapping C++ and Java CST node types to `BlockType` (program, function, loop, conditional, declaration, assignment, call, io, return, block) or null for non-block nodes
    - Implement `makeLabel(type, cstNode, code)` and `rangeOf(cstNode)` producing a 1-based `SourceRange` with `startLine <= endLine`
    - _Requirements: 2.5_

  - [x] 2.2 Implement `buildBlockTree` recursive descent
    - Parse source with the Tree-sitter grammar; throw `ParseError` when no usable tree is produced
    - Recursively visit named children, assigning unique ids, building the nested `BlockNode` tree rooted at a single `program` node (`parentId = null`), and registering each covered line into `sourceMap` outermost → innermost (Algorithm 2)
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 2.3 Write property test for block tree containment
    - **Property 1: Containment** — every non-root block's `sourceRange` is contained within its parent's
    - **Validates: Requirements 2.3**
    - Use a fast-check `BlockNode`-tree generator producing valid nested ranges

  - [x] 2.4 Write property test for unique block ids
    - **Property 2: Unique IDs** — all block ids are unique across the tree
    - **Validates: Requirements 2.2**

  - [x] 2.5 Write unit tests for `buildBlockTree` and `mapGrammarType`
    - Cover each `BlockType` for both C++ and Java; assert tree shape, ranges, single `program` root, and source-map ordering on nested-loop / if-else / call / I/O fixtures
    - _Requirements: 2.1, 2.4, 2.5_

- [x] 3. Implement trace event parsing into steps
  - [x] 3.1 Implement `tokenizeInput` and `parseTraceEvents`
    - Create `judge/src/trace/traceParser.js` with `tokenizeInput(input)` producing `InputToken`s with contiguous indices from 0 and `consumedAtStep = null`
    - Implement `parseTraceEvents(rawEvents, blockTree, stepCap)` (Algorithm 3): split NDJSON, skip blank/malformed/unknown-blockId lines defensively, assign contiguous 0-based indices, track loop iteration counts, compute `vars[].changed`, and store at most `stepCap` steps while counting `totalSteps`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 3.2 Implement `linkConsumedTokens`
    - Link each input token to the step index that read it (steps with `inputConsumed`), leaving unread tokens' `consumedAtStep = null`
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 3.3 Write property test for step contiguity
    - **Property 3: Step contiguity** — `steps[i].index === i` for all i
    - **Validates: Requirements 3.2**
    - Use a fast-check `TraceStep[]`/raw-event generator

  - [x] 3.4 Write property test for referential integrity
    - **Property 4: Referential integrity** — every step's `blockId` exists and its `line` lies within that block's `sourceRange`
    - **Validates: Requirements 3.3**

  - [x] 3.5 Write property test for step cap and truncation honesty
    - **Property 5: Step cap** — `length(steps) <= stepCap` and `truncated <=> totalSteps > stepCap`
    - **Validates: Requirements 3.4**

  - [x] 3.6 Write property test for input tokenization and linking
    - Generated input strings yield contiguous token indices from 0; every consumed token references a valid step index, unread tokens stay null
    - **Validates: Requirements 6.1, 6.2, 6.3**

  - [x] 3.7 Write unit tests for `parseTraceEvents` edge cases
    - Well-formed NDJSON, blank lines, malformed JSON, unknown blockIds, and exact step-cap boundary behavior
    - _Requirements: 3.5, 3.4_

- [x] 4. Checkpoint - backend pure functions
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement instrumentation pass
  - [x] 5.1 Implement `instrument` AST rewrite
    - Create `judge/src/trace/instrumentPass.js` with `instrument(language, code, blockTree)` that injects a trace-emitter helper writing NDJSON to a dedicated channel (file descriptor 3 / trace file), never stdout
    - Emit `{ blockId, line, kind, vars }` at block boundaries and assignments; guard with a global event counter that hard-stops after `stepCap`; return `{ source, probeCount }`
    - _Requirements: 7.1, 7.2, 7.3, 3.4_

  - [x] 5.2 Write output-purity unit test for instrumentation
    - Instrumented C++/Java fixtures still compile and produce stdout identical to the original program for the same input (host mode)
    - **Property 9: Output purity**
    - **Validates: Requirements 7.2**

- [x] 6. Implement tracer orchestrator and executor integration
  - [x] 6.1 Add instrumented execution path to the executor
    - Add a helper (e.g. `executeInstrumented`) in/around `judge/src/executor.js` that compiles and runs the instrumented source in the existing Docker worker pool, captures the trace channel (fd 3 / trace file) separately from stdout, and returns `{ stdout, traceEvents, stderr, exitCode, tle, time, compilationError }`
    - Reuse existing CPU/memory/time limits; introduce no new execution surface
    - _Requirements: 3.1, 7.1, 8.3, 8.4_

  - [x] 6.2 Implement `traceProgram` orchestrator
    - Create `judge/src/tracer.js` implementing `traceProgram(req)` (Algorithm 1): validate sizes/language; run `buildBlockTree` (→ `Trace Error` + null tree on parse failure); `instrument` then execute (→ `StaticOnly` on instrument/compile failure); `parseTraceEvents` + `linkConsumedTokens`; assemble `TraceResult` with status `OK`/`Runtime Error`/`Time Limit Exceeded` and `meta`
    - Guarantee it never throws to the caller and always returns a `TraceResult`
    - _Requirements: 1.1, 3.1, 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 6.3 Write property test for graceful degradation
    - **Property 10: Graceful degradation** — parse succeeds ∧ run fails ⟹ `status === "StaticOnly"` ∧ `blockTree !== null` (mock executor failure)
    - **Validates: Requirements 8.2**

  - [x] 6.4 Write unit tests for `traceProgram` status branches
    - Cover `Trace Error` (null tree), `StaticOnly`, `Runtime Error` (steps up to crash + stderr), `Time Limit Exceeded`, and the never-throws guarantee
    - _Requirements: 8.1, 8.3, 8.4, 8.5_

- [x] 7. Wire the `/api/trace` route
  - [x] 7.1 Add `POST /api/trace` to `submission.js`
    - In `judge/src/routes/submission.js`, require `traceProgram` and add the route: validate required fields, language allowlist (`cpp`/`java`), and `MAX_CODE_SIZE`/`MAX_INPUT_SIZE`; return the single `TraceResult` JSON on success and a 500 on unexpected error
    - _Requirements: 1.1, 1.5, 8.5_

  - [x] 7.2 Write integration tests for `/api/trace`
    - End-to-end against small real C++ and Java programs (loop summing an array, conditional branch, function call) in host mode: assert `status: "OK"`, non-empty `steps`, correct `stdout`, and `inputTokens` linked to read steps; assert 400s for invalid language/empty code; regression-assert output purity
    - _Requirements: 1.1, 1.5, 3.1, 6.2, 7.2_

- [x] 8. Checkpoint - backend pipeline end to end
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement frontend trace service and state hook
  - [x] 9.1 Add `traceCode()` to the judge API service
    - In `reactapp/src/services/judgeApi.js`, add `traceCode(payload)` that POSTs to `/api/trace`, resolves the parsed `TraceResult` on 200, rejects with a derived `Error` on non-2xx (mirroring `runCode`/`submitCode`), and does not mutate `payload`
    - _Requirements: 1.1, 1.5_

  - [x] 9.2 Implement `useCodeFlow` hook
    - Create `reactapp/src/pages/judge/codeflow/useCodeFlow.js` managing `trace`, `status` (idle/loading/ready/error), `step`, `totalSteps`, `playing`, and actions `run`, `reset`, `stepForward`, `stepBackward`, `togglePlay`, `setSpeed`
    - Clamp `step` to `[0, max(0, totalSteps - 1)]`; make forward/backward no-ops at bounds; `run` sets loading → ready/error and resets step to 0; auto-play advances one step per interval and stops at the last step
    - _Requirements: 1.1, 1.2, 5.1, 5.2, 5.4_

  - [x] 9.3 Write property test for step clamping
    - **Property 8: Step clamping** — after any sequence of step/play/reset actions, `0 <= step <= max(0, totalSteps - 1)`
    - **Validates: Requirements 5.1**

  - [x] 9.4 Write unit tests for `useCodeFlow` playback edges
    - Forward at last step and backward at 0 are no-ops; play/pause; reset; `run` status transitions and step reset
    - _Requirements: 5.2, 5.4_

- [x] 10. Implement bidirectional highlight resolution logic
  - [x] 10.1 Implement `resolveBlockAtLine` and `activeBlockIds`
    - Create `reactapp/src/pages/judge/codeflow/flowResolvers.js` with `resolveBlockAtLine(sourceMap, line)` returning the innermost block id (last in chain) or null (Algorithm 4), and `activeBlockIds(blockTree, step)` returning the step's block plus all ancestors to root, or ∅ when step is null (Algorithm 5)
    - Add helpers `resolveHighlightRange(trace, hovered)` and `lineRange(line)` used by the panel
    - _Requirements: 4.2, 4.3, 4.4, 5.3_

  - [x] 10.2 Write property test for bidirectional consistency
    - **Property 6: Bidirectional consistency** — when `resolveBlockAtLine` returns a non-null id, that block's `sourceRange` contains the line
    - **Validates: Requirements 4.3**

  - [x] 10.3 Write property test for ancestor closure of active set
    - **Property 7: Ancestor closure** — `activeBlockIds(tree, s)` equals `{ s.blockId } ∪ ancestors(s.blockId)`
    - **Validates: Requirements 5.3**

  - [x] 10.4 Write unit tests for resolver edge cases
    - Uncovered line returns null (clears highlight); empty/missing source-map chains handled
    - _Requirements: 4.4_

- [x] 11. Implement `CodeFlowContext` and Monaco highlight hook
  - [x] 11.1 Create `CodeFlowContext`
    - Create `reactapp/src/pages/judge/codeflow/CodeFlowContext.js` providing shared `hovered` state (`{ source, blockId } | { source, line } | null`), `setHovered`, and `sourceMap`
    - _Requirements: 4.1, 4.2_

  - [x] 11.2 Implement `useMonacoHighlight`
    - Create `reactapp/src/pages/judge/codeflow/useMonacoHighlight.js` that maintains a decorations collection, applies a `hover-highlight` class for `highlightedRange` and an `exec-highlight` class for `activeRange`, calls `revealLineInCenter` for the active line, and removes all feature-owned decorations on unmount/when ranges clear
    - Add the `hover-highlight`/`exec-highlight` CSS using `theme.js` tokens
    - _Requirements: 4.1, 4.5, 5.5_

  - [x] 11.3 Write unit tests for `useMonacoHighlight`
    - With Monaco mocked: at most one hover and one exec region; both-null removes all decorations; decorations removed on unmount (no leaks across problem switches)
    - _Requirements: 4.5, 5.5_

- [x] 12. Implement flow visual components
  - [x] 12.1 Implement `FlowBlock` and `FlowCanvas`
    - Create `reactapp/src/pages/judge/codeflow/FlowBlock.jsx` (recursive, indents by `depth`, styles by `BlockType`, applies active styling when in `activeBlockIds`, emits `setHovered` on mouseenter/leave, shows loop iteration counts) and `FlowCanvas.jsx` (renders the block tree from the root), reusing `theme.js` tokens
    - _Requirements: 4.1, 5.3_

  - [x] 12.2 Implement `InputRibbon` and `VariablesPanel`
    - Create `reactapp/src/pages/judge/codeflow/InputRibbon.jsx` rendering `inputTokens` and indicating which are consumed at the current step, and `VariablesPanel.jsx` rendering the current step's `vars` (highlighting `changed`)
    - _Requirements: 6.4_

  - [x] 12.3 Implement `FlowControlBar` and idle/loading/error states
    - Create `reactapp/src/pages/judge/codeflow/FlowControlBar.jsx` reusing `components/visualizer/ControlBar` for play/pause/step/reset/speed, plus `FlowIdleState`, `FlowLoading`, `FlowError`, and a `StaticOnly` notice
    - _Requirements: 1.2, 5.2, 5.4, 8.1, 8.2_

- [x] 13. Assemble `CodeFlowPanel` container
  - [x] 13.1 Implement `CodeFlowPanel`
    - Create `reactapp/src/pages/judge/codeflow/CodeFlowPanel.jsx` wiring `useCodeFlow`, providing `CodeFlowContext`, computing `activeBlockIds`/`highlightedRange`/`activeRange`, calling `useMonacoHighlight`, and rendering `FlowControlBar`, `InputRibbon`, `FlowCanvas`, `VariablesPanel`, and idle/loading/error/StaticOnly states
    - _Requirements: 1.3, 1.4, 4.1, 5.3, 5.5, 6.4, 8.2_

- [x] 14. Integrate into JudgePage
  - [x] 14.1 Add the Flow tab and Visualize Flow trigger
    - In `reactapp/src/pages/judge/JudgePage.jsx`, add a third bottom-panel tab (`Testcases | Output | Flow`) rendering `CodeFlowPanel` with the editor kept visible above it, and add a "Visualize Flow" affordance next to Run/Submit that triggers a trace and switches the bottom tab to `Flow`
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 14.2 Wire editor cursor → block direction
    - In the Monaco mount handler, store `editorRef`/`traceRef`/context refs and add `onDidChangeCursorPosition` that calls `resolveBlockAtLine` and updates `setHovered` (or clears it when no block covers the line)
    - _Requirements: 4.2, 4.4, 4.5_

- [x] 15. Final checkpoint - full feature verification
  - Ensure all tests pass, ask the user if questions arise.

---

# Phase 2: Data Structure Dry-Run Visualization

## Phase 2 Overview

Phase 1 delivered the block tree, execution stepping, and bidirectional highlight, but every trace event carries `vars: []` — the instrumentation never captured variable values, so the Flow view is structural only. Phase 2 makes the visualizer behave like a human dry-running code on paper: it captures **per-step variable values and data-structure state** on the backend, and renders them **graphically** on the frontend (1D/2D array grids, stacks, queues, lists, sets, maps, and scalars) in a **parallel window beside the editor**, with element-level change highlighting as the user steps/plays through execution.

This phase is sequenced backend-first because there is no data to render until capture works: (1) extend the variable data model, (2) discover in-scope variables per probe from the static tree, (3) generate language-specific runtime serialization (C++ templates, Java reflection) that prints each variable's structured value to the trace channel without breaking output purity, (4) parse structured values + element-level diffs in `traceParser`, (5) expose `sourceMap` + richer vars through `tracer.js`. Then frontend: (6) a value-model normalizer, (7) individual data-structure renderers, (8) a renderer dispatcher, (9) the parallel `DryRunPanel` window docked beside the editor, and (10) JudgePage integration. Property/unit tests live beside the pure functions they validate, in their own files (same convention as Phase 1).

## Phase 2 Requirements Addendum

These extend `requirements.md`; new tasks cite them for traceability.

- **R9 Variable & data-structure capture.** WHEN an instrumented build runs THEN each stored step SHALL carry the values of the variables in scope at that step, captured on the dedicated trace channel (never stdout), preserving output purity (extends R7).
- **R10 Structured value model.** WHEN a variable is captured THEN the system SHALL classify it into a structured view (`scalar`, `string`, `array1d`, `array2d`, `stack`, `queue`, `deque`, `list`, `set`, `map`, `object`) with kind-appropriate data, so the frontend can render it graphically.
- **R11 Element-level change tracking.** WHEN a captured value changes between consecutive steps THEN the system SHALL identify which elements changed (cell indices for arrays/grids, top/front for stack/queue, changed keys for maps) so changes can be highlighted, not just the whole variable.
- **R12 Parallel dry-run window.** WHERE a trace is ready THE system SHALL render the captured data structures graphically in a window shown in parallel with the Monaco editor (not only the bottom Flow tab), updating each structure to reflect the current step.

## Phase 2 Tasks

- [ ] 16. Extend the variable data model (backend + shared shapes)
  - [x] 16.1 Add the structured value view to the trace types
    - In `judge/src/trace/types.js`, extend `VarSnapshot` with an optional `view` object: `{ kind: ViewKind, data: any, changedKeys?: string[] }` where `ViewKind` ∈ `scalar | string | array1d | array2d | stack | queue | deque | list | set | map | object`; document that `data` is kind-specific (e.g. `array1d` → `string[]`, `array2d` → `string[][]`, `map` → `{key,value}[]`, `stack`/`queue` → `{ items: string[], top?/front?/back? }`)
    - Keep the existing `value: string` field for back-compat (scalars and a summarized fallback)
    - _Requirements: R10_

- [x] 17. Capture in-scope variables statically (probe → variable model)
  - [x] 17.1 Implement `collectScopeVariables` in the structural pass
    - Add `collectScopeVariables(language, code, blockTree)` to `judge/src/trace/structuralPass.js` (or a new `judge/src/trace/scopeModel.js`) that walks declaration nodes to produce, per enclosing function/block scope, the list of `{ name, type, declLine }` for locals and parameters
    - Provide `variablesInScopeAt(scopeModel, line)` returning variables whose `declLine <= line` within all scopes enclosing `line` (prevents emitting a variable before its declaration, which would not compile)
    - _Requirements: R9_
  - [x] 17.2 Write unit tests for scope/variable discovery
    - C++ and Java fixtures: function params, nested-block shadowing, declared-after-probe exclusion, loop counters; assert the in-scope set per line
    - _Requirements: R9_

- [x] 18. Capture variable values at runtime (C++ instrumentation)
  - [x] 18.1 Add C++ serialization runtime + value probes
    - In `judge/src/trace/instrumentPass.js`, inject a templated C++ `__vtrace_repr(x)` helper set that serializes scalars, `std::string`, `std::vector<T>` (1D), `std::vector<std::vector<T>>` (2D), `std::stack`, `std::queue`, `std::deque`, `std::set`/`unordered_set`, `std::map`/`unordered_map`, and `std::pair`, each tagged with its `view.kind`
    - Extend `probeCall` to emit a `vars` array built from `variablesInScopeAt(...)` at each probe, JSON-escaping names/values; keep emitting on fd 3 only (output purity)
    - _Requirements: R9, R10, 7.2_
  - [x] 18.2 Write output-purity + capture unit tests (C++)
    - Instrumented C++ fixtures still compile and produce byte-identical stdout (Property 9); assert a stepping fixture (loop filling a vector) yields `vars` whose `view.kind` and values match expectations
    - _Requirements: 7.2, R9, R10_

- [x] 19. Capture variable values at runtime (Java instrumentation)
  - [x] 19.1 Add Java serialization runtime + value probes
    - In `judge/src/trace/instrumentPass.js`, extend the `__VTrace` helper with a reflective `repr(Object)` that serializes primitives/boxed types, `String`, 1D/2D arrays (`Arrays.deepToString`-style), `List`, `Stack`/`Deque`/`Queue`, `Set`, and `Map`, each tagged with its `view.kind`
    - Emit in-scope variables at each probe via `variablesInScopeAt(...)`; keep writing to the trace channel only (output purity)
    - _Requirements: R9, R10, 7.2_
  - [x] 19.2 Write output-purity + capture unit tests (Java)
    - Instrumented Java fixtures still compile and produce byte-identical stdout; assert a stepping fixture (loop filling an `int[]` / `ArrayList`) yields the expected `vars` views
    - _Requirements: 7.2, R9, R10_

- [x] 20. Parse structured values and element-level diffs
  - [x] 20.1 Extend `normalizeVars` for structured views + element diffs
    - In `judge/src/trace/traceParser.js`, parse each var's `view` from the event, and when a variable's `view.data` differs from the previous step's, compute `changedKeys` (changed array indices as `"i"` / `"r,c"`, `top`/`front`/`back` for stack/queue, changed map keys) in addition to the existing whole-variable `changed` flag
    - _Requirements: R11_
  - [x] 20.2 Write property test for element-diff soundness
    - **Property 11: Diff soundness** — every key in `changedKeys` corresponds to an element whose value actually differs from the previous step, and unchanged elements are never listed
    - **Validates: R11**
  - [x] 20.3 Write unit tests for structured-view parsing
    - array1d/array2d/stack/queue/map fixtures: correct `view.kind`, data shape, and `changedKeys` across consecutive steps; malformed/missing `view` falls back to scalar without throwing
    - _Requirements: R10, R11, 3.5_

- [x] 21. Expose sourceMap and richer vars through the tracer
  - [x] 21.1 Include `sourceMap` and capture wiring in `TraceResult`
    - In `judge/src/tracer.js`, thread `structural.sourceMap` into the returned `TraceResult` (frontend `CodeFlowPanel` already reads `trace.sourceMap`; it is currently undefined — fix this), and pass the scope model through instrumentation/parsing so steps carry populated `vars`
    - Add `sourceMap` to the `TraceResult` typedef in `types.js`
    - _Requirements: 4.2, R9_
  - [x] 21.2 Update tracer/integration tests for populated vars + sourceMap
    - Extend `tracer.statusBranches.test.js` / `submission.trace.integration.test.js`: `status: "OK"` results include a non-empty `sourceMap` and steps with non-empty `vars` of the expected views for small C++/Java programs
    - _Requirements: R9, 4.2_

- [x] 22. Checkpoint - backend data-structure capture
  - Ensure all backend tests pass (capture, diffs, output purity, sourceMap); ask the user if questions arise.

- [x] 23. Frontend value-model normalizer
  - [x] 23.1 Implement `toValueModel`
    - Create `reactapp/src/pages/judge/codeflow/valueModel.js` with `toValueModel(varSnapshot)` returning a render-ready model `{ name, type, scope, kind, data, changed, changedKeys }`, defaulting unknown/missing `view` to a `scalar` model so rendering never crashes
    - _Requirements: R10_
  - [x] 23.2 Write unit tests for `toValueModel`
    - Each `ViewKind` maps to the right model; missing/garbled `view` degrades to scalar; `changedKeys` preserved
    - _Requirements: R10, R11_

- [x] 24. Data-structure renderer components
  - [x] 24.1 Implement `ArrayGrid` (1D + 2D)
    - Create `reactapp/src/pages/judge/codeflow/ds/ArrayGrid.jsx` rendering a 1D row or 2D grid of cells with indices, highlighting cells in `changedKeys` with the acid-yellow accent, using `theme.js` tokens; show optional pointer markers (e.g. `i`, `j`) when provided
    - _Requirements: R10, R11, R12_
  - [x] 24.2 Implement `StackView` and `QueueView`
    - Create `ds/StackView.jsx` (vertical, top marked, push/pop cell highlighted) and `ds/QueueView.jsx` (horizontal, front/back marked), highlighting changed ends from `changedKeys`
    - _Requirements: R10, R11, R12_
  - [x] 24.3 Implement `ListSetMapView` and `ScalarChip`
    - Create `ds/ListSetMapView.jsx` (list/set as chips, map as key→value rows with changed keys highlighted) and `ds/ScalarChip.jsx` (single name/value chip that flashes on change)
    - _Requirements: R10, R11, R12_
  - [x] 24.4 Write unit tests for renderers
    - With models mocked: correct cell counts/shape (1D vs 2D), changed cells receive accent styling, stack/queue end markers render, map rows render key→value
    - _Requirements: R10, R11_

- [x] 25. Renderer dispatcher
  - [x] 25.1 Implement `DataStructureView`
    - Create `reactapp/src/pages/judge/codeflow/ds/DataStructureView.jsx` that takes a value model and selects the matching renderer by `kind` (array1d/array2d → `ArrayGrid`, stack → `StackView`, queue/deque → `QueueView`, list/set/map → `ListSetMapView`, else `ScalarChip`)
    - _Requirements: R10, R12_

- [x] 26. Parallel dry-run window
  - [x] 26.1 Implement `DryRunPanel`
    - Create `reactapp/src/pages/judge/codeflow/DryRunPanel.jsx` that, given the current step's `vars`, maps each through `toValueModel` and renders a `DataStructureView` per variable in a scrollable grid laid out like a paper dry-run worksheet, reusing `FlowControlBar` for play/step/reset so it is usable standalone beside the editor
    - Show the input ribbon and current line/iteration context at the top; render idle/loading/error/StaticOnly states consistently with `CodeFlowPanel`
    - _Requirements: R12, 5.3, 5.4, 6.4_
  - [x] 26.2 Write unit tests for `DryRunPanel`
    - Renders one `DataStructureView` per in-scope variable for a given step; updates structures when `step` changes; empty-vars and StaticOnly states handled
    - _Requirements: R12_

- [ ] 27. Integrate the parallel window into JudgePage
  - [ ] 27.1 Mount `DryRunPanel` as a side-by-side window
    - In `reactapp/src/pages/judge/JudgePage.jsx`, render `DryRunPanel` in a resizable panel shown in parallel with the editor (e.g. a right-hand split or detachable overlay), sharing the same `useCodeFlow`/trace state and `editorRef` as the Flow tab so stepping in one reflects in the other and bidirectional highlight still works
    - Add a toggle next to "Visualize Flow" to show/hide the parallel dry-run window; default-hide so the existing layout is unaffected until requested
    - _Requirements: R12, 1.3, 1.4, 4.1_

- [ ] 28. Final checkpoint - data-structure dry-run verification
  - Run the full backend + frontend suites; manually verify a C++ and a Java sample (array fill, stack/queue ops, 2D grid like N-Queens `board`) animate cell-by-cell in the parallel window while stepping. Ask the user if questions arise.

## Phase 2 Notes

- New correctness property: **Property 11 (Diff soundness)** validates R11 (task 20.2).
- Variable capture is the gating risk: generic value capture from C++/Java requires generated serialization, not text-only splicing. Tasks 18/19 keep it on the fd-3 trace channel so Property 9 (output purity) still holds.
- Test-file convention from Phase 1 is preserved: each test sub-task is its own `*.pbt.test.js` / `*.test.js` file.
- Backend-first sequencing: nothing renders until capture works, so tasks 16–22 precede all frontend work (23–28).

## Notes

- Tasks marked with `*` are optional test sub-tasks and can be skipped for a faster MVP, but they encode the design's correctness properties and are recommended.
- Implementation language is JavaScript/JSX; property-based tests use `fast-check` per the design's Testing Strategy.
- Test-file convention (so independent test sub-tasks can run in parallel without file conflicts): each test sub-task lives in its own file (e.g. `*.pbt.test.js` for property tests, `*.test.js` for unit/integration tests) rather than sharing a single test file per module.
- Each task references specific requirement clauses for traceability; property-test sub-tasks additionally cite the design property number they validate.
- All 10 correctness properties are covered: Property 1 (2.3), 2 (2.4), 3 (3.3), 4 (3.4), 5 (3.5), 6 (10.2), 7 (10.3), 8 (9.3), 9 (5.2), 10 (6.3).
- Checkpoints (tasks 4, 8, 15) provide incremental validation at backend-logic, backend-pipeline, and full-feature boundaries.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["2.1", "3.1", "9.1", "10.1", "11.1"] },
    { "id": 3, "tasks": ["2.2", "3.2", "5.1", "9.2", "10.2", "10.3", "10.4", "11.2"] },
    { "id": 4, "tasks": ["2.3", "2.4", "2.5", "3.3", "3.4", "3.5", "3.6", "3.7", "5.2", "9.3", "9.4", "11.3", "12.1", "12.2", "12.3"] },
    { "id": 5, "tasks": ["6.1", "13.1"] },
    { "id": 6, "tasks": ["6.2", "14.1"] },
    { "id": 7, "tasks": ["6.3", "6.4", "7.1", "14.2"] },
    { "id": 8, "tasks": ["7.2"] }
  ]
}
```
