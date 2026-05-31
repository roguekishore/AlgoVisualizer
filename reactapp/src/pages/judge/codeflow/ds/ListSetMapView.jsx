import React from "react";
import { V, MONO } from "../../../../components/visualizer/theme";

/**
 * ListSetMapView — list / set / map renderer for the Code Flow dry-run window.
 *
 * Renders three related value-model kinds with a shared chip aesthetic
 * (Requirements R10–R12):
 *   - `list` / `set` → a wrapping row of value chips. For lists, each chip is
 *     prefixed with its index; sets are unordered so no index is shown.
 *   - `map`          → key→value rows, one per entry, with rows whose key
 *     appears in `changedKeys` highlighted with the acid-yellow accent.
 *
 * `data` follows the value-model convention:
 *   - `list` / `set` → `string[]`
 *   - `map`          → `{ key, value }[]`
 *
 * `changedKeys` carry:
 *   - `list` / `set` → changed element indices as `"i"`
 *   - `map`          → the changed map keys (matched against each entry's `key`)
 *
 * The component degrades gracefully on malformed data: a missing/invalid `data`
 * renders an empty placeholder rather than throwing.
 *
 * @typedef {import("../valueModel").ValueModel} ValueModel
 *
 * @param {Object} props
 * @param {ValueModel} props.model - value model (kind `list`, `set`, or `map`)
 */
export default function ListSetMapView({ model }) {
  const kind = model?.kind;
  const changedKeys = Array.isArray(model?.changedKeys) ? model.changedKeys : [];
  const changed = new Set(changedKeys);

  if (kind === "map") {
    return <MapRows data={model?.data} changed={changed} />;
  }

  return <ChipRow data={model?.data} kind={kind} changed={changed} />;
}

/**
 * Render a `list`/`set` as a wrapping row of value chips. Lists show the index
 * of each element; sets (unordered) omit the index. Elements whose index key
 * appears in `changed` get the accent highlight.
 *
 * @param {Object} props
 * @param {*} props.data           - expected `string[]`
 * @param {string} props.kind      - `list` or `set`
 * @param {Set<string>} props.changed
 */
function ChipRow({ data, kind, changed }) {
  const items = normalizeItems(data);

  if (items.length === 0) {
    return <EmptyPlaceholder />;
  }

  const showIndex = kind === "list";

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
      {items.map((value, index) => (
        <Chip
          key={index}
          index={showIndex ? index : null}
          value={value}
          isChanged={changed.has(String(index))}
        />
      ))}
    </div>
  );
}

/**
 * Render a `map` as key→value rows. A row is highlighted when its key is in
 * `changed`.
 *
 * @param {Object} props
 * @param {*} props.data           - expected `{ key, value }[]`
 * @param {Set<string>} props.changed
 */
function MapRows({ data, changed }) {
  const entries = normalizeEntries(data);

  if (entries.length === 0) {
    return <EmptyPlaceholder />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {entries.map(({ key, value }, i) => {
        const isChanged = changed.has(key);
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "2px 4px",
              borderRadius: 2,
              background: isChanged ? V.accentDim : "transparent",
              transition: "background 0.15s ease",
            }}
          >
            <KeyBox value={key} isChanged={isChanged} />
            <span
              style={{
                fontFamily: MONO,
                fontSize: 12,
                color: V.dim,
                userSelect: "none",
              }}
            >
              →
            </span>
            <ValueBox value={value} isChanged={isChanged} />
          </div>
        );
      })}
    </div>
  );
}

/**
 * A single list/set chip: optional index label + value.
 *
 * @param {Object} props
 * @param {number|null} props.index
 * @param {string} props.value
 * @param {boolean} props.isChanged
 */
function Chip({ index, value, isChanged }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        minHeight: 30,
        padding: "0 8px",
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
      {index != null && (
        <span
          style={{
            fontFamily: MONO,
            fontSize: 9,
            color: V.dim,
            userSelect: "none",
          }}
        >
          {index}
        </span>
      )}
      <span>{value}</span>
    </div>
  );
}

/**
 * The key half of a map row.
 *
 * @param {Object} props
 * @param {string} props.value
 * @param {boolean} props.isChanged
 */
function KeyBox({ value, isChanged }) {
  return (
    <div
      style={{
        minWidth: 44,
        height: 28,
        padding: "0 8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: MONO,
        fontSize: 12,
        fontWeight: 700,
        color: isChanged ? V.accent : V.text,
        background: V.elevated,
        border: `1px solid ${isChanged ? V.accentMid : V.border}`,
        transition: "color 0.15s ease, border 0.15s ease",
      }}
      title={value}
    >
      {value}
    </div>
  );
}

/**
 * The value half of a map row.
 *
 * @param {Object} props
 * @param {string} props.value
 * @param {boolean} props.isChanged
 */
function ValueBox({ value, isChanged }) {
  return (
    <div
      style={{
        minWidth: 44,
        height: 28,
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
 * Normalize list/set `data` into a display-string array, tolerating malformed
 * input. Returns an empty array for anything that isn't an array.
 *
 * @param {*} data
 * @returns {string[]}
 */
function normalizeItems(data) {
  if (!Array.isArray(data)) return [];
  return data.map((item) => toCellString(item));
}

/**
 * Normalize map `data` into `{ key, value }` display-string entries, tolerating
 * malformed input. Returns an empty array for anything that isn't an array of
 * entries.
 *
 * @param {*} data
 * @returns {{ key: string, value: string }[]}
 */
function normalizeEntries(data) {
  if (!Array.isArray(data)) return [];
  return data
    .filter((entry) => entry != null && typeof entry === "object")
    .map((entry) => ({
      key: toCellString(entry.key),
      value: toCellString(entry.value),
    }));
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
