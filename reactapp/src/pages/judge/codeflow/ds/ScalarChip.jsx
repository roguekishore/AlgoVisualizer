import React from "react";
import { V, MONO } from "../../../../components/visualizer/theme";

/**
 * ScalarChip — single-value renderer for the Code Flow dry-run window.
 *
 * Renders a `scalar`, `string`, or `object` value model as a compact
 * `name = value` chip. When the variable changed in the current step
 * (`model.changed`), the chip flashes with the acid-yellow accent so scalar
 * changes between steps are visible (Requirements R10–R12).
 *
 * `data` follows the value-model convention: for `scalar`/`string`/`object` it
 * is a single display string (objects arrive as a string summary). The
 * component coerces any other shape into a string and never throws on garbled
 * input.
 *
 * @typedef {import("../valueModel").ValueModel} ValueModel
 *
 * @param {Object} props
 * @param {ValueModel} props.model - value model (kind `scalar`, `string`, or `object`)
 */
export default function ScalarChip({ model }) {
  const name = toDisplayString(model?.name);
  const value = toDisplayString(model?.data);
  const isChanged = model?.changed === true;
  const isString = model?.kind === "string";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        minHeight: 30,
        padding: "0 10px",
        fontFamily: MONO,
        fontSize: 12,
        color: isChanged ? V.accent : V.text,
        background: isChanged ? V.accentDim : V.elevated,
        border: `1px solid ${isChanged ? V.accentMid : V.border}`,
        boxShadow: isChanged ? `0 0 8px ${V.accentDim}` : "none",
        transition: "background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease",
      }}
      title={value}
    >
      {name && (
        <>
          <span style={{ color: V.muted, fontWeight: 500 }}>{name}</span>
          <span style={{ color: V.dim, userSelect: "none" }}>=</span>
        </>
      )}
      <span style={{ fontWeight: isChanged ? 700 : 500 }}>
        {isString ? `"${value}"` : value}
      </span>
    </div>
  );
}

/**
 * Coerce an arbitrary value into a display string without throwing.
 *
 * @param {*} value
 * @returns {string}
 */
function toDisplayString(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  try {
    return String(value);
  } catch {
    return "";
  }
}
