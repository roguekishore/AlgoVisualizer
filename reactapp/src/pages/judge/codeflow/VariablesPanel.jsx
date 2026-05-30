import React from "react";
import { V, MONO, LABEL_STYLE } from "../../../components/visualizer/theme";

/**
 * VariablesPanel — Renders the variable snapshots visible at the current step,
 * highlighting those that changed relative to the previous step (Requirement 6.4).
 *
 * Each {@link VarSnapshot} carries a `changed` flag computed during trace parsing;
 * changed variables get accent styling so the user can track state evolution while
 * stepping through playback.
 *
 * @typedef {Object} VarSnapshot
 * @property {string} name      variable name
 * @property {string} type      best-effort type, e.g. "int", "String"
 * @property {string} value     stringified value
 * @property {string} scope     owning blockId or function name
 * @property {boolean} changed  changed vs the previous step
 *
 * @typedef {import("./flowResolvers").TraceStep} TraceStep
 *
 * @param {Object} props
 * @param {TraceStep | null} [props.currentStep] the current step (provides `vars`)
 */
export default function VariablesPanel({ currentStep = null }) {
  const vars = currentStep && Array.isArray(currentStep.vars) ? currentStep.vars : [];

  return (
    <div
      style={{
        padding: 12,
        background: V.surface,
        borderTop: `1px solid ${V.border}`,
      }}
    >
      <div style={{ ...LABEL_STYLE, marginBottom: 8 }}>Variables</div>

      {vars.length === 0 ? (
        <div style={{ fontFamily: MONO, fontSize: 12, color: V.dim }}>
          No variables in scope.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {vars.map((v) => (
            <div
              key={`${v.scope}:${v.name}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 8px",
                borderRadius: 2,
                background: v.changed ? V.accentDim : V.elevated,
                border: `1px solid ${v.changed ? V.accentMid : V.border}`,
                transition: "background 0.15s ease, border-color 0.15s ease",
              }}
            >
              {/* type */}
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  fontWeight: 700,
                  color: V.cyan,
                  flexShrink: 0,
                }}
              >
                {v.type}
              </span>

              {/* name */}
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 12,
                  fontWeight: 700,
                  color: v.changed ? V.accent : V.textBright,
                  flexShrink: 0,
                }}
              >
                {v.name}
              </span>

              <span style={{ fontFamily: MONO, fontSize: 12, color: V.dim }}>=</span>

              {/* value */}
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 12,
                  color: v.changed ? V.textBright : V.text,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  flex: 1,
                }}
                title={v.value}
              >
                {v.value}
              </span>

              {/* scope tag */}
              {v.scope && (
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 9,
                    color: V.dim,
                    flexShrink: 0,
                  }}
                  title={`scope: ${v.scope}`}
                >
                  {v.scope}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
