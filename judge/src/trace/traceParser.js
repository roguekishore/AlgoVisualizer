/**
 * Trace event parsing for the Code Flow Visualizer.
 *
 * This module turns the two raw artifacts of a trace run into the structured
 * shapes the frontend consumes:
 *
 * - `tokenizeInput(input)` splits the forwarded stdin into ordered
 *   `InputToken`s (Requirement 6.1).
 * - `parseTraceEvents(rawEvents, blockTree, stepCap)` parses the NDJSON event
 *   stream emitted by the instrumented build into an ordered, capped list of
 *   `TraceStep`s (Algorithm 3 in design.md; Requirements 3.1-3.5).
 *
 * Both functions are pure and side-effect free so they can be unit- and
 * property-tested in isolation.
 *
 * @typedef {import('./types').BlockNode} BlockNode
 * @typedef {import('./types').TraceStep} TraceStep
 * @typedef {import('./types').VarSnapshot} VarSnapshot
 * @typedef {import('./types').InputToken} InputToken
 */

/**
 * Tokenize the forwarded stdin into `InputToken`s.
 *
 * Tokens are the whitespace-separated units of the input stream (the unit a
 * program typically consumes per `cin >>` / `Scanner.next*`). Each token is
 * assigned a contiguous index starting at 0 and an initially-null
 * `consumedAtStep`; linking to the step that read it happens later in
 * `linkConsumedTokens`.
 *
 * Postconditions:
 * - Returned tokens have `index` values contiguous from 0.
 * - Every token's `consumedAtStep === null`.
 *
 * @param {string} input - The raw stdin forwarded to the program.
 * @returns {InputToken[]} Ordered input tokens.
 */
function tokenizeInput(input) {
  if (typeof input !== "string" || input.length === 0) {
    return [];
  }

  // Split on any run of whitespace and drop empty fragments produced by
  // leading/trailing/repeated separators.
  const rawTokens = input.split(/\s+/).filter((t) => t.length > 0);

  return rawTokens.map((raw, index) => ({
    index,
    raw,
    consumedAtStep: null,
  }));
}

/**
 * Link each input token to the step index that consumed it.
 *
 * Input is consumed sequentially: the first whitespace-separated unit read by
 * the program corresponds to the first `InputToken`, the second to the second,
 * and so on. Walking the steps in index order, every step carrying an
 * `inputConsumed` payload reads one or more whitespace-separated units; each
 * such unit is matched positionally to the next not-yet-consumed token, whose
 * `consumedAtStep` is set to that step's index. Tokens that are never read keep
 * `consumedAtStep === null` (Requirements 6.2, 6.3).
 *
 * This function is pure: it returns a fresh array of fresh token objects and
 * never mutates the `tokens` or `steps` arguments, matching the side-effect-free
 * style of the rest of this module.
 *
 * Postconditions:
 * - Returned array has the same length and `index`/`raw` values as `tokens`.
 * - Every `consumedAtStep` is either null or a valid `steps[i].index`.
 * - Tokens are consumed in order; a token's `consumedAtStep` is non-decreasing
 *   with its `index`.
 *
 * @param {InputToken[]} tokens - Ordered input tokens (e.g. from `tokenizeInput`).
 * @param {TraceStep[]} steps - Ordered, parsed trace steps.
 * @returns {InputToken[]} New input tokens with `consumedAtStep` linked.
 */
function linkConsumedTokens(tokens, steps) {
  // Copy tokens so callers' arrays/objects are never mutated.
  const linked = Array.isArray(tokens)
    ? tokens.map((t) => ({ ...t, consumedAtStep: null }))
    : [];

  if (linked.length === 0 || !Array.isArray(steps)) {
    return linked;
  }

  let cursor = 0; // next unconsumed token index

  for (const step of steps) {
    if (cursor >= linked.length) {
      break; // every token already linked
    }
    if (!step || step.inputConsumed == null) {
      continue;
    }

    // A single step may read several whitespace-separated units at once.
    const units = String(step.inputConsumed)
      .split(/\s+/)
      .filter((u) => u.length > 0);

    for (let u = 0; u < units.length && cursor < linked.length; u += 1) {
      linked[cursor].consumedAtStep = step.index;
      cursor += 1;
    }
  }

  return linked;
}

/**
 * Collect every block id present in a block tree into a Set.
 *
 * @param {(BlockNode|null)} blockTree - Root block node (or null).
 * @returns {Set<string>} Set of all block ids in the tree.
 */
function collectIds(blockTree) {
  const ids = new Set();
  if (!blockTree) {
    return ids;
  }

  const stack = [blockTree];
  while (stack.length > 0) {
    const node = stack.pop();
    if (!node || typeof node !== "object") {
      continue;
    }
    if (typeof node.id === "string") {
      ids.add(node.id);
    }
    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        stack.push(child);
      }
    }
  }
  return ids;
}

/**
 * Parse a single NDJSON line into an object, returning null on any failure.
 *
 * @param {string} line - A single (already trimmed) NDJSON line.
 * @returns {(Object|null)} The parsed object, or null when malformed.
 */
function safeParseJson(line) {
  try {
    const parsed = JSON.parse(line);
    // Only object events are usable; primitives/arrays are treated as malformed.
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    return parsed;
  } catch (_err) {
    return null;
  }
}

/**
 * The set of structured render-kinds a `view` may legitimately carry. A raw
 * `view` whose `kind` is not in this set is treated as malformed and dropped
 * (the frontend `toValueModel` then falls back to a scalar view).
 *
 * @type {Set<string>}
 */
const VALID_VIEW_KINDS = new Set([
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
 * Defensively parse a raw event variable's `view` into a `{ kind, data }`
 * shape. Returns undefined for a missing or malformed view (no `kind`, or an
 * unrecognized `kind`), in which case the snapshot is left view-less and the
 * frontend degrades to a scalar rendering (Requirement 3.5 / R10).
 *
 * @param {*} rawView - The event variable's raw `view` field.
 * @returns {({ kind: string, data: * }|undefined)} A normalized view or undefined.
 */
function parseView(rawView) {
  if (!rawView || typeof rawView !== "object" || Array.isArray(rawView)) {
    return undefined;
  }
  if (typeof rawView.kind !== "string" || !VALID_VIEW_KINDS.has(rawView.kind)) {
    return undefined;
  }
  return { kind: rawView.kind, data: rawView.data };
}

/**
 * Derive the back-compat `value` string from a structured view, used both for
 * the legacy `value` field and for the whole-variable `changed` comparison.
 *
 * Scalars/strings pass through verbatim; every other kind is serialized to a
 * stable JSON form so any element change is reflected in the string (which in
 * turn drives the whole-variable `changed` flag).
 *
 * @param {({ kind: string, data: * }|undefined)} view - A normalized view.
 * @returns {string} A stable string summary of the view's data.
 */
function viewToValue(view) {
  if (!view) {
    return "";
  }
  if (view.kind === "scalar" || view.kind === "string") {
    return view.data != null ? String(view.data) : "";
  }
  try {
    return JSON.stringify(view.data);
  } catch (_err) {
    return String(view.data);
  }
}

/**
 * Stable element equality used by the per-element diff helpers. Comparing the
 * JSON form tolerates `undefined` (a missing element on either side) and any
 * primitive/array element shape produced by the instrumentation.
 *
 * @param {*} a - First element.
 * @param {*} b - Second element.
 * @returns {boolean} True when the two elements are considered equal.
 */
function elementsEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Extract the linear item list from a stack/queue view's data. Both the C++
 * and Java runtimes wrap these in `{ items: [...] }`; tolerate a bare array
 * too. Stack items are ordered bottom..top, queue items front..back.
 *
 * @param {*} data - A stack/queue view's `data`.
 * @returns {Array<*>} The item list (empty when shape is unexpected).
 */
function itemsOf(data) {
  if (data && typeof data === "object" && Array.isArray(data.items)) {
    return data.items;
  }
  return Array.isArray(data) ? data : [];
}

/**
 * Indices `"i"` in `cur` whose element differs from `prev`. Used for the
 * linear kinds (`array1d`, `list`, `set`). Only positions present in `cur`
 * are reported, so every emitted key names a current element (diff soundness).
 *
 * @param {Array<*>} cur - Current element list.
 * @param {Array<*>} prev - Previous element list.
 * @returns {string[]} Changed index keys.
 */
function diffArray1d(cur, prev) {
  const a = Array.isArray(cur) ? cur : [];
  const b = Array.isArray(prev) ? prev : [];
  const keys = [];
  for (let i = 0; i < a.length; i += 1) {
    if (!elementsEqual(a[i], b[i])) {
      keys.push(String(i));
    }
  }
  return keys;
}

/**
 * Grid cell keys `"r,c"` in `cur` whose element differs from `prev`.
 *
 * @param {Array<Array<*>>} cur - Current grid.
 * @param {Array<Array<*>>} prev - Previous grid.
 * @returns {string[]} Changed cell keys.
 */
function diffArray2d(cur, prev) {
  const a = Array.isArray(cur) ? cur : [];
  const b = Array.isArray(prev) ? prev : [];
  const keys = [];
  for (let r = 0; r < a.length; r += 1) {
    const row = Array.isArray(a[r]) ? a[r] : [];
    const prevRow = Array.isArray(b[r]) ? b[r] : [];
    for (let c = 0; c < row.length; c += 1) {
      if (!elementsEqual(row[c], prevRow[c])) {
        keys.push(`${r},${c}`);
      }
    }
  }
  return keys;
}

/**
 * `"front"`/`"back"` keys for an ordered (front..back) item list whose
 * corresponding end element differs from the previous step. Used for queues
 * and deques.
 *
 * @param {Array<*>} cur - Current item list (front..back).
 * @param {Array<*>} prev - Previous item list (front..back).
 * @returns {string[]} Some subset of `["front", "back"]`.
 */
function diffEnds(cur, prev) {
  const a = Array.isArray(cur) ? cur : [];
  const b = Array.isArray(prev) ? prev : [];
  const keys = [];
  if (a.length > 0 && !elementsEqual(a[0], b[0])) {
    keys.push("front");
  }
  if (a.length > 0 && !elementsEqual(a[a.length - 1], b[b.length - 1])) {
    keys.push("back");
  }
  return keys;
}

/**
 * `"top"` key for a stack (items ordered bottom..top) whose top element
 * differs from the previous step.
 *
 * @param {Array<*>} cur - Current item list (bottom..top).
 * @param {Array<*>} prev - Previous item list (bottom..top).
 * @returns {string[]} `["top"]` when the top changed, else `[]`.
 */
function diffStackTop(cur, prev) {
  const a = Array.isArray(cur) ? cur : [];
  const b = Array.isArray(prev) ? prev : [];
  if (a.length > 0 && !elementsEqual(a[a.length - 1], b[b.length - 1])) {
    return ["top"];
  }
  return [];
}

/**
 * Changed map keys: every key present in `cur` that is absent from `prev` or
 * whose value differs. Keys removed since the previous step are not reported,
 * keeping each emitted key tied to a current entry (diff soundness).
 *
 * @param {Array<{key: *, value: *}>} cur - Current entries.
 * @param {Array<{key: *, value: *}>} prev - Previous entries.
 * @returns {string[]} Changed map keys (stringified).
 */
function diffMap(cur, prev) {
  const a = Array.isArray(cur) ? cur : [];
  const b = Array.isArray(prev) ? prev : [];
  const prevByKey = new Map();
  for (const entry of b) {
    if (entry && typeof entry === "object") {
      prevByKey.set(String(entry.key), entry.value);
    }
  }
  const keys = [];
  for (const entry of a) {
    if (!entry || typeof entry !== "object") {
      continue;
    }
    const key = String(entry.key);
    if (!prevByKey.has(key) || !elementsEqual(prevByKey.get(key), entry.value)) {
      keys.push(key);
    }
  }
  return keys;
}

/**
 * Compute the element-level keys that changed between two views of the same
 * kind (R11). Returns an empty array when there is no comparable previous view
 * (a brand-new variable or a kind change), or for kinds that carry no
 * per-element granularity (`scalar`, `string`, `object`) — in those cases the
 * whole-variable `changed` flag already conveys the change.
 *
 * @param {({ kind: string, data: * }|undefined)} curView - Current view.
 * @param {({ kind: string, data: * }|undefined)} prevView - Previous view.
 * @returns {string[]} The changed element keys (see `VarView.changedKeys`).
 */
function diffViewKeys(curView, prevView) {
  if (!curView || !prevView || curView.kind !== prevView.kind) {
    return [];
  }
  switch (curView.kind) {
    case "array1d":
    case "list":
    case "set":
      return diffArray1d(curView.data, prevView.data);
    case "array2d":
      return diffArray2d(curView.data, prevView.data);
    case "deque":
      return diffEnds(curView.data, prevView.data);
    case "queue":
      return diffEnds(itemsOf(curView.data), itemsOf(prevView.data));
    case "stack":
      return diffStackTop(itemsOf(curView.data), itemsOf(prevView.data));
    case "map":
      return diffMap(curView.data, prevView.data);
    default:
      return []; // scalar, string, object: whole-variable `changed` suffices.
  }
}

/**
 * Normalize a raw event's variable list into `VarSnapshot`s, computing each
 * variable's `changed` flag relative to the previously stored step and, when a
 * structured `view` is present, its element-level `changedKeys` (R10, R11).
 *
 * A variable is considered changed when it did not appear (by name + scope) in
 * the previous step, or when its stringified value differs from the previous
 * step's value for the same variable. The legacy `value` field is preserved for
 * back-compat: it is taken verbatim from the event when present, otherwise
 * derived from the structured `view`.
 *
 * For variables carrying a `view`, `view.changedKeys` lists the elements whose
 * value differs from the previous step's view of the same variable (changed
 * array indices `"i"`, grid cells `"r,c"`, stack `"top"`, queue/deque
 * `"front"`/`"back"`, or changed map keys). It is empty for brand-new variables,
 * kind changes, and scalar/string/object kinds.
 *
 * @param {Array<Object>|undefined} rawVars - The event's `vars` array.
 * @param {TraceStep[]} steps - The steps stored so far (previous is last).
 * @returns {VarSnapshot[]} Normalized variable snapshots.
 */
function normalizeVars(rawVars, steps) {
  if (!Array.isArray(rawVars)) {
    return [];
  }

  const prevStep = steps.length > 0 ? steps[steps.length - 1] : null;
  const prevVars = prevStep && Array.isArray(prevStep.vars) ? prevStep.vars : [];

  // Index previous vars by "scope\u0000name" for stable lookup.
  const prevByKey = new Map();
  for (const pv of prevVars) {
    prevByKey.set(`${pv.scope}\u0000${pv.name}`, pv);
  }

  return rawVars.map((v) => {
    const name = v && v.name != null ? String(v.name) : "";
    const type = v && v.type != null ? String(v.type) : "";
    const scope = v && v.scope != null ? String(v.scope) : "";
    const view = parseView(v && v.view);

    // Back-compat `value`: prefer an explicit event value, otherwise derive it
    // from the structured view so the whole-variable diff stays meaningful.
    let value;
    if (v && v.value != null) {
      value = String(v.value);
    } else if (view) {
      value = viewToValue(view);
    } else {
      value = "";
    }

    const prev = prevByKey.get(`${scope}\u0000${name}`);
    const changed = prev === undefined || prev.value !== value;

    /** @type {VarSnapshot} */
    const snapshot = { name, type, value, scope, changed };

    if (view) {
      const changedKeys = prev ? diffViewKeys(view, prev.view) : [];
      snapshot.view = { kind: view.kind, data: view.data, changedKeys };
    }

    return snapshot;
  });
}

/**
 * Parse the raw NDJSON trace-event stream into an ordered, capped list of
 * `TraceStep`s (Algorithm 3).
 *
 * Blank lines, malformed JSON, and events referencing an unknown block id are
 * skipped defensively without throwing (Requirement 3.5). Stored steps receive
 * contiguous 0-based indices (Requirement 3.2). At most `stepCap` steps are
 * stored, while every valid event still increments `totalSteps` so truncation
 * can be reported honestly (Requirement 3.4).
 *
 * Postconditions:
 * - `steps.length === min(totalSteps, stepCap)`.
 * - `steps[i].index === i` for all i.
 * - Every `steps[i].blockId` exists in `blockTree`.
 * - `totalSteps >= steps.length`.
 *
 * @param {string} rawEvents - Newline-delimited JSON trace events.
 * @param {(BlockNode|null)} blockTree - The block tree for the same source.
 * @param {number} stepCap - Maximum number of steps to store.
 * @returns {{ steps: TraceStep[], totalSteps: number }}
 */
function parseTraceEvents(rawEvents, blockTree, stepCap) {
  const validIds = collectIds(blockTree);
  /** @type {TraceStep[]} */
  const steps = [];
  let totalSteps = 0;
  /** @type {Map<string, number>} */
  const loopIterCounts = new Map();

  const cap = Number.isFinite(stepCap) && stepCap > 0 ? stepCap : 0;

  if (typeof rawEvents !== "string" || rawEvents.length === 0) {
    return { steps, totalSteps };
  }

  const lines = rawEvents.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.length === 0) {
      continue; // skip blank lines
    }

    const ev = safeParseJson(line);
    // Defensive: drop malformed events and events for unknown blocks.
    if (ev === null || typeof ev.blockId !== "string" || !validIds.has(ev.blockId)) {
      continue;
    }

    totalSteps += 1;

    // Count beyond the cap but do not store.
    if (steps.length >= cap) {
      continue;
    }

    if (ev.kind === "iterate") {
      loopIterCounts.set(ev.blockId, (loopIterCounts.get(ev.blockId) || 0) + 1);
    }

    /** @type {TraceStep} */
    const step = {
      index: steps.length,
      blockId: ev.blockId,
      line: ev.line,
      kind: ev.kind,
      vars: normalizeVars(ev.vars, steps),
    };

    if (ev.kind === "iterate") {
      step.iteration = loopIterCounts.get(ev.blockId);
    }
    if (ev.out !== undefined && ev.out !== null) {
      step.stdoutDelta = ev.out;
    }
    if (ev.in !== undefined && ev.in !== null) {
      step.inputConsumed = ev.in;
    }

    steps.push(step);
  }

  return { steps, totalSteps };
}

module.exports = {
  tokenizeInput,
  parseTraceEvents,
  linkConsumedTokens,
  // Exported for unit tests and reuse by sibling trace modules.
  collectIds,
};
