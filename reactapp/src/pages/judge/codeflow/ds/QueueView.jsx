import React from "react";
import { V, MONO } from "../../../../components/visualizer/theme";

/**
 * QueueView — horizontal FIFO queue / deque renderer for the Code Flow dry-run
 * window.
 *
 * Renders a `queue` or `deque` value model as a horizontal row of cells, with
 * the **front** of the queue on the left and the **back** on the right, each
 * marked with a `FRONT` / `BACK` label. The cell(s) at a changed end are
 * highlighted with the acid-yellow accent so element-level changes between
 * steps are visible (Requirements R10–R12).
 *
 * `data` follows the value-model convention for queues/deques:
 *   `{ items: string[], front?: number, back?: number }`
 * where `items[0]` is the front and `items[items.length - 1]` is the back
 * unless explicit `front` / `back` indices are supplied. `changedKeys` carry
 * the symbolic keys `"front"` and/or `"back"` for the end(s) that changed.
 *
 * The component degrades gracefully on malformed data: a missing/invalid
 * `data.items` renders an empty placeholder rather than throwing.
 *
 * @typedef {import("../valueModel").ValueModel} ValueModel
 *
 * @param {Object} props
 * @param {ValueModel} props.model - value model (kind `queue` or `deque`)
 */
export default function QueueView({ model }) {
  const data = model?.data;
  const changedKeys = Array.isArray(model?.changedKeys) ? model.changedKeys : [];
  const changed = new Set(changedKeys);

  const items = normalizeItems(data);

  if (items.length === 0) {
    return <EmptyPlaceholder />;
  }

  // Resolve front/back indices, defaulting to the ends of the items array.
  const frontIndex =
    typeof data?.front === "number" && data.front >= 0 && data.front < items.length
      ? data.front
      : 0;
  const backIndex =
    typeof data?.back === "number" && data.back >= 0 && data.back < items.length
      ? data.back
      : items.length - 1;

  const frontChanged = changed.has("front");
  const backChanged = changed.has("back");

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
      {items.map((value, index) => {
        const isFront = index === frontIndex;
        const isBack = index === backIndex;
        const isChanged = (isFront && frontChanged) || (isBack && backChanged);

        // Compose the end label shown beneath the cell.
        let label = "";
        if (isFront && isBack) label = "F/B";
        else if (isFront) label = "FRONT";
        else if (isBack) label = "BACK";

        return (
          <Cell
            key={index}
            index={index}
            value={value}
            isChanged={isChanged}
            label={label}
          />
        );
      })}
    </div>
  );
}

/**
 * A single queue cell: index label on top, value box, optional end marker
 * (`FRONT` / `BACK`) below.
 *
 * @param {Object} props
 * @param {number} props.index
 * @param {string} props.value
 * @param {boolean} props.isChanged
 * @param {string} props.label
 */
function Cell({ index, value, isChanged, label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      {/* index label */}
      <span
        style={{
          fontFamily: MONO,
          fontSize: 9,
          color: V.dim,
          height: 11,
          lineHeight: "11px",
          userSelect: "none",
        }}
      >
        {index}
      </span>

      {/* value box */}
      <div
        style={{
          minWidth: 34,
          height: 34,
          padding: "0 6px",
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

      {/* end marker */}
      <span
        style={{
          fontFamily: MONO,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.12em",
          height: 13,
          lineHeight: "13px",
          color: label ? V.accent : "transparent",
          userSelect: "none",
        }}
      >
        {label || "."}
      </span>
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
