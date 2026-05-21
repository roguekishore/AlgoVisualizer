# Requirements Document

## Introduction

The Code Flow Visualizer adds an interactive execution-flow view to the Vantage coding page (`reactapp/src/pages/judge/JudgePage.jsx`). After running their C++ or Java solution, a user can see their program's structure rendered as nested visual blocks (functions, loops, conditionals, declarations, calls, and I/O), step through the recorded execution trace, and see a bidirectional highlight between blocks and the exact source lines in the Monaco editor. Because the supported languages are compiled, flow is captured on the judge backend (`judge/`) through a two-pass pipeline: a static structural pass that builds a block tree with precise source ranges, and a dynamic trace pass that runs an instrumented build emitting structured per-statement events. The frontend consumes a single `TraceResult` payload and renders it using the existing visualizer design system.

These requirements were derived from the completed design document (`design.md`) following the design-first workflow. The acceptance criteria are written so that the correctness properties in the design can be traced back to specific, testable requirements.

## Requirements

### Requirement 1: Visualize Flow Trigger and Panel

**User Story:** As a user solving a problem, I want to trigger a flow visualization of my executed code and view it alongside the editor, so that I can understand how my program ran.

#### Acceptance Criteria

1.1. WHEN the user clicks the "Visualize Flow" affordance THEN the system SHALL send a trace request containing the selected language, current code, and input to the `/api/trace` endpoint.
1.2. WHEN a trace request is in progress THEN the system SHALL display a loading state in the Flow panel without blocking the Run/Submit controls.
1.3. WHEN a `TraceResult` is received THEN the system SHALL switch the bottom panel to the `Flow` tab and render the flow view starting at step 0.
1.4. WHERE the Flow tab is displayed THE system SHALL keep the Monaco editor visible above the panel so block-to-source highlighting is observable.
1.5. WHEN the selected language is not `cpp` or `java`, or the code is empty THEN the system SHALL reject the request and surface a descriptive error message.

### Requirement 2: Static Block Tree Construction

**User Story:** As a user, I want my source code parsed into a structured tree of nested blocks with accurate source ranges, so that the visualizer can faithfully represent my program's structure.

#### Acceptance Criteria

2.1. WHEN a parseable program is submitted THEN the system SHALL produce a `BlockNode` tree rooted at exactly one `program` node whose `parentId` is null.
2.2. WHEN the block tree is constructed THEN the system SHALL assign every block a unique `id` across the tree.
2.3. WHEN the block tree is constructed THEN the system SHALL ensure that every non-root block's `sourceRange` is fully contained within its parent's `sourceRange`.
2.4. WHEN the block tree is constructed THEN the system SHALL produce a `SourceMap` in which each covered line lists its blocks ordered outermost to innermost.
2.5. WHEN a grammar node maps to a recognized `BlockType` THEN the system SHALL record a 1-based `sourceRange` with `startLine <= endLine`.

### Requirement 3: Execution Trace Capture

**User Story:** As a user, I want my program's execution recorded as an ordered sequence of steps, so that I can replay exactly what the program did.

#### Acceptance Criteria

3.1. WHEN an instrumented build runs successfully THEN the system SHALL return an ordered list of `TraceStep` events describing the execution path.
3.2. WHEN trace events are parsed into steps THEN the system SHALL assign step indices that are contiguous starting from 0.
3.3. WHEN a step is produced THEN the system SHALL ensure its `blockId` references an existing block and its `line` lies within that block's `sourceRange`.
3.4. WHEN the number of emitted events exceeds the configured step cap THEN the system SHALL store at most `stepCap` steps and report `meta.truncated` as true if and only if the total emitted events exceeded the cap.
3.5. WHEN a trace event is malformed or references an unknown block THEN the system SHALL skip that event without throwing and continue producing a coherent step list.

### Requirement 4: Bidirectional Source-Block Highlighting

**User Story:** As a user, I want hovering a block to highlight its source lines and hovering a source line to highlight its block, so that I can connect visual structure to code precisely.

#### Acceptance Criteria

4.1. WHEN the user hovers a block in the Flow canvas THEN the system SHALL highlight the corresponding `sourceRange` in the Monaco editor.
4.2. WHEN the user moves the editor cursor to a line covered by a block THEN the system SHALL resolve and highlight the innermost block covering that line.
4.3. WHEN a line is resolved to a block id THEN the system SHALL guarantee that the resolved block's `sourceRange` contains that line.
4.4. WHEN no block covers the cursor line THEN the system SHALL clear block highlighting rather than highlighting an unrelated block.
4.5. WHEN the Flow tab is unmounted or the user switches problems THEN the system SHALL remove all feature-owned editor decorations.

### Requirement 5: Trace Playback Controls

**User Story:** As a user, I want to step through and play back the recorded trace, so that I can observe execution at my own pace.

#### Acceptance Criteria

5.1. WHEN playback state changes through stepping, playing, or resetting THEN the system SHALL keep the current step index within the range `[0, max(0, totalSteps - 1)]`.
5.2. WHEN the current step is the last step THEN the system SHALL treat step-forward as a no-op, and WHEN the current step is 0 THEN the system SHALL treat step-backward as a no-op.
5.3. WHEN a step is the current step THEN the system SHALL mark as active exactly that step's block and all of its ancestors up to the root.
5.4. WHEN auto-play is active THEN the system SHALL advance one step per configured interval and stop at the last step.
5.5. WHEN the current step changes THEN the system SHALL reveal and highlight the executing line in the editor.

### Requirement 6: Input Visualization

**User Story:** As a user, I want to see the inputs forwarded to my program and how they are consumed, so that I can understand the relationship between input and execution.

#### Acceptance Criteria

6.1. WHEN a trace is produced THEN the system SHALL tokenize the forwarded stdin into `InputToken`s with contiguous indices starting at 0.
6.2. WHEN a step reads input THEN the system SHALL link the consumed token to the step index that read it.
6.3. WHEN an input token is never read THEN the system SHALL mark its `consumedAtStep` as null.
6.4. WHERE the Flow panel is displayed THE system SHALL render the input tokens and indicate which have been consumed at the current step.

### Requirement 7: Output Purity of Instrumentation

**User Story:** As a user, I want instrumentation to never alter my program's output, so that the trace reflects my real program behavior.

#### Acceptance Criteria

7.1. WHEN an instrumented build runs THEN the system SHALL emit trace events on a dedicated channel separate from stdout.
7.2. WHEN an instrumented build runs THEN the system SHALL produce stdout identical to the original (uninstrumented) program for the same input.
7.3. WHEN the trace payload is assembled THEN the system SHALL return the program's stdout unmodified by instrumentation.

### Requirement 8: Graceful Degradation and Error Handling

**User Story:** As a user whose program fails to compile, crashes, or times out, I want to still see whatever structure and trace are available, so that the feature remains useful under failure.

#### Acceptance Criteria

8.1. WHEN the source cannot be parsed THEN the system SHALL return status `Trace Error` with a null block tree and a descriptive message.
8.2. WHEN parsing succeeds but the instrumented build fails to compile or instrumentation fails THEN the system SHALL return status `StaticOnly` with the block tree present and an empty step list.
8.3. WHEN the program crashes mid-execution THEN the system SHALL return status `Runtime Error` with the steps captured up to the crash and the stderr message.
8.4. WHEN the program exceeds the time or step limits THEN the system SHALL return status `Time Limit Exceeded` (or set `meta.truncated`) while retaining the captured steps.
8.5. WHEN `traceProgram` encounters any failure THEN the system SHALL always return a `TraceResult` to the route handler and SHALL NOT throw.

## Glossary

- **Block / BlockNode**: A node in the structural tree representing a source construct (program, function, loop, conditional, declaration, assignment, call, I/O, return, or generic block) with a precise source range.
- **Block tree**: The nested tree of `BlockNode`s rooted at a single `program` node, produced by the static structural pass.
- **Source range**: A 1-based start/end line and column span identifying the exact source text a block covers.
- **SourceMap**: A map from each source line to the chain of block ids covering it, ordered outermost to innermost, used for fast line-to-block resolution.
- **Structural pass**: The static analysis step that parses source into the block tree and source map without executing the program.
- **Instrumentation / instrumented build**: A rewritten version of the source that emits structured trace events at runtime without altering program output.
- **Trace event**: A single structured record (NDJSON line) emitted by the instrumented program describing execution at a block and line.
- **TraceStep**: A parsed, ordered execution event consumed by the frontend (kind, block id, line, variable snapshots, iteration, I/O deltas).
- **TraceResult**: The single JSON payload returned to the frontend containing status, block tree, steps, input tokens, stdout, and metadata.
- **Step cap (STEP_CAP)**: The maximum number of steps retained in a `TraceResult`; emission self-terminates and truncation is reported when exceeded.
- **InputToken**: A tokenized unit of the forwarded stdin, annotated with the step index that consumed it (or null if unused).
- **Active set**: The set of block ids highlighted for the current step: the step's block plus all of its ancestors up to the root.
- **Bidirectional highlight**: The synchronized highlighting between Flow blocks and editor source lines in both directions.
- **StaticOnly**: A result status indicating the block tree was built but no execution trace is available (compile/instrumentation failure).
- **Decoration**: A Monaco editor highlight region applied for hovered blocks (`hover-highlight`) or the current execution line (`exec-highlight`).
