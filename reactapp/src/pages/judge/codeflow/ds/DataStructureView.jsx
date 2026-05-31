import React from "react";
import ArrayGrid from "./ArrayGrid";
import StackView from "./StackView";
import QueueView from "./QueueView";
import ListSetMapView from "./ListSetMapView";
import ScalarChip from "./ScalarChip";

/**
 * DataStructureView — renderer dispatcher for the Code Flow dry-run window.
 *
 * Selects the matching structured renderer for a value model based on its
 * `kind` and forwards the model through, keeping every concrete renderer
 * unaware of the others (Requirements R10, R12):
 *
 *   - `array1d` / `array2d` → {@link ArrayGrid}
 *   - `stack`               → {@link StackView}
 *   - `queue` / `deque`     → {@link QueueView}
 *   - `list` / `set` / `map`→ {@link ListSetMapView}
 *   - everything else       → {@link ScalarChip}
 *     (covers `scalar`, `string`, `object`, and any unknown/missing kind)
 *
 * The dispatcher is defensive: a missing or malformed `model` (and therefore a
 * missing `kind`) falls through to the `ScalarChip` default, which itself
 * degrades gracefully rather than throwing.
 *
 * Any extra props (e.g. `pointers` for {@link ArrayGrid}) are forwarded to the
 * selected renderer so callers can pass renderer-specific options through this
 * single entry point.
 *
 * @typedef {import("../valueModel").ValueModel} ValueModel
 *
 * @param {Object} props
 * @param {ValueModel} props.model - value model from `valueModel.js`
 */
export default function DataStructureView({ model, ...rest }) {
  switch (model?.kind) {
    case "array1d":
    case "array2d":
      return <ArrayGrid model={model} {...rest} />;

    case "stack":
      return <StackView model={model} {...rest} />;

    case "queue":
    case "deque":
      return <QueueView model={model} {...rest} />;

    case "list":
    case "set":
    case "map":
      return <ListSetMapView model={model} {...rest} />;

    // scalar / string / object / unknown / missing → scalar chip
    default:
      return <ScalarChip model={model} {...rest} />;
  }
}
