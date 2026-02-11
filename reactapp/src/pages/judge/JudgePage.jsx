import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { fetchProblem, submitCode, runCode } from "../../services/judgeApi";
import { ThemeToggle } from "../../components/theme-toggle";
import {
  ArrowLeft,
  Play,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronDown,
  Terminal,
  FileCode2,
  Loader2,
} from "lucide-react";
import "./Judge.css";

const LANGUAGES = [
  { value: "cpp", label: "C++", monacoId: "cpp" },
  { value: "java", label: "Java", monacoId: "java" },
];

const difficultyColor = {
  Easy: "#22c55e",
  Medium: "#eab308",
  Hard: "#ef4444",
};

const statusConfig = {
  Accepted: { icon: CheckCircle2, color: "#22c55e", label: "Accepted" },
  "Wrong Answer": { icon: XCircle, color: "#ef4444", label: "Wrong Answer" },
  "Compilation Error": { icon: AlertTriangle, color: "#ef4444", label: "Compilation Error" },
  "Runtime Error": { icon: AlertTriangle, color: "#f97316", label: "Runtime Error" },
  "Time Limit Exceeded": { icon: Clock, color: "#eab308", label: "Time Limit Exceeded" },
  Success: { icon: CheckCircle2, color: "#22c55e", label: "Success" },
};

export default function JudgePage() {
  const { problemId } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [runResult, setRunResult] = useState(null);
  const [activeTab, setActiveTab] = useState("description"); // description | results
  const [outputTab, setOutputTab] = useState("testcases"); // testcases | output
  const [customInput, setCustomInput] = useState("");
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const editorRef = useRef(null);

  // Fetch problem
  useEffect(() => {
    fetchProblem(problemId)
      .then((p) => {
        setProblem(p);
        setCode(p.boilerplate?.cpp || "");
        if (p.sampleTestCases?.[0]) {
          setCustomInput(p.sampleTestCases[0].input);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [problemId]);

  // Switch language → load boilerplate
  const handleLanguageChange = useCallback(
    (lang) => {
      setLanguage(lang);
      setLangDropdownOpen(false);
      if (problem?.boilerplate?.[lang]) {
        setCode(problem.boilerplate[lang]);
      }
    },
    [problem]
  );

  // Submit code against all test cases
  const handleSubmit = async () => {
    setSubmitting(true);
    setResult(null);
    setRunResult(null);
    setOutputTab("testcases");
    try {
      const res = await submitCode({ problemId, language, code });
      setResult(res);
      setActiveTab("results");
    } catch (err) {
      setResult({ status: "Error", error: err.message, results: [], totalPassed: 0, totalTests: 0 });
      setActiveTab("results");
    } finally {
      setSubmitting(false);
    }
  };

  // Run code with custom input
  const handleRun = async () => {
    setRunning(true);
    setRunResult(null);
    setResult(null);
    setOutputTab("output");
    try {
      const res = await runCode({ language, code, input: customInput });
      setRunResult(res);
      setActiveTab("results");
    } catch (err) {
      setRunResult({ status: "Error", stderr: err.message });
      setActiveTab("results");
    } finally {
      setRunning(false);
    }
  };

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  if (loading) {
    return (
      <div className="judge-shell">
        <div className="judge-loading">
          <div className="judge-spinner" />
          <span>Loading problem...</span>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="judge-shell">
        <div className="judge-error">
          <p>Problem not found.</p>
          <Link to="/judge" className="judge-link">← Back to problems</Link>
        </div>
      </div>
    );
  }

  const currentLang = LANGUAGES.find((l) => l.value === language);
  const StatusIcon = result ? statusConfig[result.status]?.icon || AlertTriangle : null;
  const statusColor = result ? statusConfig[result.status]?.color || "#888" : null;

  return (
    <div className="judge-shell">
      {/* Header */}
      <header className="judge-header">
        <div className="judge-header-left">
          <Link to="/judge" className="judge-back-btn">
            <ArrowLeft size={18} />
          </Link>
          <FileCode2 size={20} style={{ color: "var(--color-accent-primary)" }} />
          <h1 className="judge-title">{problem.title}</h1>
          <span
            className="judge-difficulty-badge"
            style={{ color: difficultyColor[problem.difficulty] }}
          >
            {problem.difficulty}
          </span>
        </div>
        <div className="judge-header-right">
          <ThemeToggle />
        </div>
      </header>

      {/* Main layout: split panes */}
      <div className="judge-workspace">
        {/* Left pane: Problem description */}
        <div className="judge-left-pane">
          <div className="judge-pane-tabs">
            <button
              className={`judge-pane-tab ${activeTab === "description" ? "active" : ""}`}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>
            <button
              className={`judge-pane-tab ${activeTab === "results" ? "active" : ""}`}
              onClick={() => setActiveTab("results")}
            >
              Results
              {result && (
                <span
                  className="judge-results-dot"
                  style={{ backgroundColor: statusColor }}
                />
              )}
            </button>
          </div>

          <div className="judge-pane-content">
            {activeTab === "description" && (
              <div className="judge-description">
                <div className="judge-description-text">
                  {problem.description.split("\n").map((line, i) => (
                    <p key={i}>{line || <br />}</p>
                  ))}
                </div>

                {/* Examples */}
                <div className="judge-section">
                  <h3>Examples</h3>
                  {problem.examples?.map((ex, i) => (
                    <div key={i} className="judge-example">
                      <div className="judge-example-label">Example {i + 1}:</div>
                      <div className="judge-example-block">
                        <div><strong>Input:</strong> <code>{ex.input}</code></div>
                        <div><strong>Output:</strong> <code>{ex.output}</code></div>
                        {ex.explanation && (
                          <div className="judge-example-explanation">
                            <strong>Explanation:</strong> {ex.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                <div className="judge-section">
                  <h3>Constraints</h3>
                  <ul className="judge-constraints">
                    {problem.constraints?.map((c, i) => (
                      <li key={i}><code>{c}</code></li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "results" && (
              <div className="judge-results-panel">
                {!result && !runResult && (
                  <div className="judge-results-empty">
                    <Terminal size={40} strokeWidth={1.5} />
                    <p>Submit your code or run with custom input to see results here.</p>
                  </div>
                )}

                {/* Run result (custom input) */}
                {runResult && (
                  <div className="judge-run-result">
                    <div className="judge-result-header">
                      <span className="judge-result-status" style={{ color: statusConfig[runResult.status]?.color || "#888" }}>
                        {runResult.status}
                      </span>
                      {runResult.time > 0 && (
                        <span className="judge-result-time">
                          <Clock size={14} /> {runResult.time}ms
                        </span>
                      )}
                    </div>
                    {runResult.stdout && (
                      <div className="judge-output-block">
                        <label>Output:</label>
                        <pre>{runResult.stdout}</pre>
                      </div>
                    )}
                    {runResult.stderr && (
                      <div className="judge-output-block error">
                        <label>Error:</label>
                        <pre>{runResult.stderr}</pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Submit result (test cases) */}
                {result && (
                  <div className="judge-submit-result">
                    <div className="judge-result-header">
                      {StatusIcon && <StatusIcon size={22} style={{ color: statusColor }} />}
                      <span className="judge-result-status" style={{ color: statusColor }}>
                        {statusConfig[result.status]?.label || result.status}
                      </span>
                      {result.time > 0 && (
                        <span className="judge-result-time">
                          <Clock size={14} /> {result.time}ms
                        </span>
                      )}
                    </div>

                    {result.error && (
                      <div className="judge-output-block error">
                        <pre>{result.error}</pre>
                      </div>
                    )}

                    {result.totalTests > 0 && (
                      <div className="judge-result-summary">
                        <span className="judge-result-score">
                          {result.totalPassed} / {result.totalTests} test cases passed
                        </span>
                        <div className="judge-result-bar">
                          <div
                            className="judge-result-bar-fill"
                            style={{
                              width: `${(result.totalPassed / result.totalTests) * 100}%`,
                              backgroundColor: result.totalPassed === result.totalTests ? "#22c55e" : "#ef4444",
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {result.results?.map((tc) => (
                      <div
                        key={tc.testCase}
                        className={`judge-testcase-result ${tc.passed ? "passed" : "failed"}`}
                      >
                        <div className="judge-tc-header">
                          {tc.passed ? (
                            <CheckCircle2 size={16} color="#22c55e" />
                          ) : (
                            <XCircle size={16} color="#ef4444" />
                          )}
                          <span>Test Case {tc.testCase}</span>
                          <span className="judge-tc-time">{tc.time}ms</span>
                        </div>
                        {!tc.passed && (
                          <div className="judge-tc-details">
                            <div className="judge-tc-field">
                              <label>Input:</label>
                              <pre>{tc.input}</pre>
                            </div>
                            <div className="judge-tc-field">
                              <label>Expected:</label>
                              <pre>{tc.expected}</pre>
                            </div>
                            <div className="judge-tc-field">
                              <label>Got:</label>
                              <pre>{tc.actual}</pre>
                            </div>
                            {tc.error && (
                              <div className="judge-tc-field error">
                                <label>Error:</label>
                                <pre>{tc.error}</pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right pane: Code editor */}
        <div className="judge-right-pane">
          {/* Editor toolbar */}
          <div className="judge-editor-toolbar">
            {/* Language selector */}
            <div className="judge-lang-selector">
              <button
                className="judge-lang-btn"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              >
                {currentLang?.label}
                <ChevronDown size={14} />
              </button>
              {langDropdownOpen && (
                <div className="judge-lang-dropdown">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.value}
                      className={`judge-lang-option ${l.value === language ? "active" : ""}`}
                      onClick={() => handleLanguageChange(l.value)}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="judge-action-buttons">
              <button
                className="judge-run-btn"
                onClick={handleRun}
                disabled={running || submitting}
              >
                {running ? <Loader2 size={16} className="judge-spin" /> : <Play size={16} />}
                Run
              </button>
              <button
                className="judge-submit-btn"
                onClick={handleSubmit}
                disabled={submitting || running}
              >
                {submitting ? <Loader2 size={16} className="judge-spin" /> : <Send size={16} />}
                Submit
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="judge-editor-container">
            <Editor
              height="100%"
              language={currentLang?.monacoId || "cpp"}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || "")}
              onMount={handleEditorMount}
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                wordWrap: "on",
                padding: { top: 12 },
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                lineNumbersMinChars: 3,
              }}
            />
          </div>

          {/* Bottom panel: custom input */}
          <div className="judge-bottom-panel">
            <div className="judge-bottom-tabs">
              <button
                className={`judge-pane-tab ${outputTab === "testcases" ? "active" : ""}`}
                onClick={() => setOutputTab("testcases")}
              >
                Custom Input
              </button>
            </div>
            <div className="judge-custom-input">
              <textarea
                className="judge-input-textarea"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Enter your custom input here..."
                spellCheck={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
