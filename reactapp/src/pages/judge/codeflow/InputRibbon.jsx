import React from "react";
import { V, MONO, LABEL_STYLE } from "../../../components/visualizer/theme";

/**
 * InputRibbon — Visualizes the stdin forwarded to the traced program and how it is
 * consumed during playback (Requirement 6.4).
 *
 * Each {@link InputToken} is rendered as a chip. A token's relationship to the
 * current step is one of three states:
 *  - **consumed**: it was read at or before the current step (`consumedAtStep <= step`)
 *  - **current**:  it was read exactly at the current step (`consumedAtStep === step`)
 *  - **pending**:  it has not been read yet at the current step, or is never read
 *
 * @typedef {import("./flowResolvers").TraceStep} TraceStep
 * @typedef {Object} InputToken
 * @property {number} index           position in the input stream (contiguous from 0)
 * @property {string} raw             the token text
 * @property {number|null} consumedAtStep step index that read it, or null if unused
 *
 * @param {Object} props
 * @param {InputToken[]} [props.inputTokens] tokenized stdin from the TraceResult
 * @param {number} [props.step]              current (0-based) step index
 */
export default function InputRibbon({ inputTokens, step = 0 }) {
  const tokens = Array.isArray(inputTokens) ? inputTokens : [];

  return (
    <div
      style={{
        padding: 12,
        background: V.surface,
        borderBottom: `1px solid ${V.border}`,
      }}
    >
      <div style={{ ...LABEL_STYLE, marginBottom: 8 }}>Input</div>

      {tokens.length === 0 ? (
        <div style={{ fontFamily: MONO, fontSize: 12, color: V.dim }}>
          No input forwarded.
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {tokens.map((token) => {
            const state = tokenState(token, step);
            const style = TOKEN_STYLES[state];

            return (
              <span
                key={token.index}
                title={
                  token.consumedAtStep == null
                    ? `token ${token.index} — not read`
                    : `token ${token.index} — read at step ${token.consumedAtStep}`
                }
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: MONO,
                  fontSize: 12,
                  padding: "3px 8px",
                  borderRadius: 2,
                  background: style.bg,
                  color: style.fg,
                  border: `1px solid ${style.border}`,
                  boxShadow: state === "current" ? `0 0 8px ${V.accentDim}` : "none",
                  transition: "background 0.15s ease, border-color 0.15s ease",
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: V.dim,
                    flexShrink: 0,
                  }}
                >
                  {token.index}
                </span>
                <span
                  style={{
                    whiteSpace: "pre",
                    textDecoration:
                      state === "consumed" || state === "current" ? "none" : "none",
                    opacity: state === "pending" ? 0.7 : 1,
                  }}
                >
                  {token.raw}
                </span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Classify a token relative to the current step.
 * @param {{consumedAtStep: number|null}} token
 * @param {number} step current 0-based step index
 * @returns {"current"|"consumed"|"pending"}
 */
function tokenState(token, step) {
  const at = token.consumedAtStep;
  if (at == null) return "pending";
  if (at === step) return "current";
  if (at < step) return "consumed";
  return "pending";
}

/** Visual tokens per consumption state, sourced from the shared visualizer theme. */
const TOKEN_STYLES = {
  current: { bg: V.accentDim, fg: V.accent, border: V.accentMid },
  consumed: { bg: V.greenDim, fg: V.green, border: V.green },
  pending: { bg: V.elevated, fg: V.muted, border: V.border },
};
