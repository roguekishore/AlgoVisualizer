/**
 * Instrumentation pass for the Code Flow Visualizer (task 5.1).
 *
 * `instrument(language, code, blockTree)` rewrites a user's C++/Java source so
 * that, at runtime, each tracked construct emits a structured NDJSON event on a
 * dedicated trace channel — **never on stdout**, so the program's observable
 * output stays byte-for-byte identical to the un-instrumented program
 * (Requirement 7.2 / Property 9: output purity).
 *
 * Two things are injected:
 *   1. A tiny trace-emitter helper (top of file for C++, an extra top-level
 *      class for Java) that writes one JSON object per line to **file
 *      descriptor 3** (falling back to the path in the `VANTAGE_TRACE_FILE`
 *      env var). The helper is guarded by a global event counter that hard-
 *      stops after `STEP_CAP` events, bounding both payload size and the
 *      instrumented program's runtime (Requirements 7.1, 7.3, 3.4).
 *   2. `emit(...)` probe statements at block boundaries (right after the `{`
 *      that opens a function / loop / conditional / block body) and at
 *      standalone assignment statements, each carrying
 *      `{ blockId, line, kind, vars }`.
 *
 * ── Design decisions (C++ vs Java instrumentation strategy) ──────────────────
 *
 * The probes are injected by *source-text splicing* driven by the static
 * `blockTree` (its 1-based `SourceRange`s are converted to character offsets
 * against the original `code`). This is deliberately conservative rather than a
 * full semantic AST rewrite, because the executor only needs probes at
 * positions that are guaranteed to remain *valid statement contexts*:
 *
 *   • Block boundaries: a probe is inserted immediately after the opening `{`
 *     of a braced body. That position is always a legal statement context in
 *     both languages, so the result always compiles. Brace-less single-statement
 *     bodies (e.g. `if (c) doIt();`) are intentionally skipped — they are rare
 *     in practice and unsafe to splice without rewriting.
 *
 *   • Assignments: a probe is inserted after the terminating `;` of a *standalone*
 *     assignment statement only. Assignments embedded in loop/conditional headers
 *     (e.g. the `i = 0` in `for (i = 0; ...)`) are excluded via a same-line-as-
 *     parent-header guard, since splicing a statement there would not compile.
 *
 *   • Output channel: C++ writes raw bytes to fd 3 via `write(3, ...)`; Java has
 *     no public handle for fd 3, so its helper opens `VANTAGE_TRACE_FILE` (set by
 *     the executor) and falls back to `/proc/self/fd/3` on Linux sandboxes. Both
 *     are independent of stdout, preserving output purity. If the channel is not
 *     open at runtime, writes fail silently and the program still runs cleanly.
 *
 *   • Variable snapshots: each probe captures the *values* of the variables in
 *     scope (and already declared) at its line via the lexical-scope model
 *     (`collectScopeVariables`/`variablesInScopeAt`). The generated runtime
 *     (`__vtrace` for C++, `__VTrace` for Java) serializes each value into a
 *     `{ kind, data }` view tagged with its `view.kind`, emitted as the event's
 *     `vars` JSON array. An empty scope yields `"vars":[]`; the downstream
 *     parser (`traceParser.normalizeVars`) tolerates either form.
 *
 * The function is pure: it returns a new `{ source, probeCount }` and never
 * mutates its inputs. `probeCount` is exposed for sanity checks (the tracer can
 * distinguish an instrumentation defect from a genuine user compile error).
 *
 * @typedef {import('./types').BlockNode} BlockNode
 * @typedef {import('./types').Language} Language
 */

const { STEP_CAP } = require("./constants");
const {
  collectScopeVariables,
  variablesInScopeAt,
} = require("./scopeModel");

/**
 * The result of instrumenting a source file.
 * @typedef {Object} InstrumentResult
 * @property {string} source     - Instrumented, compilable source.
 * @property {number} probeCount - Number of injected `emit` probes.
 */

/**
 * Block types whose braced body receives an `enter` boundary probe.
 * @type {Set<string>}
 */
const BOUNDARY_TYPES = new Set(["function", "loop", "conditional", "block"]);

// ─────────────────────────────────────────────────────────────────────────────
// Source-position utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Precompute the absolute character offset at which each 1-based line starts.
 *
 * @param {string} code - The source text.
 * @returns {number[]} `lineStart[n]` = offset of the first char of line `n+1`.
 */
function computeLineStarts(code) {
  const starts = [0];
  for (let i = 0; i < code.length; i += 1) {
    if (code[i] === "\n") {
      starts.push(i + 1);
    }
  }
  return starts;
}

/**
 * Convert a 1-based (line, column) position into an absolute character offset.
 *
 * @param {number[]} lineStarts - Output of {@link computeLineStarts}.
 * @param {number} line - 1-based line.
 * @param {number} col - 1-based column.
 * @param {number} codeLength - Length of the source (offset clamp).
 * @returns {number} A clamped absolute offset in `[0, codeLength]`.
 */
function offsetOf(lineStarts, line, col, codeLength) {
  const lineIdx = Math.max(0, Math.min(line - 1, lineStarts.length - 1));
  const base = lineStarts[lineIdx];
  const off = base + Math.max(0, col - 1);
  if (off < 0) return 0;
  if (off > codeLength) return codeLength;
  return off;
}

/**
 * Flatten a `BlockNode` tree into a list of `{ node, parent }` pairs (DFS).
 *
 * @param {(BlockNode|null)} root - The program root.
 * @returns {Array<{ node: BlockNode, parent: (BlockNode|null) }>}
 */
function flattenTree(root) {
  /** @type {Array<{ node: BlockNode, parent: (BlockNode|null) }>} */
  const out = [];
  if (!root || typeof root !== "object") {
    return out;
  }
  const stack = [{ node: root, parent: null }];
  while (stack.length > 0) {
    const entry = stack.pop();
    const { node } = entry;
    if (!node || typeof node !== "object") continue;
    out.push(entry);
    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        stack.push({ node: child, parent: node });
      }
    }
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Emitter helpers (the runtime trace channel)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build the C++ trace-emitter helper. Writes one NDJSON object per event to
 * file descriptor 3 and hard-stops after `cap` events.
 *
 * @param {number} cap - Event hard cap (STEP_CAP).
 * @returns {string} C++ source for the helper (terminated with a newline).
 */
function cppHelper(cap) {
  return `#include <cstdio>
#include <unistd.h>
#include <cstddef>
#include <string>
#include <sstream>
#include <type_traits>
#include <utility>
#include <iterator>
namespace __vtrace {
static long count = 0L;
static const long cap = ${cap}L;
static bool over_cap() { return count >= cap; }

// ── JSON string escaping ──
static std::string esc(const std::string& s) {
  std::string o; o.reserve(s.size() + 2);
  for (char c : s) {
    switch (c) {
      case '\\\\': o += "\\\\\\\\"; break;
      case '"':  o += "\\\\\\""; break;
      case '\\n': o += "\\\\n"; break;
      case '\\r': o += "\\\\r"; break;
      case '\\t': o += "\\\\t"; break;
      default:
        if ((unsigned char)c < 0x20) { char b[8]; snprintf(b,sizeof(b),"\\\\u%04x",(int)(unsigned char)c); o += b; }
        else o += c;
    }
  }
  return o;
}

// ── type detection (SFINAE) ──
template<class T, class = void> struct has_begin : std::false_type {};
template<class T> struct has_begin<T, std::void_t<decltype(std::begin(std::declval<T&>()))>> : std::true_type {};
template<class T, class = void> struct is_pair : std::false_type {};
template<class T> struct is_pair<T, std::void_t<decltype(std::declval<T&>().first), decltype(std::declval<T&>().second)>> : std::true_type {};
template<class T, class = void> struct is_streamable : std::false_type {};
template<class T> struct is_streamable<T, std::void_t<decltype(std::declval<std::ostream&>() << std::declval<T&>())>> : std::true_type {};
template<class T, class = void> struct has_pop : std::false_type {};
template<class T> struct has_pop<T, std::void_t<decltype(std::declval<T&>().pop())>> : std::true_type {};
template<class T, class = void> struct has_top : std::false_type {};
template<class T> struct has_top<T, std::void_t<decltype(std::declval<T&>().top())>> : std::true_type {};
// associative containers (set/map/unordered_*) expose a nested ::key_type
template<class T, class = void> struct has_key_type : std::false_type {};
template<class T> struct has_key_type<T, std::void_t<typename T::key_type>> : std::true_type {};
// deque/list expose push_front; vector does not
template<class T, class = void> struct has_push_front : std::false_type {};
template<class T> struct has_push_front<T, std::void_t<decltype(std::declval<T&>().push_front(std::declval<typename T::value_type>()))>> : std::true_type {};
// vector/deque/array offer random access via operator[]; list does not
template<class T, class = void> struct has_subscript : std::false_type {};
template<class T> struct has_subscript<T, std::void_t<decltype(std::declval<T&>()[(std::size_t)0])>> : std::true_type {};

// ── one inner element → a quoted JSON string ("\${value}") ──
template<class T>
std::string jval(const T& v) {
  std::ostringstream ss;
  if constexpr (is_streamable<T>::value) { ss << v; }
  else { ss << "<?>"; }
  return std::string("\\"") + esc(ss.str()) + "\\"";
}

// ── main value → {kind,data} JSON view ──
template<class T>
std::string repr(const T& v) {
  if constexpr (std::is_same<T, std::string>::value) {
    return std::string("{\\"kind\\":\\"string\\",\\"data\\":\\"") + esc(v) + "\\"}";
  } else if constexpr (has_pop<T>::value && has_top<T>::value && !has_begin<T>::value) {
    // stack: drain a copy, LIFO; reconstruct bottom..top order
    T c = v; std::string items; bool first = true;
    while (!c.empty()) { std::string e = jval(c.top()); items = first ? e : (e + "," + items); first = false; c.pop(); }
    return std::string("{\\"kind\\":\\"stack\\",\\"data\\":{\\"items\\":[") + items + "]}}";
  } else if constexpr (has_pop<T>::value && !has_begin<T>::value) {
    // queue: drain a copy, FIFO front..back
    T c = v; std::string items; bool first = true;
    while (!c.empty()) { if (!first) items += ","; first = false; items += jval(c.front()); c.pop(); }
    return std::string("{\\"kind\\":\\"queue\\",\\"data\\":{\\"items\\":[") + items + "]}}";
  } else if constexpr (has_begin<T>::value) {
    using V = typename std::decay<decltype(*std::begin(v))>::type;
    if constexpr (is_pair<V>::value) {
      std::string out = "{\\"kind\\":\\"map\\",\\"data\\":["; bool first = true;
      for (const auto& kv : v) { if (!first) out += ","; first = false; out += std::string("{\\"key\\":") + jval(kv.first) + ",\\"value\\":" + jval(kv.second) + "}"; }
      return out + "]}";
    } else if constexpr (has_begin<V>::value && !std::is_same<V, std::string>::value) {
      // 2D: container of containers
      std::string out = "{\\"kind\\":\\"array2d\\",\\"data\\":["; bool frow = true;
      for (const auto& row : v) {
        if (!frow) out += ","; frow = false; out += "["; bool fc = true;
        for (const auto& e : row) { if (!fc) out += ","; fc = false; out += jval(e); }
        out += "]";
      }
      return out + "]}";
    } else {
      // 1D linear/associative container → pick the precise view.kind.
      const char* kind;
      if constexpr (has_key_type<T>::value) { kind = "set"; }            // std::set / unordered_set
      else if constexpr (has_push_front<T>::value && has_subscript<T>::value) { kind = "deque"; } // std::deque
      else if constexpr (has_push_front<T>::value) { kind = "list"; }    // std::list
      else { kind = "array1d"; }                                          // std::vector and friends
      std::string out = std::string("{\\"kind\\":\\"") + kind + "\\",\\"data\\":["; bool first = true;
      for (const auto& e : v) { if (!first) out += ","; first = false; out += jval(e); }
      return out + "]}";
    }
  } else if constexpr (is_pair<T>::value) {
    return std::string("{\\"kind\\":\\"array1d\\",\\"data\\":[") + jval(v.first) + "," + jval(v.second) + "]}";
  } else if constexpr (is_streamable<T>::value) {
    std::ostringstream ss; ss << v;
    return std::string("{\\"kind\\":\\"scalar\\",\\"data\\":\\"") + esc(ss.str()) + "\\"}";
  } else {
    return std::string("{\\"kind\\":\\"scalar\\",\\"data\\":\\"<?>\\"}");
  }
}

// ── build one {name,type,view} variable entry for any T ──
template<class T>
std::string var(const char* name, const char* type, const T& v) {
  return std::string("{\\"name\\":\\"") + name + "\\",\\"type\\":\\"" + type
    + "\\",\\"scope\\":\\"\\",\\"view\\":" + repr(v) + "}";
}

// ── emit one event; vars is a pre-built JSON array fragment ──
static void emit(const char* blockId, int line, const char* kind, const std::string& vars) {
  if (over_cap()) return;
  count++;
  std::string s;
  s += "{\\"blockId\\":\\""; s += blockId;
  s += "\\",\\"line\\":"; s += std::to_string(line);
  s += ",\\"kind\\":\\""; s += kind;
  s += "\\",\\"vars\\":"; s += vars; s += "}\\n";
  ssize_t w = write(3, s.data(), s.size()); (void)w;
}
} // namespace __vtrace
`;
}

/**
 * Build the Java trace-emitter helper as a standalone (non-public) top-level
 * class. Opens `VANTAGE_TRACE_FILE` (set by the executor) or falls back to
 * `/proc/self/fd/3`, and hard-stops after `cap` events.
 *
 * The helper mirrors the C++ `__vtrace` runtime: a reflective `repr(Object)`
 * classifies each captured value into a `view.kind` (`scalar`, `string`,
 * `array1d`, `array2d`, `list`, `stack`, `queue`, `deque`, `set`, `map`) and
 * serializes it to JSON, `var(name,type,value)` wraps one variable entry, and
 * the 4-argument `emit(...)` writes one NDJSON event (carrying a pre-built
 * `vars` JSON-array string) to the trace channel only — never stdout
 * (Requirements R9, R10, 7.2).
 *
 * Interface-precedence note: `java.util.Stack` is checked before `List` (Stack
 * extends Vector implements List), and `List`/`Deque`/`Queue` are checked in
 * that order so a `LinkedList` (which implements all three) classifies as a
 * `list`, `ArrayDeque` as a `deque`, and a `PriorityQueue` as a `queue`.
 *
 * @param {number} cap - Event hard cap (STEP_CAP).
 * @returns {string} Java source for the helper class.
 */
function javaHelper(cap) {
  return `
class __VTrace {
  static long count = 0L;
  static final long CAP = ${cap}L;
  static java.io.OutputStream out = openChannel();
  static java.io.OutputStream openChannel() {
    try {
      String f = System.getenv("VANTAGE_TRACE_FILE");
      if (f == null || f.length() == 0) f = "/proc/self/fd/3";
      return new java.io.FileOutputStream(f, true);
    } catch (Throwable __t) { return null; }
  }

  // ── JSON string escaping ──
  static String esc(String s) {
    if (s == null) return "";
    StringBuilder o = new StringBuilder(s.length() + 2);
    for (int i = 0; i < s.length(); i++) {
      char c = s.charAt(i);
      switch (c) {
        case '\\\\': o.append("\\\\\\\\"); break;
        case '"': o.append("\\\\\\""); break;
        case '\\n': o.append("\\\\n"); break;
        case '\\r': o.append("\\\\r"); break;
        case '\\t': o.append("\\\\t"); break;
        default:
          if (c < 0x20) o.append(String.format("\\\\u%04x", (int) c));
          else o.append(c);
      }
    }
    return o.toString();
  }

  // best-effort scalar string of a value (top-level arrays are handled by repr)
  static String stringOf(Object v) {
    if (v == null) return "null";
    if (v instanceof char[]) return new String((char[]) v);
    if (v.getClass().isArray()) return arrayString(v);
    return String.valueOf(v);
  }

  // Arrays.deepToString-style rendering for an array appearing as an element
  static String arrayString(Object v) {
    int n = java.lang.reflect.Array.getLength(v);
    StringBuilder sb = new StringBuilder("[");
    for (int i = 0; i < n; i++) {
      if (i > 0) sb.append(", ");
      Object e = java.lang.reflect.Array.get(v, i);
      if (e != null && e.getClass().isArray()) sb.append(arrayString(e));
      else sb.append(String.valueOf(e));
    }
    return sb.append("]").toString();
  }

  // ── one inner element → a quoted JSON string ("\${value}") ──
  static String jval(Object v) {
    return "\\"" + esc(stringOf(v)) + "\\"";
  }

  static String joinIterable(Iterable<?> it) {
    StringBuilder out = new StringBuilder();
    boolean first = true;
    for (Object e : it) {
      if (!first) out.append(",");
      first = false;
      out.append(jval(e));
    }
    return out.toString();
  }

  // ── main value → {kind,data} JSON view ──
  static String repr(Object v) {
    if (v == null) return "{\\"kind\\":\\"scalar\\",\\"data\\":\\"null\\"}";
    if (v instanceof String) {
      return "{\\"kind\\":\\"string\\",\\"data\\":\\"" + esc((String) v) + "\\"}";
    }
    if (v instanceof Number || v instanceof Boolean || v instanceof Character) {
      return "{\\"kind\\":\\"scalar\\",\\"data\\":\\"" + esc(String.valueOf(v)) + "\\"}";
    }
    if (v.getClass().isArray()) {
      Class<?> comp = v.getClass().getComponentType();
      if (comp != null && comp.isArray()) {
        // 2D array: array of arrays
        StringBuilder out = new StringBuilder("{\\"kind\\":\\"array2d\\",\\"data\\":[");
        int rows = java.lang.reflect.Array.getLength(v);
        for (int r = 0; r < rows; r++) {
          if (r > 0) out.append(",");
          out.append("[");
          Object row = java.lang.reflect.Array.get(v, r);
          if (row != null) {
            int cols = java.lang.reflect.Array.getLength(row);
            for (int c = 0; c < cols; c++) {
              if (c > 0) out.append(",");
              out.append(jval(java.lang.reflect.Array.get(row, c)));
            }
          }
          out.append("]");
        }
        return out.append("]}").toString();
      }
      // 1D array (primitive or reference)
      StringBuilder out = new StringBuilder("{\\"kind\\":\\"array1d\\",\\"data\\":[");
      int n = java.lang.reflect.Array.getLength(v);
      for (int i = 0; i < n; i++) {
        if (i > 0) out.append(",");
        out.append(jval(java.lang.reflect.Array.get(v, i)));
      }
      return out.append("]}").toString();
    }
    if (v instanceof java.util.Map) {
      StringBuilder out = new StringBuilder("{\\"kind\\":\\"map\\",\\"data\\":[");
      boolean first = true;
      for (java.util.Map.Entry<?, ?> e : ((java.util.Map<?, ?>) v).entrySet()) {
        if (!first) out.append(",");
        first = false;
        out.append("{\\"key\\":").append(jval(e.getKey()))
           .append(",\\"value\\":").append(jval(e.getValue())).append("}");
      }
      return out.append("]}").toString();
    }
    if (v instanceof java.util.Stack) {
      // stack: index 0 is the bottom, last is the top → emit bottom..top
      java.util.Stack<?> st = (java.util.Stack<?>) v;
      StringBuilder items = new StringBuilder();
      for (int i = 0; i < st.size(); i++) {
        if (i > 0) items.append(",");
        items.append(jval(st.get(i)));
      }
      return "{\\"kind\\":\\"stack\\",\\"data\\":{\\"items\\":[" + items + "]}}";
    }
    if (v instanceof java.util.List) {
      return "{\\"kind\\":\\"list\\",\\"data\\":[" + joinIterable((java.util.List<?>) v) + "]}";
    }
    if (v instanceof java.util.Deque) {
      // deque: iterate front..back
      return "{\\"kind\\":\\"deque\\",\\"data\\":[" + joinIterable((java.util.Deque<?>) v) + "]}";
    }
    if (v instanceof java.util.Queue) {
      // queue: front..back; wrap in {items:[...]} like the C++ runtime
      return "{\\"kind\\":\\"queue\\",\\"data\\":{\\"items\\":[" + joinIterable((java.util.Queue<?>) v) + "]}}";
    }
    if (v instanceof java.util.Set) {
      return "{\\"kind\\":\\"set\\",\\"data\\":[" + joinIterable((java.util.Set<?>) v) + "]}";
    }
    if (v instanceof Iterable) {
      return "{\\"kind\\":\\"array1d\\",\\"data\\":[" + joinIterable((Iterable<?>) v) + "]}";
    }
    // fallback: opaque object rendered as a scalar string
    return "{\\"kind\\":\\"scalar\\",\\"data\\":\\"" + esc(String.valueOf(v)) + "\\"}";
  }

  // ── build one {name,type,scope,view} variable entry ──
  static String var(String name, String type, Object v) {
    return "{\\"name\\":\\"" + esc(name) + "\\",\\"type\\":\\"" + esc(type)
      + "\\",\\"scope\\":\\"\\",\\"view\\":" + repr(v) + "}";
  }

  // ── emit one event; vars is a pre-built JSON array fragment ──
  static synchronized void emit(String blockId, int line, String kind, String vars) {
    if (out == null || count >= CAP) return;
    count++;
    try {
      String __s = "{\\"blockId\\":\\"" + blockId + "\\",\\"line\\":" + line
        + ",\\"kind\\":\\"" + kind + "\\",\\"vars\\":" + vars + "}\\n";
      out.write(__s.getBytes("UTF-8"));
      out.flush();
    } catch (Throwable __t) { /* keep stdout clean */ }
  }
}
`;
}

/**
 * JSON/C++-literal-sanitize an identifier or type fragment that will be
 * embedded verbatim into a generated C++ string literal *and* into the emitted
 * JSON. Identifiers and type names never legitimately contain quotes or
 * backslashes, so stripping them keeps both the C++ literal and the resulting
 * JSON well-formed (matching the conservative `safeId`/`safeKind` convention).
 *
 * @param {string} s - Raw name or type text.
 * @returns {string} Sanitized text safe to embed.
 */
function sanitizeLiteral(s) {
  return String(s == null ? "" : s).replace(/[\\"]/g, "");
}

/**
 * Build the C++ `vars` JSON-array fragment for a probe: one
 * `__vtrace::var("name","type", <liveVar>)` call per in-scope variable,
 * concatenated into a runtime `std::string` that evaluates to a JSON array.
 *
 * Each entry carries the variable's live value serialized by `__vtrace::repr`,
 * which tags it with the appropriate `view.kind`. An empty scope yields the
 * literal `std::string("[]")`.
 *
 * @param {Array<{name:string,type:string}>} vars - In-scope, declared variables.
 * @returns {string} A C++ expression of type `std::string`.
 */
function cppVarsFragment(vars) {
  if (!Array.isArray(vars) || vars.length === 0) {
    return 'std::string("[]")';
  }
  const entries = vars
    .filter((v) => v && typeof v.name === "string" && v.name.length > 0)
    .map((v) => {
      const name = sanitizeLiteral(v.name);
      const type = sanitizeLiteral(v.type || "");
      // Third argument is the *live* identifier (unquoted) so repr() sees its value.
      return `__vtrace::var("${name}", "${type}", ${name})`;
    });
  if (entries.length === 0) {
    return 'std::string("[]")';
  }
  return `(std::string("[") + ${entries.join(' + "," + ')} + "]")`;
}

/**
 * Build the Java `vars` JSON-array fragment for a probe: one
 * `__VTrace.var("name","type", <liveVar>)` call per in-scope variable,
 * concatenated into a runtime `String` that evaluates to a JSON array.
 *
 * Each entry carries the variable's live value serialized reflectively by
 * `__VTrace.repr`, which tags it with the appropriate `view.kind`. An empty
 * scope yields the literal `"[]"`. Mirrors {@link cppVarsFragment}.
 *
 * @param {Array<{name:string,type:string}>} vars - In-scope, declared variables.
 * @returns {string} A Java expression of type `String`.
 */
function javaVarsFragment(vars) {
  if (!Array.isArray(vars) || vars.length === 0) {
    return '"[]"';
  }
  const entries = vars
    .filter((v) => v && typeof v.name === "string" && v.name.length > 0)
    .map((v) => {
      const name = sanitizeLiteral(v.name);
      const type = sanitizeLiteral(v.type || "");
      // Third argument is the *live* identifier (unquoted) so repr() sees its value.
      return `__VTrace.var("${name}", "${type}", ${name})`;
    });
  if (entries.length === 0) {
    return '"[]"';
  }
  return `("[" + ${entries.join(' + "," + ')} + "]")`;
}

/**
 * Build a single probe-call statement for the given language.
 *
 * For both languages a `vars` JSON-array fragment is built from the variables
 * in scope at the probe (each serialized via the language's `repr`, tagged with
 * its `view.kind`) and passed to the 4-argument `emit`. C++ uses
 * `__vtrace::emit` with {@link cppVarsFragment}; Java uses `__VTrace.emit` with
 * {@link javaVarsFragment}.
 *
 * @param {Language} language - "cpp" or "java".
 * @param {string} blockId - The block id this probe reports.
 * @param {number} line - 1-based source line to report.
 * @param {string} kind - Step kind ("enter" | "assign").
 * @param {Array<{name:string,type:string}>} [vars] - In-scope variables.
 * @returns {string} A statement that emits the event (no surrounding spaces).
 */
function probeCall(language, blockId, line, kind, vars) {
  const safeId = sanitizeLiteral(blockId);
  const safeKind = sanitizeLiteral(kind);
  if (language === "java") {
    const javaVarsExpr = javaVarsFragment(vars);
    return `__VTrace.emit("${safeId}", ${line}, "${safeKind}", ${javaVarsExpr});`;
  }
  const varsExpr = cppVarsFragment(vars);
  return `__vtrace::emit("${safeId}", ${line}, "${safeKind}", ${varsExpr});`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Insertion-point discovery
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Find the offset just after the first `{` within `[startOffset, endOffset)`.
 *
 * @param {string} code - Source text.
 * @param {number} startOffset - Inclusive search start.
 * @param {number} endOffset - Exclusive search end.
 * @returns {number} Offset right after the brace, or -1 if none in range.
 */
function findBodyBraceInsert(code, startOffset, endOffset) {
  const braceIdx = code.indexOf("{", startOffset);
  if (braceIdx === -1 || braceIdx >= endOffset) {
    return -1;
  }
  return braceIdx + 1;
}

/**
 * For a standalone assignment, find the offset just after its terminating `;`.
 *
 * Only whitespace may appear between the end of the assignment expression and
 * the `;`; anything else (e.g. `)`, `,`) signals the assignment is embedded in
 * a larger construct and is left untouched.
 *
 * @param {string} code - Source text.
 * @param {number} endOffset - Offset just past the assignment expression.
 * @returns {number} Offset right after the `;`, or -1 if not a clean statement.
 */
function findStatementSemicolonInsert(code, endOffset) {
  let i = endOffset;
  while (i < code.length && /\s/.test(code[i])) {
    i += 1;
  }
  if (i < code.length && code[i] === ";") {
    return i + 1;
  }
  return -1;
}

/**
 * Decide whether an assignment block is a standalone statement worth probing.
 *
 * Excludes assignments that share their start line with an enclosing loop or
 * conditional header (e.g. `for (i = 0; ...)`, `if ((x = f()))`), where a
 * spliced statement would be syntactically invalid.
 *
 * @param {BlockNode} node - The assignment block.
 * @param {(BlockNode|null)} parent - Its parent block.
 * @returns {boolean} True if the assignment may be probed.
 */
function isProbableAssignmentStatement(node, parent) {
  if (!parent) return true;
  if (parent.type !== "loop" && parent.type !== "conditional") {
    return true;
  }
  const pRange = parent.sourceRange;
  const nRange = node.sourceRange;
  if (!pRange || !nRange) return true;
  // Same line as the loop/conditional header → almost certainly in the header.
  return nRange.startLine !== pRange.startLine;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Instrument C++/Java source to emit a structured execution trace on a
 * dedicated channel (never stdout).
 *
 * @param {Language} language - "cpp" or "java".
 * @param {string} code - The original user source.
 * @param {(BlockNode|null)} blockTree - The static block tree for `code`.
 * @returns {InstrumentResult} `{ source, probeCount }`.
 */
function instrument(language, code, blockTree) {
  if (typeof code !== "string" || code.length === 0) {
    return { source: typeof code === "string" ? code : "", probeCount: 0 };
  }

  const lang = language === "java" ? "java" : "cpp";
  const cap = Number.isFinite(STEP_CAP) && STEP_CAP > 0 ? STEP_CAP : 10000;

  // No usable tree → return the original source unchanged (defensive).
  if (!blockTree || typeof blockTree !== "object") {
    return { source: code, probeCount: 0 };
  }

  const lineStarts = computeLineStarts(code);
  const nodes = flattenTree(blockTree);

  // Build the lexical-scope model once so each probe can capture the variables
  // legally in scope (and already declared) at its line. Both C++ and Java
  // capture variable values; the scope model is language-agnostic.
  let scopeModel = { scopes: [] };
  try {
    scopeModel = collectScopeVariables(lang, code, blockTree);
  } catch (_err) {
    scopeModel = { scopes: [] };
  }

  /** @type {Array<{ offset: number, text: string }>} */
  const insertions = [];

  for (const { node, parent } of nodes) {
    if (!node || !node.sourceRange || typeof node.type !== "string") {
      continue;
    }
    const { startLine, startCol, endLine, endCol } = node.sourceRange;
    const startOffset = offsetOf(lineStarts, startLine, startCol, code.length);
    const endOffset = offsetOf(lineStarts, endLine, endCol, code.length);
    const blockId = node.id;
    if (typeof blockId !== "string") {
      continue;
    }

    if (BOUNDARY_TYPES.has(node.type)) {
      const insertAt = findBodyBraceInsert(code, startOffset, endOffset);
      if (insertAt !== -1) {
        const vars = variablesInScopeAt(scopeModel, startLine);
        insertions.push({
          offset: insertAt,
          text: probeCall(lang, blockId, startLine, "enter", vars),
        });
      }
    } else if (node.type === "assignment") {
      if (isProbableAssignmentStatement(node, parent)) {
        const insertAt = findStatementSemicolonInsert(code, endOffset);
        if (insertAt !== -1) {
          const vars = variablesInScopeAt(scopeModel, startLine);
          insertions.push({
            offset: insertAt,
            text: probeCall(lang, blockId, startLine, "assign", vars),
          });
        }
      }
    }
  }

  // Apply insertions from the highest offset down so earlier offsets stay valid.
  insertions.sort((a, b) => b.offset - a.offset);

  let out = code;
  for (const ins of insertions) {
    out = out.slice(0, ins.offset) + ins.text + out.slice(ins.offset);
  }

  // Prepend / append the emitter helper.
  let source;
  if (lang === "java") {
    source = out + "\n" + javaHelper(cap);
  } else {
    source = cppHelper(cap) + out;
  }

  return { source, probeCount: insertions.length };
}

module.exports = {
  instrument,
  // Exported for unit tests (task 5.2) and sibling-module reuse.
  computeLineStarts,
  offsetOf,
  flattenTree,
  BOUNDARY_TYPES,
};
