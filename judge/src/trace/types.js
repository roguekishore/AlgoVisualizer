/**
 * Shared JSDoc typedefs for the trace pipeline (Code Flow Visualizer).
 *
 * These typedefs describe the plain, JSON-serializable data structures that
 * cross module and process boundaries (structural pass, instrumentation,
 * trace parsing, the tracer orchestrator, and the `/api/trace` response).
 * They are documentation-only: this module exports no runtime values and exists
 * so other modules can `@typedef`-reference these shapes via
 * `import('./types').BlockNode` in their JSDoc.
 *
 * The shapes mirror the Data Models / Interfaces sections of the design doc.
 */

/**
 * Supported languages for tracing.
 * @typedef {("cpp"|"java")} Language
 */

/**
 * The kind of construct a block represents.
 * @typedef {(
 *   "program"     |
 *   "function"    |
 *   "loop"        |
 *   "conditional" |
 *   "declaration" |
 *   "assignment"  |
 *   "call"        |
 *   "io"          |
 *   "return"      |
 *   "block"
 * )} BlockType
 */

/**
 * A precise, 1-based source span.
 * @typedef {Object} SourceRange
 * @property {number} startLine - 1-based start line, inclusive.
 * @property {number} startCol  - 1-based start column.
 * @property {number} endLine   - 1-based end line, inclusive.
 * @property {number} endCol    - 1-based end column.
 */

/**
 * A node in the structural block tree.
 *
 * Validation rules:
 * - `id` is unique across the tree.
 * - `sourceRange.startLine <= sourceRange.endLine`.
 * - A child's `sourceRange` is contained within its parent's `sourceRange`.
 * - Exactly one node has `type === "program"` and `parentId === null`.
 *
 * @typedef {Object} BlockNode
 * @property {string} id                 - Stable, unique id (e.g. "b12").
 * @property {BlockType} type            - The block's construct kind.
 * @property {string} label              - Short human label (e.g. "for (i = 0; i < n; i++)").
 * @property {SourceRange} sourceRange   - The block's source span.
 * @property {(string|null)} parentId    - Parent block id, or null for the program root.
 * @property {BlockNode[]} children      - Nested child blocks.
 */

/**
 * The kind of execution event a trace step represents.
 * @typedef {(
 *   "enter"   |
 *   "exit"    |
 *   "iterate" |
 *   "assign"  |
 *   "read"    |
 *   "write"   |
 *   "call"    |
 *   "return"
 * )} StepKind
 */

/**
 * The structured render-kind of a captured variable value. Drives which
 * graphic renderer the frontend dry-run window selects.
 * @typedef {(
 *   "scalar"  |
 *   "string"  |
 *   "array1d" |
 *   "array2d" |
 *   "stack"   |
 *   "queue"   |
 *   "deque"   |
 *   "list"    |
 *   "set"     |
 *   "map"     |
 *   "object"
 * )} ViewKind
 */

/**
 * A structured, render-ready view of a variable's value (Requirement R10).
 *
 * `data` is kind-specific:
 * - `scalar` / `string` → `string`
 * - `array1d`           → `string[]`
 * - `array2d`           → `string[][]`
 * - `stack`             → `{ items: string[], top: number }`   (top = last index)
 * - `queue` / `deque`   → `{ items: string[], front: number, back: number }`
 * - `list`              → `string[]`
 * - `set`               → `string[]`
 * - `map`               → `{ key: string, value: string }[]`
 * - `object`            → `{ key: string, value: string }[]`   (best-effort fields)
 *
 * @typedef {Object} VarView
 * @property {ViewKind} kind        - Structured render kind.
 * @property {*} data               - Kind-specific data (see above).
 * @property {string[]} [changedKeys] - Element keys changed vs. the previous step
 *   (array index "i", grid cell "r,c", "top"/"front"/"back", or changed map keys).
 */

/**
 * A snapshot of a single variable visible after a step.
 * @typedef {Object} VarSnapshot
 * @property {string} name    - Variable name.
 * @property {string} type    - Best-effort type (e.g. "int", "String", "vector<int>").
 * @property {string} value   - Stringified value (arrays/objects summarized).
 * @property {string} scope   - Owning blockId or function name.
 * @property {boolean} changed - Whether it changed vs. the previous step.
 * @property {VarView} [view] - Structured render view for graphic visualization
 *   (Requirement R10). Absent for legacy/text-only events; the frontend
 *   `toValueModel` falls back to a `scalar` view in that case.
 */

/**
 * A single recorded execution event.
 *
 * Validation rules:
 * - `index` values are contiguous starting at 0.
 * - `blockId` references an existing `BlockNode.id`.
 * - `line` lies within the referenced block's `sourceRange`.
 * - `iteration` is present only when the block is a `loop`.
 *
 * @typedef {Object} TraceStep
 * @property {number} index               - 0-based ordinal within steps[].
 * @property {string} blockId             - Block this step belongs to.
 * @property {number} line                - 1-based source line executing.
 * @property {StepKind} kind              - The kind of event.
 * @property {VarSnapshot[]} vars         - Visible variables after this step.
 * @property {number} [iteration]         - 1-based loop iteration (loop blocks only).
 * @property {string} [stdoutDelta]       - Text written to stdout at this step.
 * @property {string} [inputConsumed]     - Token(s) read from stdin at this step.
 */

/**
 * A tokenized piece of the input stream, for the InputRibbon.
 *
 * Validation rules:
 * - `index` is contiguous from 0.
 *
 * @typedef {Object} InputToken
 * @property {number} index                  - Position in the input stream (from 0).
 * @property {string} raw                    - The token text.
 * @property {(number|null)} consumedAtStep  - Step index that read it, or null if unused.
 */

/**
 * Fast line → block lookup for the editor → block direction.
 * Each line maps to the chain of block ids covering it, ordered outermost →
 * innermost (innermost last).
 *
 * @typedef {Object.<number, string[]>} SourceMap
 */

/**
 * The overall outcome of a trace request.
 * @typedef {(
 *   "OK"                  |
 *   "StaticOnly"          |
 *   "Compilation Error"   |
 *   "Runtime Error"       |
 *   "Time Limit Exceeded" |
 *   "Trace Error"
 * )} TraceStatus
 */

/**
 * Diagnostic metadata about a trace.
 * @typedef {Object} TraceMeta
 * @property {number} totalSteps  - Events emitted before capping.
 * @property {boolean} truncated  - True if steps were capped.
 * @property {number} stepCap     - The cap applied (e.g. 10000).
 * @property {number} timeMs      - Wall-clock execution time in ms.
 */

/**
 * The single payload returned by the tracer / `/api/trace`.
 *
 * Postconditions by status:
 * - "OK"         ⟹ blockTree !== null ∧ steps is a valid, contiguous sequence.
 * - "StaticOnly" ⟹ blockTree !== null ∧ steps === [].
 * - "Trace Error" ⟹ blockTree === null.
 *
 * @typedef {Object} TraceResult
 * @property {TraceStatus} status         - The trace outcome.
 * @property {Language} language          - The traced language.
 * @property {(BlockNode|null)} blockTree - Root block (program); null if parse failed.
 * @property {TraceStep[]} steps          - Ordered execution events (possibly capped).
 * @property {InputToken[]} inputTokens   - Tokenized stdin for the InputRibbon.
 * @property {SourceMap} [sourceMap]      - Line → block-id chain (outermost → innermost),
 *   used by the frontend editor → block highlight direction (Requirement 4.2).
 * @property {string} stdout              - Program output.
 * @property {TraceMeta} meta             - Diagnostic metadata.
 * @property {string} [error]             - Human-readable message when status !== "OK".
 */

/**
 * A trace request payload.
 * @typedef {Object} TraceRequest
 * @property {Language} language - Source language.
 * @property {string} code       - Source code.
 * @property {string} input      - stdin forwarded to the program.
 */

// Documentation-only module: no runtime exports.
module.exports = {};
