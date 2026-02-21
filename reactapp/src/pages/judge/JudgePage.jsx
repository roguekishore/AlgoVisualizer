import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { fetchProblem, submitCode, runCode } from "../../services/judgeApi";
import { useTheme } from "../../components/theme-provider";
import { ThemeToggle } from "../../components/theme-toggle";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Separator } from "../../components/ui/separator";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "../../components/ui/resizable";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "../../components/ui/select";
import {
  ArrowLeft,
  Play,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Terminal,
  FileCode2,
  Loader2,
  SquareTerminal,
  FlaskConical,
  BookOpen,
  ListChecks,
  RotateCcw,
  Copy,
  Check,
} from "lucide-react";
import "./Judge.css";

/* ── Constants ── */
const LANGUAGES = [
  { value: "cpp", label: "C++", monacoId: "cpp" },
  { value: "java", label: "Java", monacoId: "java" },
];

const difficultyVariant = {
  Easy: "success",
  Medium: "warning",
  Hard: "danger",
};

const statusConfig = {
  Accepted: { icon: CheckCircle2, color: "text-[var(--color-success)]", label: "Accepted" },
  "Wrong Answer": { icon: XCircle, color: "text-[var(--color-danger)]", label: "Wrong Answer" },
  "Compilation Error": { icon: AlertTriangle, color: "text-[var(--color-danger)]", label: "Compilation Error" },
  "Runtime Error": { icon: AlertTriangle, color: "text-[var(--color-orange)]", label: "Runtime Error" },
  "Time Limit Exceeded": { icon: Clock, color: "text-[var(--color-warning)]", label: "Time Limit Exceeded" },
  Success: { icon: CheckCircle2, color: "text-[var(--color-success)]", label: "Success" },
  Error: { icon: AlertTriangle, color: "text-[var(--color-danger)]", label: "Error" },
};

/* ════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════ */
export default function JudgePage() {
  const { problemId } = useParams();
  const { theme } = useTheme();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [runResult, setRunResult] = useState(null);
  const [leftTab, setLeftTab] = useState("description");
  const [bottomTab, setBottomTab] = useState("testcases");
  const [customInput, setCustomInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTestCase, setActiveTestCase] = useState(0);
  const editorRef = useRef(null);

  const editorTheme =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
      ? "vs-dark"
      : "light";

  /* ── Data fetching ── */
  useEffect(() => {
    fetchProblem(problemId)
      .then((p) => {
        setProblem(p);
        setCode(p.boilerplate?.cpp || "");
        if (p.sampleTestCases?.[0]) setCustomInput(p.sampleTestCases[0].input);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [problemId]);

  const handleLanguageChange = useCallback(
    (lang) => {
      setLanguage(lang);
      if (problem?.boilerplate?.[lang]) setCode(problem.boilerplate[lang]);
    },
    [problem]
  );

  /* ── Actions ── */
  const handleSubmit = async () => {
    setSubmitting(true);
    setResult(null);
    setRunResult(null);
    setBottomTab("result");
    try {
      const res = await submitCode({ problemId, language, code });
      setResult(res);
      setLeftTab("results");
    } catch (err) {
      setResult({
        status: "Error",
        error: err.message,
        results: [],
        totalPassed: 0,
        totalTests: 0,
      });
      setLeftTab("results");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRun = async () => {
    setRunning(true);
    setRunResult(null);
    setResult(null);
    setBottomTab("result");
    try {
      const res = await runCode({ language, code, input: customInput });
      setRunResult(res);
    } catch (err) {
      setRunResult({ status: "Error", stderr: err.message });
    } finally {
      setRunning(false);
    }
  };

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const handleResetCode = () => {
    if (problem?.boilerplate?.[language]) setCode(problem.boilerplate[language]);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── Loading / Error ── */
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading problem…</span>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">Problem not found</p>
          <Link to="/judge" className="text-sm text-[var(--color-accent-primary)] hover:underline">
            ← Back to problems
          </Link>
        </div>
      </div>
    );
  }

  const currentLang = LANGUAGES.find((l) => l.value === language);
  const statusInfo = result ? statusConfig[result.status] || statusConfig.Error : null;
  const runStatusInfo = runResult ? statusConfig[runResult.status] || statusConfig.Error : null;

  /* ════════════════════════════════════════════
     RENDER
     Layout:
       LEFT  = Description (top) + Testcases / Output (bottom)
       RIGHT = Code Editor (full height)
     ════════════════════════════════════════════ */
  return (
    <div className="judge-root flex h-screen flex-col bg-background text-foreground overflow-hidden pt-24 md:pt-28">
      {/* ───── Header ───── */}
      <header className="flex items-center justify-between h-11 px-3 border-b border-border bg-card flex-shrink-0 z-10">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            to="/judge"
            className="flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Separator orientation="vertical" className="h-4" />
          <FileCode2 className="h-4 w-4 text-[var(--color-accent-primary)] flex-shrink-0" />
          <span className="text-sm font-semibold truncate">{problem.title}</span>
          <Badge variant={difficultyVariant[problem.difficulty] || "secondary"}>
            {problem.difficulty}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* ───── Workspace: horizontal split ───── */}
      <ResizablePanelGroup orientation="horizontal" className="flex-1 min-h-0">

        {/* ═══════════════════════════════════════
            LEFT PANEL — Description / Results (full height)
            ═══════════════════════════════════════ */}
        <ResizablePanel id="left" defaultSize="40%" minSize="25%" maxSize="60%">
          <div className="flex flex-col h-full">
            <Tabs value={leftTab} onValueChange={setLeftTab} className="flex flex-col h-full">
              <div className="flex items-center border-b border-border bg-card px-1 flex-shrink-0">
                <TabsList className="bg-transparent h-10 p-0 gap-0">
                  <TabsTrigger value="description" className="judge-tab-trigger">
                    <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                    Description
                  </TabsTrigger>
                  <TabsTrigger value="results" className="judge-tab-trigger">
                    <ListChecks className="h-3.5 w-3.5 mr-1.5" />
                    Results
                    {result && (
                      <span className={`ml-1.5 inline-block h-2 w-2 rounded-full ${
                        result.status === "Accepted" ? "bg-[var(--color-success)]" : "bg-[var(--color-danger)]"
                      }`} />
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Description content */}
              <TabsContent value="description" className="flex-1 overflow-hidden m-0">
                <ScrollArea className="h-full p-5">
                  <div className="text-sm leading-relaxed text-foreground space-y-2 mb-6">
                    {problem.description.split("\n").map((line, i) => (
                      <p key={i} className={line ? "" : "h-2"}>{line}</p>
                    ))}
                  </div>

                  {problem.examples?.length > 0 && (
                    <div className="space-y-3 mb-6">
                      <h3 className="text-sm font-semibold text-foreground">Examples</h3>
                      {problem.examples.map((ex, i) => (
                        <div key={i} className="rounded-lg border border-border overflow-hidden">
                          <div className="bg-muted/50 px-3 py-1.5 border-b border-border">
                            <span className="text-xs font-medium text-muted-foreground">Example {i + 1}</span>
                          </div>
                          <div className="p-3 space-y-2 text-sm bg-card">
                            <div className="flex gap-2">
                              <span className="text-muted-foreground font-medium min-w-[60px]">Input:</span>
                              <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{ex.input}</code>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-muted-foreground font-medium min-w-[60px]">Output:</span>
                              <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{ex.output}</code>
                            </div>
                            {ex.explanation && (
                              <div className="pt-1 border-t border-border/50">
                                <span className="text-xs text-muted-foreground">{ex.explanation}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {problem.constraints?.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-foreground">Constraints</h3>
                      <ul className="space-y-1">
                        {problem.constraints.map((c, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="mt-1.5 h-1 w-1 rounded-full bg-[var(--color-accent-primary)] flex-shrink-0" />
                            <code className="text-xs font-mono text-muted-foreground">{c}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              {/* Results content */}
              <TabsContent value="results" className="flex-1 overflow-hidden m-0">
                <ScrollArea className="h-full p-5">
                  {!result && !runResult && (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                      <Terminal className="h-10 w-10 mb-3 stroke-1" />
                      <p className="text-sm text-center">Run or submit your code to see results</p>
                    </div>
                  )}

                  {runResult && (
                    <div className="space-y-4">
                      <StatusHeader info={runStatusInfo} time={runResult.time} />
                      {runResult.stdout && <OutputBlock label="Output">{runResult.stdout}</OutputBlock>}
                      {runResult.stderr && <OutputBlock label="Error" variant="error">{runResult.stderr}</OutputBlock>}
                    </div>
                  )}

                  {result && (
                    <div className="space-y-4">
                      <StatusHeader info={statusInfo} time={result.time} />
                      {result.error && <OutputBlock label="Compilation / Runtime Error" variant="error">{result.error}</OutputBlock>}

                      {result.totalTests > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              <span className="font-semibold text-foreground">{result.totalPassed}</span> / {result.totalTests} passed
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {Math.round((result.totalPassed / result.totalTests) * 100)}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${(result.totalPassed / result.totalTests) * 100}%`,
                                backgroundColor: result.totalPassed === result.totalTests ? "var(--color-success)" : "var(--color-danger)",
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {result.results?.length > 0 && (
                        <div className="space-y-2 pt-2">
                          {result.results.map((tc) => (
                            <TestCaseCard key={tc.testCase} tc={tc} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>

        <ResizableHandle orientation="horizontal" withHandle />

        {/* ═══════════════════════════════════════
            RIGHT PANEL — vertical split:
              top    = Code editor + toolbar
              bottom = Testcases / Output tabs
            ═══════════════════════════════════════ */}
        <ResizablePanel id="right" defaultSize="60%" minSize="35%">
          <ResizablePanelGroup orientation="vertical">
            {/* ── Top: Code Editor ── */}
            <ResizablePanel id="right-top" defaultSize="60%" minSize="25%">
              <div className="flex flex-col h-full">
                {/* Toolbar */}
                <div className="flex items-center justify-between h-10 px-2 border-b border-border bg-card flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Select value={language} onValueChange={handleLanguageChange}>
                      <SelectTrigger className="h-7 w-24 text-xs">
                        <span>{currentLang?.label}</span>
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((l) => (
                          <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleResetCode} title="Reset to boilerplate">
                      <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopyCode} title="Copy code">
                      {copied ? <Check className="h-3.5 w-3.5 text-[var(--color-success)]" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>

                    <Separator orientation="vertical" className="h-4 mx-1" />

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-3 text-xs gap-1.5"
                      onClick={handleRun}
                      disabled={running || submitting}
                    >
                      {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                      Run
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 px-3 text-xs gap-1.5 bg-[var(--color-success)] hover:bg-[var(--color-success-hover)] text-white"
                      onClick={handleSubmit}
                      disabled={submitting || running}
                    >
                      {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      Submit
                    </Button>
                  </div>
                </div>

                {/* Monaco Editor */}
                <div className="flex-1 min-h-0">
                  <Editor
                    height="100%"
                    language={currentLang?.monacoId || "cpp"}
                    theme={editorTheme}
                    value={code}
                    onChange={(val) => setCode(val || "")}
                    onMount={handleEditorMount}
                    options={{
                      fontSize: 13,
                      fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',Consolas,monospace",
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 4,
                      wordWrap: "on",
                      padding: { top: 12, bottom: 12 },
                      suggestOnTriggerCharacters: true,
                      quickSuggestions: true,
                      lineNumbersMinChars: 3,
                      renderLineHighlight: "line",
                      cursorBlinking: "smooth",
                      smoothScrolling: true,
                      bracketPairColorization: { enabled: true },
                      guides: { bracketPairs: true },
                    }}
                  />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle orientation="vertical" />

            {/* ── Bottom: Testcases / Output ── */}
            <ResizablePanel id="right-bottom" defaultSize="40%" minSize="15%" maxSize="60%">
              <div className="flex flex-col h-full bg-card">
                <Tabs value={bottomTab} onValueChange={setBottomTab} className="flex flex-col h-full">
                  <div className="flex items-center border-b border-border px-1 flex-shrink-0">
                    <TabsList className="bg-transparent h-9 p-0 gap-0">
                      <TabsTrigger value="testcases" className="judge-tab-trigger h-9">
                        <FlaskConical className="h-3.5 w-3.5 mr-1.5" />
                        Testcases
                      </TabsTrigger>
                      <TabsTrigger value="result" className="judge-tab-trigger h-9">
                        <SquareTerminal className="h-3.5 w-3.5 mr-1.5" />
                        Output
                        {(runResult || result) && (
                          <span className={`ml-1.5 inline-block h-1.5 w-1.5 rounded-full ${
                            runResult?.status === "Success" || result?.status === "Accepted"
                              ? "bg-[var(--color-success)]"
                              : "bg-[var(--color-danger)]"
                          }`} />
                        )}
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Testcases */}
                  <TabsContent value="testcases" className="flex-1 overflow-hidden m-0">
                    <div className="flex flex-col h-full">
                      {problem.sampleTestCases?.length > 0 && (
                        <div className="flex items-center gap-1.5 px-3 pt-3 pb-2 flex-shrink-0">
                          {problem.sampleTestCases.map((_, idx) => (
                            <button
                              key={idx}
                              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                                activeTestCase === idx
                                  ? "bg-secondary text-foreground"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                              }`}
                              onClick={() => {
                                setActiveTestCase(idx);
                                setCustomInput(problem.sampleTestCases[idx].input);
                              }}
                            >
                              Case {idx + 1}
                            </button>
                          ))}
                        </div>
                      )}
                      <ScrollArea className="flex-1 px-3 pb-3">
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Input</label>
                            <textarea
                              className="w-full min-h-[60px] rounded-lg border border-border bg-background p-3 text-xs font-mono resize-none focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                              value={customInput}
                              onChange={(e) => setCustomInput(e.target.value)}
                              placeholder="Enter custom input…"
                              spellCheck={false}
                            />
                          </div>
                          {problem.sampleTestCases?.[activeTestCase]?.output && (
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Expected Output</label>
                              <pre className="rounded-lg border border-border bg-muted p-3 text-xs font-mono whitespace-pre-wrap">
                                {problem.sampleTestCases[activeTestCase].output}
                              </pre>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </TabsContent>

                  {/* Run / Submit output */}
                  <TabsContent value="result" className="flex-1 overflow-hidden m-0">
                    <ScrollArea className="h-full p-3">
                      {!runResult && !result && (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                          <SquareTerminal className="h-8 w-8 mb-2 stroke-1" />
                          <p className="text-xs">Run your code to see output</p>
                        </div>
                      )}

                      {runResult && (
                        <div className="space-y-3">
                          <StatusHeader info={runStatusInfo} time={runResult.time} small />
                          {runResult.stdout && <OutputBlock label="Stdout" size="sm">{runResult.stdout}</OutputBlock>}
                          {runResult.stderr && <OutputBlock label="Stderr" variant="error" size="sm">{runResult.stderr}</OutputBlock>}
                        </div>
                      )}

                      {result && !runResult && (
                        <div className="space-y-3">
                          <StatusHeader info={statusInfo} time={result.time} small />
                          {result.totalTests > 0 && (
                            <span className="text-xs text-muted-foreground">{result.totalPassed}/{result.totalTests} passed</span>
                          )}
                          {result.error && <OutputBlock variant="error" size="sm">{result.error}</OutputBlock>}
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

/* ────────────────────────────────────────────
   SUB-COMPONENTS
   ──────────────────────────────────────────── */

function StatusHeader({ info, time, small }) {
  if (!info) return null;
  const Icon = info.icon;
  return (
    <div className="flex items-center gap-2">
      <Icon className={`${small ? "h-4 w-4" : "h-5 w-5"} ${info.color}`} />
      <span className={`${small ? "text-sm" : "text-lg"} font-bold ${info.color}`}>
        {info.label}
      </span>
      {time > 0 && (
        <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" /> {time}ms
        </span>
      )}
    </div>
  );
}

function OutputBlock({ label, variant, size = "md", children }) {
  const isError = variant === "error";
  return (
    <div className="space-y-1.5">
      {label && (
        <label className={`${size === "sm" ? "text-[10px]" : "text-xs"} font-medium uppercase tracking-wider ${
          isError ? "text-[var(--color-danger)]" : "text-muted-foreground"
        }`}>
          {label}
        </label>
      )}
      <pre className={`text-xs font-mono rounded-lg p-3 overflow-x-auto whitespace-pre-wrap border ${
        isError
          ? "bg-[var(--color-danger-light)] text-[var(--color-danger)] border-[var(--color-danger)]/20"
          : "bg-muted border-border"
      }`}>
        {children}
      </pre>
    </div>
  );
}

function TestCaseCard({ tc }) {
  return (
    <div className={`rounded-lg border overflow-hidden ${
      tc.passed ? "border-[var(--color-success)]/30" : "border-[var(--color-danger)]/30"
    }`}>
      <div className={`flex items-center gap-2 px-3 py-2 text-sm ${
        tc.passed ? "bg-[var(--color-success-light)]" : "bg-[var(--color-danger-light)]"
      }`}>
        {tc.passed
          ? <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-success)]" />
          : <XCircle className="h-3.5 w-3.5 text-[var(--color-danger)]" />
        }
        <span className="font-medium text-xs">Test Case {tc.testCase}</span>
        <span className="ml-auto text-xs text-muted-foreground">{tc.time}ms</span>
      </div>
      {!tc.passed && (
        <div className="p-3 space-y-2 bg-card text-xs font-mono">
          <FieldBlock label="Input">{tc.input}</FieldBlock>
          <FieldBlock label="Expected" className="text-[var(--color-success)]">{tc.expected}</FieldBlock>
          <FieldBlock label="Output" className="text-[var(--color-danger)]">{tc.actual}</FieldBlock>
          {tc.error && <FieldBlock label="Error" className="text-[var(--color-danger)]" bg="bg-[var(--color-danger-light)]">{tc.error}</FieldBlock>}
        </div>
      )}
    </div>
  );
}

function FieldBlock({ label, className, bg = "bg-muted", children }) {
  return (
    <div>
      <label className="text-[10px] font-sans font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
      <pre className={`mt-0.5 ${bg} rounded p-2 whitespace-pre-wrap ${className || ""}`}>{children}</pre>
    </div>
  );
}
