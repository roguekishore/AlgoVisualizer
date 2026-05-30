import React from "react";
import { V, MONO, MONUMENT, LABEL_STYLE } from "../../../components/visualizer/theme";
import ControlBar from "../../../components/visualizer/ControlBar";
import IdleState from "../../../components/visualizer/IdleState";
import {
  GitBranch,
  Loader,
  AlertTriangle,
  Layers,
} from "lucide-react";

/**
 * FlowControlBar — Playback controls for the Code Flow Visualizer.
 *
 * Thin wrapper around the shared {@link ControlBar} playback semantics
 * (prev / play-pause / next / speed / step counter / reset). The trace is
 * loaded by the "Visualize Flow" affordance in JudgePage, so this bar always
 * renders in the post-load (`loaded`) playback mode driven by `useCodeFlow`.
 *
 * Stepping is bounded by `useCodeFlow` and ControlBar additionally disables the
 * prev/next buttons at the range edges, satisfying the step no-op requirements.
 *
 * @param {Object} props
 * @param {boolean} props.playing      - whether auto-play is active
 * @param {number} props.step          - current step index (0-based)
 * @param {number} props.totalSteps    - total number of steps
 * @param {number} props.speed         - current auto-play interval (ms; lower = faster)
 * @param {Function} props.onForward   - step forward
 * @param {Function} props.onBackward  - step backward
 * @param {Function} props.onPlayPause - toggle play/pause
 * @param {Function} props.onReset     - reset playback to step 0
 * @param {Function} props.onSpeedChange - speed slider change handler
 * @param {number} [props.minSpeed=20]
 * @param {number} [props.maxSpeed=400]
 */
export default function FlowControlBar({
  playing,
  step,
  totalSteps,
  speed,
  onForward,
  onBackward,
  onPlayPause,
  onReset,
  onSpeedChange,
  minSpeed = 20,
  maxSpeed = 400,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        background: V.surface,
        borderBottom: `1px solid ${V.border}`,
        flexWrap: "wrap",
      }}
    >
      <span style={{ ...LABEL_STYLE, marginRight: 4 }}>flow</span>
      <ControlBar
        loaded
        playing={playing}
        step={step}
        totalSteps={totalSteps}
        speed={speed}
        minSpeed={minSpeed}
        maxSpeed={maxSpeed}
        onForward={onForward}
        onBackward={onBackward}
        onPlayPause={onPlayPause}
        onReset={onReset}
        onSpeedChange={onSpeedChange}
      />
    </div>
  );
}

/**
 * FlowIdleState — Shown before any trace has been requested.
 * Prompts the user to trigger a flow visualization.
 */
export function FlowIdleState() {
  return (
    <IdleState
      icon={GitBranch}
      heading="NO FLOW YET"
      message='Run <b>Visualize Flow</b> to capture and replay your program&apos;s execution.'
    />
  );
}

/**
 * FlowLoading — Loading state shown while a trace request is in progress.
 * Rendered inside the Flow panel only; it never blocks the Run/Submit controls
 * (Requirement 1.2).
 */
export function FlowLoading() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 0",
        gap: 16,
        textAlign: "center",
      }}
    >
      <Loader
        size={32}
        style={{ color: V.accent, animation: "flow-spin 1s linear infinite" }}
      />
      <div
        style={{
          fontFamily: MONUMENT,
          fontWeight: 900,
          fontSize: 16,
          color: "rgba(255,255,255,0.55)",
          letterSpacing: "0.04em",
        }}
      >
        CAPTURING FLOW
      </div>
      <div style={{ fontFamily: MONO, fontSize: 11, color: V.dim }}>
        Instrumenting and running your program…
      </div>
      <style>{`@keyframes flow-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/**
 * FlowError — Error state shown when the trace request fails or the backend
 * returns a `Trace Error` status (Requirement 8.1).
 *
 * @param {Object} props
 * @param {string} [props.message] - human-readable error detail
 */
export function FlowError({ message }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 24px",
        gap: 14,
        textAlign: "center",
      }}
    >
      <AlertTriangle size={32} style={{ color: V.red }} />
      <div
        style={{
          fontFamily: MONUMENT,
          fontWeight: 900,
          fontSize: 16,
          color: V.red,
          letterSpacing: "0.04em",
        }}
      >
        TRACE FAILED
      </div>
      {message && (
        <div
          style={{
            fontFamily: MONO,
            fontSize: 11,
            color: V.muted,
            maxWidth: 480,
            lineHeight: 1.6,
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}

/**
 * StaticOnlyNotice — Banner shown when the backend returns the `StaticOnly`
 * status: the block tree was built but no execution trace is available because
 * instrumentation or compilation failed (Requirement 8.2). The static block
 * view is still rendered alongside this notice.
 *
 * @param {Object} props
 * @param {string} [props.message] - optional detail (e.g. compiler stderr)
 */
export function StaticOnlyNotice({ message }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "10px 12px",
        margin: 12,
        background: V.amberDim,
        border: `1px solid ${V.amber}`,
        borderLeft: `3px solid ${V.amber}`,
      }}
    >
      <Layers size={16} style={{ color: V.amber, flexShrink: 0, marginTop: 1 }} />
      <div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: V.amber,
          }}
        >
          Static view only
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 11,
            color: V.muted,
            marginTop: 4,
            lineHeight: 1.6,
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
          }}
        >
          {message ||
            "The block structure was parsed, but execution could not be traced (compilation or instrumentation failed). Playback is unavailable."}
        </div>
      </div>
    </div>
  );
}
