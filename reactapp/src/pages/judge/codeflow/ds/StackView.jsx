import React from "react";
import { V, MONO } from "../../../../components/visualizer/theme";

/**
 * StackView — vertical LIFO stack renderer for the Code Flow dry-run window.
 *
 * Renders a `stack` value model as a vertical column of cells with the **top**
 * of the stack drawn at the top of the column and marked with a `TOP` label.
 * The cell at the changed end (a push or a pop) is highlighted with the
 * acid-yellow accent so element-level changes between steps are visible
 * (Requirements R10–R12).
 *
 * `data` follows the value-model convention for stacks:
 *   `{ items: string[], top?: number }`
 * where `items[items.length - 1]` is the top of the stack and `top`, when
 * present, is the index of the top element. `changedKeys` for a stack carry
 * the symbolic key `"top"` when the top end changed this step.
 *
 * The component degrades gracefully on malformed data: a missing/invalid
 * `data.items` renders an empty placeholder rather than throwing.
 *
 * @typedef {import("../valueModel").ValueModel} ValueModel
 *
 * @param {Object} props
 * @param {ValueModel} props.model - value model (kind `stack`)
 */
export default function StackView({ model }) {
  const data = model?.data;
  const changedKeys = Array.isArray(model?.changedKeys) ? model.changedKeys : [];
  const changed = new Set(changedKeys);

  const items = normalizeItems(data);

  if (items.length === 0) {
    return <EmptyPlaceholder />;
  }

  // Resolve the index of the top element. Prefer an explicit `top`, otherwise
  // assume the last item is the top (standard array-backed stack).
  const topIndex =
    typeof data?.top === "number" && data.top >= 0 && data.top < items.length
      ? data.top
      : items.length - 1;

  // The top end is highlighted when the stack reports a change at "top".
  const topChanged = changed.has("top");

  // Render from the top of the stack downward so the top sits visually on top.
  const ordered = items
    .map((value, index) => ({ value, index }))
    .reverse();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {ordered.map(({ value, index }) => {
        const isTop = index === topIndex;
        const isChanged = isTop && topChanged;
        return (
          <div key={index} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Cell value={value} index={index} isChanged={isChanged} />
            {/* TOP marker beside the top cell */}
            <span
              style={{
                fontFamily: MONO,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: isTop ? V.accent : "transparent",
                userSelect: "none",
                minWidth: 26,
              }}
            >
              TOP
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * A single stack cell: index label on the left, value box on the right.
 *
 * @param {Object} props
 * @param {string} props.value
 * @param {number} props.index
 * @param {boolean} props.isChanged
 */
function Cell({ value, index, isChanged }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <span
        style={{
          fontFamily: MONO,
          fontSize: 9,
          color: V.dim,
          minWidth: 16,
          textAlign: "right",
          userSelect: "none",
        }}
      >
        {index}
      </span>
      <div
        style={{
          minWidth: 80,
          height: 30,
          padding: "0 8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: MONO,
          fontSize: 12,
          fontWeight: isChanged ? 700 : 500,
          color: isChanged ? V.accent : V.text,
          background: isChanged ? V.accentDim : V.elevated,
          border: `1px solid ${isChanged ? V.accentMid : V.border}`,
          boxShadow: isChanged ? `0 0 8px ${V.accentDim}` : "none",
          transition: "background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease",
        }}
        title={value}
      >
        {value}
      </div>
    </div>
  );
}

function EmptyPlaceholder() {
  return (
    <span
      style={{
        fontFamily: MONO,
        fontSize: 11,
        color: V.dim,
        fontStyle: "italic",
      }}
    >
      empty
    </span>
  );
}

/**
 * Normalize `data.items` into a display-string array, tolerating malformed
 * input. Returns an empty array for anything that isn't an items array.
 *
 * @param {*} data
 * @returns {string[]}
 */
function normalizeItems(data) {
  const items = data?.items;
  if (!Array.isArray(items)) return [];
  return items.map((item) => toCellString(item));
}

/**
 * Coerce a cell value into a display string without throwing.
 *
 * @param {*} value
 * @returns {string}
 */
function toCellString(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  try {
    return String(value);
  } catch {
    return "";
  }
}
