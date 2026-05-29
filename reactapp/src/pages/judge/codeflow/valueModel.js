/**
 * Value Model normalizer
 * Pure helper that converts a backend `VarSnapshot` into a render-ready value
 * model for the dry-run data-structure renderers. It has no React/DOM
 * dependencies so it can be unit-tested in isolation.
 *
 * The backend `VarSnapshot` shape (see `judge/src/trace/types.js` and
 * `traceParser.normalizeVars`) is:
 *   { name, type, scope, value, changed, view?: { kind, data, changedKeys } }
 *
 * The `view` may be absent (legacy/text-only events), have an unknown `kind`, or
 * be otherwise malformed. In all of those cases we degrade gracefully to a
 * `scalar` model built from the back-compat `value` string so the frontend can
 * always render something and never crashes (Requirement R10).
 *
 * @typedef {(
 *   "scalar"  | "string"  | "array1d" | "array2d" | "stack" | "queue" |
 *   "deque"   | "list"    | "set"     | "map"     | "object"
 * )} ViewKind
 *
 * @typedef {Object} ValueModel
 * @property {string} name           Variable name.
 * @property {string} type           Best-effort declared type.
 * @property {string} scope          Owning blockId or function name.
 * @property {ViewKind} kind         Structured render kind (defaults to "scalar").
 * @property {*} data                Kind-specific data (see types.js VarView).
 * @property {boolean} changed       Whether the whole variable changed this step.
 * @property {string[]} changedKeys  Element-level changed keys (may be empty).
 */

/**
 * The set of structured view kinds the renderers understand. Any other value
 * (or a missing view) falls back to "scalar".
 * @type {ReadonlySet<ViewKind>}
 */
const KNOWN_KINDS = new Set([
  "scalar",
  "string",
  "array1d",
  "array2d",
  "stack",
  "queue",
  "deque",
  "list",
  "set",
  "map",
  "object",
]);

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

/**
 * Normalize the `changedKeys` field into a plain `string[]`, tolerating missing
 * or malformed input.
 *
 * @param {*} changedKeys
 * @returns {string[]}
 */
function normalizeChangedKeys(changedKeys) {
  if (!Array.isArray(changedKeys)) return [];
  return changedKeys.map((key) => toDisplayString(key));
}

/**
 * Convert a backend `VarSnapshot` into a render-ready {@link ValueModel}.
 *
 * - When `view` is present with a known `kind`, the model uses `view.kind`,
 *   `view.data`, and `view.changedKeys`.
 * - When `view` is missing, has an unknown `kind`, or is otherwise malformed,
 *   the model degrades to a `scalar` whose `data` is the snapshot's back-compat
 *   `value` string and whose `changedKeys` is empty.
 * - `changed` always comes from the snapshot's whole-variable `changed` flag.
 *
 * This function never throws on garbled input.
 *
 * @param {Object | null | undefined} varSnapshot the backend VarSnapshot
 * @returns {ValueModel} a render-ready value model
 */
export function toValueModel(varSnapshot) {
  const snapshot = varSnapshot && typeof varSnapshot === "object" ? varSnapshot : {};

  const name = toDisplayString(snapshot.name);
  const type = toDisplayString(snapshot.type);
  const scope = toDisplayString(snapshot.scope);
  const changed = snapshot.changed === true;

  const view = snapshot.view;
  const hasValidView =
    view != null &&
    typeof view === "object" &&
    typeof view.kind === "string" &&
    KNOWN_KINDS.has(view.kind);

  if (hasValidView) {
    return {
      name,
      type,
      scope,
      kind: /** @type {ViewKind} */ (view.kind),
      data: view.data,
      changed,
      changedKeys: normalizeChangedKeys(view.changedKeys),
    };
  }

  // Fallback: degrade to a scalar built from the back-compat `value` string so
  // rendering never crashes on missing/unknown/malformed views.
  return {
    name,
    type,
    scope,
    kind: "scalar",
    data: toDisplayString(snapshot.value),
    changed,
    changedKeys: [],
  };
}
