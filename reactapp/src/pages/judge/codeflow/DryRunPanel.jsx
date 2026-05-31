import React, { useMemo } from "react";
import { V, MONO, MONUMENT, LABEL_STYLE } from "../../../components/visualizer/theme";
import { toValueModel } from "./valueModel";
import DataStructureView from "./ds/DataStructureView";
import InputRibbon from "./InputRibbon";
import FlowControlBar, {
  FlowIdleState,
  FlowLoading,
  FlowError,
  StaticOnlyNotice,
} from "./FlowControlBar";

/**
 * DryRunPanel — Parallel dry-run worksheet window (Requirement R12).
 *
 * Renders the captured data structures graphically in a window shown beside the
 * Monaco editor (not only the bottom Flow tab). For the current step it maps each
 * in-scope variable snapshot through {@link toValueModel} and renders a
 * {@link DataStructureView} per variable in a scrollable, worksheet-style grid —
 * exactly how a person dry-running code on paper lays out each variable's evolving
 * value. Stepping/playing updates every structure to reflect the current step
 * (Requirements 5.3, 5.4).
 *
 * Unlike {@link CodeFlowPanel}, this panel does NOT own the playback state. It
 * accepts the {@link useCodeFlow} state + trace as props so JudgePage can share a
 * single `useCodeFlow` instance between the Flow tab and this parallel window
 * (task 27.1): stepping in one is reflected in the other. It reuses
 * {@link FlowControlBar} for play/step/reset so it remains usable standalone beside
 * the editor, and renders the idle/loading/error/StaticOnly states consistently
 * with `CodeFlowPanel`.
 *
 * @typedef {import("./flowResolvers").TraceStep} TraceStep
 * @typedef {import("./valueModel").ValueModel} ValueModel
 *
 * @param {Object} props
 * @param {Object | null} props.trace      - the loaded TraceResult (provides steps, inputTokens, status)
 * @param {"idle"|"loading"|"ready"|"error"} props.status - playback/load status from useCodeFlow
 * @param {string | null} [props.error]    - error detail when status is "error"
 * @param {number} props.step              - current step index (0-based)
 * @param {number} props.totalSteps        - total number of steps
 * @param {boolean} props.playing          - whether auto-play is active
 * @param {number} props.speed             - current auto-play interval (ms; lower = faster)
 * @param {Function} props.onForward       - step forward
 * @param {Function} props.onBackward      - step backward
 * @param {Function} props.onPlayPause     - toggle play/pause
 * @param {Function} props.onReset         - reset playback to step 0
 * @param {Function} props.onSpeedChange   - speed slider change handler
 */
export default function DryRunPanel({
  trace,
  status,
  error = null,
  step,
  totalSteps,
  playing,
  speed,
  onForward,
  onBackward,
  onPlayPause,
  onReset,
  onSpeedChange,
}) {
  // Idle/loading/error states mirror CodeFlowPanel so the parallel window stays
  // consistent with the Flow tab.
  if (status === "idle") return <FlowIdleState />;
  if (status === "loading") return <FlowLoading />;
  if (status === "error" || !trace?.blockTree)
    return <FlowError message={error || trace?.error} />;

  const currentStep = trace?.steps?.[step] ?? null;
  const isStaticOnly = trace.status === "StaticOnly";

  return (
    <DryRunWorksheet
      trace={trace}
      currentStep={currentStep}
      isStaticOnly={isStaticOnly}
      step={step}
      totalSteps={totalSteps}
      playing={playing}
      speed={speed}
      onForward={onForward}
      onBackward={onBackward}
      onPlayPause={onPlayPause}
      onReset={onReset}
      onSpeedChange={onSpeedChange}
    />
  );
}

/**
 * Inner worksheet view (rendered once a trace is ready). Lays out the playback
 * controls, the current line/iteration context + input ribbon at the top, and the
 * scrollable grid of per-variable data-structure renderers below.
 */
function DryRunWorksheet({
  trace,
  currentStep,
  isStaticOnly,
  step,
  totalSteps,
  playing,
  speed,
  onForward,
  onBackward,
  onPlayPause,
  onReset,
  onSpeedChange,
}) {
  const vars = useMemo(
    () => (currentStep && Array.isArray(currentStep.vars) ? currentStep.vars : []),
    [currentStep],
  );

  // Map each in-scope variable snapshot through the value-model normalizer so each
  // renders graphically via the renderer dispatcher (Requirement R12).
  const models = useMemo(() => vars.map((v) => toValueModel(v)), [vars]);

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

      <StepContextRibbon currentStep={currentStep} step={step} totalSteps={totalSteps} />

      <InputRibbon inputTokens={trace.inputTokens} step={step} />

      <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 12 }}>
        {models.length === 0 ? (
          <div
            style={{
              fontFamily: MONO,
              fontSize: 12,
              color: V.dim,
              padding: "32px 0",
              textAlign: "center",
            }}
          >
            No variables in scope at this step.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 12,
              alignItems: "start",
            }}
          >
            {models.map((model, i) => (
              <WorksheetCell
                key={`${model.scope}:${model.name}:${i}`}
                model={model}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * StepContextRibbon — current line / iteration / step context shown at the top of
 * the worksheet so the user knows where execution is (Requirements 5.3, 5.4).
 *
 * @param {Object} props
 * @param {TraceStep | null} props.currentStep
 * @param {number} props.step
 * @param {number} props.totalSteps
 */
function StepContextRibbon({ currentStep, step, totalSteps }) {
  const line = currentStep && typeof currentStep.line === "number" ? currentStep.line : null;
  const iteration =
    currentStep && typeof currentStep.iteration === "number" ? currentStep.iteration : null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
        padding: "10px 12px",
        background: V.surface,
        borderBottom: `1px solid ${V.border}`,
      }}
    >
      <span style={LABEL_STYLE}>dry run</span>

      <ContextChip label="step" value={`${totalSteps > 0 ? step + 1 : 0} / ${totalSteps}`} />

      {line != null && <ContextChip label="line" value={line} />}

      {iteration != null && (
        <ContextChip label="iter" value={`×${iteration}`} accent />
      )}
    </div>
  );
}

/**
 * Small labeled value chip used by the step-context ribbon.
 *
 * @param {Object} props
 * @param {string} props.label
 * @param {string|number} props.value
 * @param {boolean} [props.accent]
 */
function ContextChip({ label, value, accent = false }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: MONO,
        fontSize: 11,
        padding: "3px 8px",
        borderRadius: 2,
        background: accent ? V.accentDim : V.elevated,
        border: `1px solid ${accent ? V.accentMid : V.border}`,
      }}
    >
      <span
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: V.dim,
        }}
      >
        {label}
      </span>
      <span style={{ color: accent ? V.accent : V.textBright, fontWeight: 700 }}>
        {value}
      </span>
    </span>
  );
}

/**
 * WorksheetCell — one variable's slot in the dry-run worksheet: a header carrying
 * the variable's type/name/scope, then the structured renderer for its value.
 *
 * @param {Object} props
 * @param {ValueModel} props.model
 */
function WorksheetCell({ model }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 10,
        background: V.surface,
        border: `1px solid ${model.changed ? V.accentMid : V.border}`,
        borderRadius: 2,
        transition: "border-color 0.15s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {model.type && (
          <span
            style={{
              fontFamily: MONO,
              fontSize: 10,
              fontWeight: 700,
              color: V.cyan,
              flexShrink: 0,
            }}
          >
            {model.type}
          </span>
        )}

        <span
          style={{
            fontFamily: MONUMENT,
            fontSize: 13,
            fontWeight: 900,
            color: model.changed ? V.accent : V.textBright,
            letterSpacing: "0.02em",
          }}
        >
          {model.name || "(anonymous)"}
        </span>

        {model.scope && (
          <span
            style={{ fontFamily: MONO, fontSize: 9, color: V.dim, marginLeft: "auto" }}
            title={`scope: ${model.scope}`}
          >
            {model.scope}
          </span>
        )}
      </div>

      <DataStructureView model={model} />
    </div>
  );
}
