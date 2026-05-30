import React from "react";
import { V, MONO } from "../../../../components/visualizer/theme";

/**
 * ArrayGrid — 1D / 2D array renderer for the Code Flow dry-run window.
 *
 * Renders an `array1d` value model as a horizontal row of indexed cells, and an
 * `array2d` model as a grid of cells with row/column indices. Cells whose key
 * appears in `changedKeys` are highlighted with the acid-yellow accent so
 * element-level changes between steps are visible (Requirements R10–R12).
 *
 * `changedKeys` follow the value-model convention:
 *   - `array1d` → `"i"`   (a single column index)
 *   - `array2d` → `"r,c"` (row index, column index)
 *
 * Optional `pointers` place named markers (e.g. `i`, `j`) beneath/at the cells
 * they reference. Pointer targets use the same key convention as `changedKeys`.
 *
 * The component degrades gracefully on malformed data: a missing/invalid `data`
 * renders an empty placeholder rather than throwing.
 *
 * @typedef {import("../valueModel").ValueModel} ValueModel
 *
 * @param {Object} props
 * @param {ValueModel} props.model                 - value model (kind `array1d` or `array2d`)
 * @param {Record<string,string>} [props.pointers] - map of pointer label → cell key (e.g. `{ i: "2" }`, `{ j: "1,3" }`)
 */
export default function ArrayGrid({ model, pointers }) {
  const kind = model?.kind;
  const data = model?.data;
  const changedKeys = Array.isArray(model?.changedKeys) ? model.changedKeys : [];
  const changed = new Set(changedKeys);

  // Invert the optional pointers map into key → [labels] for quick lookup.
  const pointersByKey = buildPointerIndex(pointers);

  const is2d = kind === "array2d";
  const rows = normalizeRows(data, is2d);

  if (rows.length === 0) {
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {rows.map((cells, r) => (
        <div key={r} style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
          {/* row index (2D only) */}
          {is2d && (
            <span
              style={{
                fontFamily: MONO,
                fontSize: 9,
                color: V.dim,
                minWidth: 16,
                textAlign: "right",
                lineHeight: "34px",
                userSelect: "none",
              }}
            >
              {r}
            </span>
          )}

          {cells.map((value, c) => {
            const key = is2d ? `${r},${c}` : String(c);
            const isChanged = changed.has(key);
            const cellPointers = pointersByKey[key] || [];

            return (
              <Cell
                key={c}
                index={c}
                value={value}
                isChanged={isChanged}
                pointers={cellPointers}
                showColIndex={!is2d || r === 0}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

/**
 * A single array cell: index label on top, value box, optional pointer markers
 * below.
 *
 * @param {Object} props
 * @param {number} props.index
 * @param {string} props.value
 * @param {boolean} props.isChanged
 * @param {string[]} props.pointers
 * @param {boolean} props.showColIndex
 */
function Cell({ index, value, isChanged, pointers, showColIndex }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      {/* column index */}
      <span
        style={{
          fontFamily: MONO,
          fontSize: 9,
          color: V.dim,
          height: 11,
          lineHeight: "11px",
          userSelect: "none",
          visibility: showColIndex ? "visible" : "hidden",
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

      {/* pointer markers */}
      <div
        style={{
          display: "flex",
          gap: 3,
          height: 13,
          lineHeight: "13px",
        }}
      >
        {pointers.map((label) => (
          <span
            key={label}
            style={{
              fontFamily: MONO,
              fontSize: 10,
              fontWeight: 700,
              color: V.accent,
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Build a lookup of cell key → pointer labels from the optional `pointers` map.
 * Tolerates a missing or non-object `pointers` prop.
 *
 * @param {Record<string,string> | null | undefined} pointers
 * @returns {Record<string, string[]>}
 */
function buildPointerIndex(pointers) {
  /** @type {Record<string, string[]>} */
  const index = {};
  if (!pointers || typeof pointers !== "object") return index;

  for (const [label, key] of Object.entries(pointers)) {
    if (key == null) continue;
    const k = String(key);
    if (!index[k]) index[k] = [];
    index[k].push(label);
  }
  return index;
}

/**
 * Normalize `data` into a 2D array of display-string cells (`string[][]`),
 * regardless of whether the source is a 1D or 2D array. Returns an empty array
 * for malformed input.
 *
 * @param {*} data
 * @param {boolean} is2d
 * @returns {string[][]}
 */
function normalizeRows(data, is2d) {
  if (!Array.isArray(data)) return [];

  if (is2d) {
    return data
      .filter((row) => Array.isArray(row))
      .map((row) => row.map((cell) => toCellString(cell)));
  }

  // 1D → single row.
  return [data.map((cell) => toCellString(cell))];
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
