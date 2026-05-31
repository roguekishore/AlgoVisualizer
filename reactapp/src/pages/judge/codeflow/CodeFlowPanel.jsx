import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
} from "react";
import { V } from "../../../components/visualizer/theme";
import { CodeFlowProvider, useCodeFlowContext } from "./CodeFlowContext";
import { useMonacoHighlight } from "./useMonacoHighlight";
import {
  activeBlockIds,
  resolveBlockAtLine,
  resolveHighlightRange,
  lineRange,
} from "./flowResolvers";
import FlowCanvas from "./FlowCanvas";
import InputRibbon from "./InputRibbon";
import VariablesPanel from "./VariablesPanel";
import FlowControlBar, {
  FlowIdleState,
  FlowLoading,
  FlowError,
  StaticOnlyNotice,
} from "./FlowControlBar";

/**
 * CodeFlowPanel — Container rendered inside the `Flow` bottom tab on the judge page.
 *
 * Consumes a shared trace + playback state (a {@link useCodeFlow} instance owned by
 * JudgePage and passed via the `flow` prop), provides the shared
 * {@link CodeFlowContext} (hover state + source map) so Flow blocks and the Monaco
 * highlighter stay in sync, and renders the playback controls, input ribbon, block
 * canvas, variables panel, and the idle/loading/error/StaticOnly states.
 *
 * The trace/playback state is owned by JudgePage (not this panel) so the Flow tab
 * and the parallel {@link DryRunPanel} window can share a single `useCodeFlow`
 * instance — stepping in one is reflected in the other (task 27.1).
 *
 * The "Visualize Flow" affordance lives in JudgePage; it triggers a trace through
 * the imperative handle exposed on `ref` (`run`, `reset`) so the parent can kick off
 * a trace and switch to the Flow tab (Requirement 1.3). The editor is kept visible
 * above this panel by JudgePage so block-to-source highlighting is observable
 * (Requirement 1.4).
 *
 * @typedef {import("./flowResolvers").BlockNode} BlockNode
 *
 * @param {Object} props
 * @param {ReturnType<import("./useCodeFlow").useCodeFlow>} props.flow - shared flow
 *        trace + playback state owned by JudgePage
 * @param {"cpp" | "java"} props.language          - selected language
 * @param {string} props.code                       - current editor source
 * @param {string} props.input                      - stdin forwarded to the program
 * @param {{ current: any } | null} props.editorRef - shared Monaco editor ref from JudgePage
 * @param {boolean} [props.active]                   - whether the Flow tab is currently visible
 * @param {{ current: ((line: number) => void) | null }} [props.cursorResolverRef] - ref the panel
 *        populates with an editor-cursor handler so JudgePage's Monaco
 *        `onDidChangeCursorPosition` can drive the editor -> block highlight direction.
 * @param {React.Ref<{ run: Function, reset: Function, status: string }>} ref
 */
const CodeFlowPanel = forwardRef(function CodeFlowPanel(
  { flow, language, code, input, editorRef, active = true, cursorResolverRef },
  ref,
) {
  const {
    trace,
    status,
    step,
    totalSteps,
    playing,
    speed,
    error,
    run,
    reset,
    stepForward,
    stepBackward,
    togglePlay,
    setSpeed,
  } = flow;

  // Expose imperative controls so the JudgePage "Visualize Flow" affordance can
  // trigger a trace (and re-run / reset) without owning the playback state itself.
  const runTrace = useCallback(
    () => run({ language, code, input }),
    [run, language, code, input],
  );

  useImperativeHandle(
    ref,
    () => ({ run: runTrace, reset, status }),
    [runTrace, reset, status],
  );

  // While the trace isn't ready, the view below is unmounted and its cleanup
  // clears any previously registered cursor handler (see CodeFlowPanelView).
  if (status === "idle") return <FlowIdleState />;
  if (status === "loading") return <FlowLoading />;
  if (status === "error" || !trace?.blockTree)
    return <FlowError message={error || trace?.error} />;

  return (
    <CodeFlowProvider sourceMap={trace.sourceMap}>
      <CodeFlowPanelView
        trace={trace}
        editorRef={editorRef}
        cursorResolverRef={cursorResolverRef}
        step={step}
        totalSteps={totalSteps}
        playing={playing}
        speed={speed}
        active={active}
        onForward={stepForward}
        onBackward={stepBackward}
        onPlayPause={togglePlay}
        onReset={reset}
        onSpeedChange={setSpeed}
      />
    </CodeFlowProvider>
  );
});

/**
 * Inner view rendered within {@link CodeFlowProvider}. Consumes the shared hover
 * state to compute the highlight range, derives the active block set + executing
 * line for the current step, and drives the Monaco decorations.
 *
 * @param {Object} props
 * @param {Object} props.trace                       - the loaded TraceResult
 * @param {{ current: any } | null} props.editorRef  - shared Monaco editor ref
 * @param {{ current: ((line: number) => void) | null }} [props.cursorResolverRef] - ref populated
 *        with the editor-cursor handler for the editor -> block direction
 * @param {number} props.step
 * @param {number} props.totalSteps
 * @param {boolean} props.playing
 * @param {number} props.speed
 * @param {boolean} props.active
 * @param {Function} props.onForward
 * @param {Function} props.onBackward
 * @param {Function} props.onPlayPause
 * @param {Function} props.onReset
 * @param {Function} props.onSpeedChange
 */
function CodeFlowPanelView({
  trace,
  editorRef,
  cursorResolverRef,
  step,
  totalSteps,
  playing,
  speed,
  active,
  onForward,
  onBackward,
  onPlayPause,
  onReset,
  onSpeedChange,
}) {
  const { hovered, setHovered, sourceMap } = useCodeFlowContext();

  const currentStep = trace?.steps?.[step] ?? null;

  // Blocks active at the current step: the step's block plus all ancestors to root.
  const activeIds = useMemo(
    () => activeBlockIds(trace?.blockTree, currentStep),
    [trace, currentStep],
  );

  // Bidirectional highlight: resolve a SourceRange from the shared hover state.
  const highlightedRange = useMemo(
    () => resolveHighlightRange(trace, hovered),
    [trace, hovered],
  );

  // Current-step execution line, revealed + highlighted during playback.
  const activeRange = useMemo(
    () => (currentStep ? lineRange(currentStep.line) : null),
    [currentStep],
  );

  // Only paint editor decorations while the Flow tab is visible so highlights from a
  // hidden tab never bleed onto the editor.
  useMonacoHighlight(
    editorRef,
    active ? highlightedRange : null,
    active ? activeRange : null,
  );

  // Editor -> block direction (Requirements 4.2, 4.4): expose a cursor handler to
  // JudgePage's Monaco `onDidChangeCursorPosition`. Resolving against the shared
  // source map, it sets an editor-sourced hover when a block covers the line, or
  // clears the hover when none does so no unrelated block stays highlighted.
  useEffect(() => {
    if (!cursorResolverRef) return undefined;

    const handleCursorLine = (line) => {
      // Ignore cursor activity while the Flow tab is hidden (Requirement 4.5).
      if (!active) return;
      const blockId = resolveBlockAtLine(sourceMap, line);
      if (blockId) setHovered({ source: "editor", line });
      else setHovered(null);
    };

    cursorResolverRef.current = handleCursorLine;
    return () => {
      if (cursorResolverRef.current === handleCursorLine)
        cursorResolverRef.current = null;
    };
  }, [cursorResolverRef, sourceMap, setHovered, active]);

  const isStaticOnly = trace.status === "StaticOnly";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        background: V.bg,
      }}
    >
      <FlowControlBar
        playing={playing}
        step={step}
        totalSteps={totalSteps}
        speed={speed}
        onForward={onForward}
        onBackward={onBackward}
        onPlayPause={onPlayPause}
        onReset={onReset}
        onSpeedChange={onSpeedChange}
      />

      {isStaticOnly && <StaticOnlyNotice message={trace.error} />}

      <InputRibbon inputTokens={trace.inputTokens} step={step} />

      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        <FlowCanvas
          blockTree={trace.blockTree}
          activeBlockIds={activeIds}
          currentStep={currentStep}
        />
      </div>

      <VariablesPanel currentStep={currentStep} />
    </div>
  );
}

export default CodeFlowPanel;
