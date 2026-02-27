import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { fetchProblem, submitCode, runCode } from "../../services/judgeApi";
import { getStoredUser } from "../../services/userApi";
import { useTheme } from "../../components/theme-provider";
import useProgressStore, { getConquestIdByJudgeId } from "../../map/useProgressStore";
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
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "../../components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "../../components/ui/dropdown-menu";

import {
  ArrowLeft,
  Play,
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
  Plus,
  X,
  ArrowUpRight,
  ChevronDown,
  Code2,
  Zap,
  CircleDot,
  Hash,
  Braces,
  LogIn,
} from "lucide-react";
import "./Judge.css";
import VisualizerDrawer, { VisualizerToggleButton } from "./VisualizerDrawer";

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

/* ════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════ */
export default function JudgePage() {
  const { problemId } = useParams();
  const { theme } = useTheme();
  const completeProblem = useProgressStore((s) => s.completeProblem);
  const markProblemAttempted = useProgressStore((s) => s.markProblemAttempted);
  const user = useMemo(() => getStoredUser(), []);
  const isLoggedIn = !!user?.uid;
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
  const [copied, setCopied] = useState(false);
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [vizOpen, setVizOpen] = useState(false);
  const editorRef = useRef(null);

  /*  Custom test-case management (LeetCode-style)
      testCases = [{ input, output, isCustom }]
      - First N entries come from problem.sampleTestCases (read-only output)
      - User can append custom entries with editable input  */
  const [testCases, setTestCases] = useState([]);

  /* Seed test cases once problem loads */
  useEffect(() => {
    if (problem?.sampleTestCases?.length) {
      setTestCases(
        problem.sampleTestCases.map((tc) => ({
          input: tc.input,
          output: tc.output,
          isCustom: false,
        }))
      );
      setActiveTestCase(0);
    }
  }, [problem]);

  /* Derived: current input for "Run" */
  const customInput = testCases[activeTestCase]?.input || "";

  /* Update input of the active test case */
  const updateActiveInput = (value) => {
    setTestCases((prev) =>
      prev.map((tc, i) => (i === activeTestCase ? { ...tc, input: value } : tc))
    );
  };

  /* Add a new custom test case */
  const addCustomTestCase = () => {
    const last = testCases[testCases.length - 1];
    setTestCases((prev) => [
      ...prev,
      { input: last?.input || "", output: "", isCustom: true },
    ]);
    setActiveTestCase(testCases.length);
  };

  /* Remove a custom test case */
  const removeTestCase = (idx) => {
    if (!testCases[idx]?.isCustom) return;
    setTestCases((prev) => prev.filter((_, i) => i !== idx));
    setActiveTestCase((prev) => Math.min(prev, testCases.length - 2));
  };

  /* Load a failed test case's input as a new custom test case */
  const useFailedAsTestCase = (input, expected) => {
    setTestCases((prev) => [
      ...prev,
      { input, output: expected || "", isCustom: true },
    ]);
    setActiveTestCase(testCases.length);
    setBottomTab("testcases");
  };

  /* ── Parse active test-case input into a number array for the visualizer ── */
  const testArray = useMemo(() => {
    const tc = testCases[activeTestCase];
    if (!tc?.input) return null;
    const lines = tc.input.trim().split("\n");
    const arrLine = lines.length > 1 ? lines[lines.length - 1] : lines[0];
    const nums = arrLine.trim().split(/\s+/).map(Number);
    return nums.length > 0 && nums.every((n) => !isNaN(n)) ? nums : null;
  }, [testCases, activeTestCase]);

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

      // ── Sync with progress backend (fire-and-forget) ──
      const conquestId = getConquestIdByJudgeId(problemId);
      if (conquestId) {
        if (res.status === "Accepted") {
          completeProblem(conquestId).then(({ success }) => {
            if (success) console.log('[Judge] Progress: marked SOLVED', conquestId);
          });
        } else {
          // Wrong Answer / Runtime Error / TLE → mark attempted
          markProblemAttempted(conquestId);
        }
      }
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

  /* ════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════ */
  return (
    <TooltipProvider delayDuration={300}>
    <div className="judge-root flex h-screen flex-col bg-background text-foreground overflow-hidden">

      {/* ═══════════ HEADER ═══════════ */}
      <header className="judge-header flex items-center justify-between h-11 px-3 flex-shrink-0 z-10">
        {/* Left: back + title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/judge"
                className="flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Back to Problems</TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-2 min-w-0">
            <Code2 className="h-3.5 w-3.5 text-[var(--color-accent-primary)] flex-shrink-0" />
            <span className="text-[13px] font-semibold tracking-tight truncate">{problem.title}</span>
            <Badge variant={difficultyVariant[problem.difficulty] || "secondary"} className="flex-shrink-0 text-[10px] px-1.5 py-0">
              {problem.difficulty}
            </Badge>
            {problem.topic && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)] hidden sm:inline-flex">
                {problem.topic}
              </Badge>
            )}
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1.5">
          <VisualizerToggleButton
            problemId={problemId}
            isOpen={vizOpen}
            onToggle={() => setVizOpen((v) => !v)}
          />
          <Separator orientation="vertical" className="h-4 mx-0.5 hidden sm:block" />
          <ThemeToggle />
        </div>
      </header>

      {/* ═══════════ VISUALIZER DRAWER ═══════════ */}
      <VisualizerDrawer
        problemId={problemId}
        isOpen={vizOpen}
        onToggle={() => setVizOpen((v) => !v)}
        testArray={testArray}
      />

      {/* ═══════════ WORKSPACE ═══════════ */}
      <ResizablePanelGroup orientation="horizontal" className="flex-1 min-h-0">

        {/* ─── LEFT PANEL ─── */}
        <ResizablePanel id="left" defaultSize="40%" minSize="25%" maxSize="60%">
          <div className="flex flex-col h-full judge-panel">
            <Tabs value={leftTab} onValueChange={setLeftTab} className="flex flex-col h-full">
              <div className="flex items-center border-b border-border px-1 flex-shrink-0">
                <TabsList className="bg-transparent h-10 p-0 gap-0">
                  <TabsTrigger value="description" className="judge-tab-trigger">
                    <BookOpen className="h-3.5 w-3.5" />
                    Description
                  </TabsTrigger>
                  <TabsTrigger value="results" className="judge-tab-trigger">
                    <ListChecks className="h-3.5 w-3.5" />
                    Results
                    {result && (
                      <span className={`judge-result-dot ${
                        result.status === "Accepted" ? "judge-result-dot--success" : "judge-result-dot--error"
                      }`} />
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* ── Description ── */}
              <TabsContent value="description" className="flex-1 overflow-hidden m-0">
                <ScrollArea className="h-full">
                  <div className="p-5 space-y-6">
                    {/* Problem statement */}
                    <div className="text-[13px] leading-relaxed text-foreground/90 space-y-2">
                      {problem.description.split("\n").map((line, i) => (
                        <p key={i} className={line ? "" : "h-2"}>{line}</p>
                      ))}
                    </div>

                    {/* Examples */}
                    {problem.examples?.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="judge-section-heading">Examples</h3>
                        {problem.examples.map((ex, i) => (
                          <div key={i} className="judge-example-card">
                            <div className="judge-example-header">
                              <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                                <Hash className="h-3 w-3" />
                                Example {i + 1}
                              </span>
                            </div>
                            <div className="judge-example-body space-y-2.5">
                              <div>
                                <div className="judge-label">Input</div>
                                <code className="judge-codeblock block text-[12px]">{ex.input}</code>
                              </div>
                              <div>
                                <div className="judge-label">Output</div>
                                <code className="judge-codeblock block text-[12px]">{ex.output}</code>
                              </div>
                              {ex.explanation && (
                                <div className="pt-2 border-t border-border/50">
                                  <div className="judge-label">Explanation</div>
                                  <span className="text-xs text-muted-foreground leading-relaxed">{ex.explanation}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Constraints */}
                    {problem.constraints?.length > 0 && (
                      <div className="space-y-2.5">
                        <h3 className="judge-section-heading">Constraints</h3>
                        <div className="rounded-lg border border-border p-3 space-y-0.5">
                          {problem.constraints.map((c, i) => (
                            <div key={i} className="judge-constraint-item">
                              <span className="judge-constraint-dot" />
                              <code className="text-xs font-mono text-foreground/70">{c}</code>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* ── Results ── */}
              <TabsContent value="results" className="flex-1 overflow-hidden m-0">
                <ScrollArea className="h-full">
                  <div className="p-5">
                    {!result && !runResult && (
                      <div className="judge-empty-state py-16">
                        <Terminal className="judge-empty-state-icon" />
                        <p className="text-sm font-medium">No results yet</p>
                        <p className="text-xs text-muted-foreground/70">Run or submit your code to see results here</p>
                      </div>
                    )}

                    {/* Run output */}
                    {runResult && (
                      <div className="space-y-4">
                        <StatusBanner status={runResult.status} time={runResult.time} />
                        {runResult.stdout && <CodeOutput label="Standard Output" icon={<SquareTerminal className="h-3 w-3" />}>{runResult.stdout}</CodeOutput>}
                        {runResult.stderr && <CodeOutput label="Error Output" variant="error" icon={<AlertTriangle className="h-3 w-3" />}>{runResult.stderr}</CodeOutput>}
                      </div>
                    )}

                    {/* Submit results */}
                    {result && (
                      <div className="space-y-5">
                        <StatusBanner status={result.status} time={result.time} />

                        {result.error && <CodeOutput label="Compilation / Runtime Error" variant="error" icon={<AlertTriangle className="h-3 w-3" />}>{result.error}</CodeOutput>}

                        {/* Progress */}
                        {result.totalTests > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-baseline justify-between">
                              <span className="text-sm text-foreground">
                                <span className="font-bold tabular-nums">{result.totalPassed}</span>
                                <span className="text-muted-foreground"> / {result.totalTests} test cases passed</span>
                              </span>
                              <span className={`text-xs font-bold tabular-nums ${
                                result.totalPassed === result.totalTests ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"
                              }`}>
                                {Math.round((result.totalPassed / result.totalTests) * 100)}%
                              </span>
                            </div>
                            <div className="judge-progress-track">
                              <div
                                className="judge-progress-fill"
                                style={{
                                  width: `${(result.totalPassed / result.totalTests) * 100}%`,
                                  backgroundColor: result.totalPassed === result.totalTests ? "var(--color-success)" : "var(--color-danger)",
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* First failed test case */}
                        {(() => {
                          const firstFailed = result.results?.find((tc) => !tc.passed);
                          if (!firstFailed) return null;
                          return (
                            <div className="space-y-3">
                              <h4 className="judge-section-heading">First Failed Test</h4>
                              <div className="judge-failed-card">
                                <div className="judge-failed-card-header">
                                  <div className="flex items-center gap-2">
                                    <XCircle className="h-3.5 w-3.5 text-[var(--color-danger)]" />
                                    <span className="text-xs font-semibold text-[var(--color-danger)]">
                                      Test Case {firstFailed.testCase}
                                    </span>
                                  </div>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={() => useFailedAsTestCase(firstFailed.input, firstFailed.expected)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-[var(--color-accent-primary-light)] text-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)] hover:text-white transition-colors"
                                      >
                                        <ArrowUpRight className="h-3 w-3" />
                                        Debug
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="left" className="text-xs">Load this input as a custom test case</TooltipContent>
                                  </Tooltip>
                                </div>
                                <div className="p-3.5 space-y-3">
                                  <div>
                                    <div className="judge-label">Input</div>
                                    <pre className="judge-codeblock text-[12px]">{firstFailed.input}</pre>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <div className="judge-label" style={{ color: 'var(--color-success)' }}>Expected</div>
                                      <pre className="judge-codeblock text-[12px]" style={{ borderColor: 'rgba(34,197,94,0.2)' }}>{firstFailed.expected}</pre>
                                    </div>
                                    <div>
                                      <div className="judge-label" style={{ color: 'var(--color-danger)' }}>Your Output</div>
                                      <pre className="judge-codeblock text-[12px]" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>{firstFailed.actual}</pre>
                                    </div>
                                  </div>
                                  {firstFailed.error && (
                                    <div>
                                      <div className="judge-label" style={{ color: 'var(--color-danger)' }}>Runtime Error</div>
                                      <pre className="judge-codeblock judge-codeblock--error text-[12px]">{firstFailed.error}</pre>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>

        <ResizableHandle orientation="horizontal" withHandle />

        {/* ─── RIGHT PANEL ─── */}
        <ResizablePanel id="right" defaultSize="60%" minSize="35%">
          <ResizablePanelGroup orientation="vertical">

            {/* ── Code editor ── */}
            <ResizablePanel id="right-top" defaultSize="60%" minSize="25%">
              <div className="flex flex-col h-full">
                {/* Toolbar */}
                <div className="judge-toolbar flex items-center justify-between h-10 px-2.5 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    {/* Language dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger className="judge-lang-trigger">
                        <Braces className="h-3 w-3 text-[var(--color-accent-primary)]" />
                        {currentLang?.label}
                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="min-w-[140px]">
                        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">Language</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {LANGUAGES.map((l) => (
                          <DropdownMenuItem
                            key={l.value}
                            onClick={() => handleLanguageChange(l.value)}
                            className={`text-xs font-medium cursor-pointer ${language === l.value ? "text-[var(--color-accent-primary)] bg-[var(--color-accent-primary-light)]" : ""}`}
                          >
                            <Braces className="h-3 w-3 mr-1.5" />
                            {l.label}
                            {language === l.value && <Check className="h-3 w-3 ml-auto" />}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="judge-icon-btn" onClick={handleResetCode}>
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">Reset to boilerplate</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="judge-icon-btn" onClick={handleCopyCode}>
                          {copied ? <Check className="h-3.5 w-3.5 text-[var(--color-success)]" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">{copied ? "Copied!" : "Copy code"}</TooltipContent>
                    </Tooltip>

                    <Separator orientation="vertical" className="h-4 mx-1" />

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="judge-btn-run"
                          onClick={handleRun}
                          disabled={running || submitting}
                        >
                          {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                          Run
                          <kbd className="judge-kbd hidden sm:inline-flex ml-0.5">⌘R</kbd>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">Run against active test case</TooltipContent>
                    </Tooltip>
                    {isLoggedIn ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className="judge-btn-submit"
                            onClick={handleSubmit}
                            disabled={submitting || running}
                          >
                            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                            Submit
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">Submit against all test cases</TooltipContent>
                      </Tooltip>
                    ) : (
                      <Link
                        to="/login"
                        className="judge-btn-login"
                      >
                        <LogIn className="h-3.5 w-3.5" />
                        Sign in to Submit
                      </Link>
                    )}
                  </div>
                </div>

                {/* Monaco */}
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
              <div className="flex flex-col h-full judge-panel">
                <Tabs value={bottomTab} onValueChange={setBottomTab} className="flex flex-col h-full">
                  <div className="flex items-center border-b border-border px-1 flex-shrink-0">
                    <TabsList className="bg-transparent h-9 p-0 gap-0">
                      <TabsTrigger value="testcases" className="judge-tab-trigger h-9">
                        <FlaskConical className="h-3.5 w-3.5" />
                        Testcases
                      </TabsTrigger>
                      <TabsTrigger value="result" className="judge-tab-trigger h-9">
                        <SquareTerminal className="h-3.5 w-3.5" />
                        Output
                        {(runResult || result) && (
                          <span className={`judge-result-dot ${
                            runResult?.status === "Success" || result?.status === "Accepted"
                              ? "judge-result-dot--success"
                              : "judge-result-dot--error"
                          }`} />
                        )}
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Testcases */}
                  <TabsContent value="testcases" className="flex-1 overflow-hidden m-0">
                    <div className="flex flex-col h-full">
                      {/* Pills */}
                      <div className="flex items-center gap-1.5 px-3 pt-3 pb-2 flex-shrink-0 flex-wrap">
                        {testCases.map((tc, idx) => {
                          const sampleCount = problem?.sampleTestCases?.length || 0;
                          return (
                            <div key={idx} className="relative group">
                              <button
                                className={`judge-tc-pill ${tc.isCustom ? "judge-tc-pill-custom" : ""}`}
                                data-active={activeTestCase === idx}
                                onClick={() => setActiveTestCase(idx)}
                              >
                                <CircleDot className="h-2.5 w-2.5" />
                                {tc.isCustom ? `Custom ${idx - sampleCount + 1}` : `Case ${idx + 1}`}
                              </button>
                              {tc.isCustom && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); removeTestCase(idx); }}
                                  className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 flex items-center justify-center rounded-full bg-secondary border border-border text-muted-foreground/60 hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] hover:border-[var(--color-danger)]/30 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <X className="h-2 w-2" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={addCustomTestCase}
                              className="judge-tc-pill judge-tc-pill-add"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs">Add custom test case</TooltipContent>
                        </Tooltip>
                      </div>

                      {/* Active case content */}
                      <ScrollArea className="flex-1 px-3 pb-3">
                        <div className="space-y-3">
                          <div>
                            <div className="judge-label">Input</div>
                            <textarea
                              className="judge-input"
                              value={testCases[activeTestCase]?.input || ""}
                              onChange={(e) => updateActiveInput(e.target.value)}
                              placeholder="Enter test input…"
                              spellCheck={false}
                            />
                          </div>
                          {testCases[activeTestCase]?.output && (
                            <div>
                              <div className="judge-label">Expected Output</div>
                              <pre className="judge-codeblock text-[12px]">{testCases[activeTestCase].output}</pre>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </TabsContent>

                  {/* Output */}
                  <TabsContent value="result" className="flex-1 overflow-hidden m-0">
                    <ScrollArea className="h-full p-3">
                      {!runResult && !result && (
                        <div className="judge-empty-state py-8">
                          <SquareTerminal className="judge-empty-state-icon" />
                          <p className="text-xs font-medium">Run your code to see output</p>
                        </div>
                      )}

                      {runResult && (
                        <div className="space-y-3">
                          <StatusBanner status={runResult.status} time={runResult.time} compact />
                          {runResult.stdout && <CodeOutput label="Stdout" size="sm" icon={<SquareTerminal className="h-3 w-3" />}>{runResult.stdout}</CodeOutput>}
                          {runResult.stderr && <CodeOutput label="Stderr" variant="error" size="sm" icon={<AlertTriangle className="h-3 w-3" />}>{runResult.stderr}</CodeOutput>}
                        </div>
                      )}

                      {result && !runResult && (
                        <div className="space-y-3">
                          <StatusBanner status={result.status} time={result.time} compact />
                          {result.totalTests > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                <span className="font-semibold text-foreground tabular-nums">{result.totalPassed}</span>/{result.totalTests} passed
                              </span>
                              <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
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
                          {result.error && <CodeOutput variant="error" size="sm">{result.error}</CodeOutput>}
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
    </TooltipProvider>
  );
}

/* ────────────────────────────────────────────
   SUB-COMPONENTS
   ──────────────────────────────────────────── */

const STATUS_MAP = {
  Accepted:             { icon: CheckCircle2, color: "var(--color-success)",  variant: "accepted", label: "Accepted" },
  Success:              { icon: CheckCircle2, color: "var(--color-success)",  variant: "accepted", label: "Success" },
  "Wrong Answer":       { icon: XCircle,      color: "var(--color-danger)",   variant: "failed",   label: "Wrong Answer" },
  "Compilation Error":  { icon: AlertTriangle, color: "var(--color-danger)",  variant: "failed",   label: "Compilation Error" },
  "Runtime Error":      { icon: AlertTriangle, color: "var(--color-orange)",  variant: "warning",  label: "Runtime Error" },
  "Time Limit Exceeded":{ icon: Clock,         color: "var(--color-warning)", variant: "warning",  label: "Time Limit Exceeded" },
  Error:                { icon: AlertTriangle, color: "var(--color-danger)",  variant: "failed",   label: "Error" },
};

function StatusBanner({ status, time, compact }) {
  const cfg = STATUS_MAP[status] || STATUS_MAP.Error;
  const Icon = cfg.icon;
  return (
    <div className={`judge-status-banner judge-status-banner--${cfg.variant} ${compact ? "!py-2 !px-3" : ""}`}>
      <Icon className={compact ? "h-4 w-4" : "h-5 w-5"} style={{ color: cfg.color }} />
      <div className="flex flex-col">
        <span className={`${compact ? "text-sm" : "text-base"} font-bold leading-tight`} style={{ color: cfg.color }}>
          {status}
        </span>
        {!compact && time > 0 && (
          <span className="text-[10px] text-muted-foreground mt-0.5">Executed in {time}ms</span>
        )}
      </div>
      {time > 0 && (
        <span className="ml-auto flex items-center gap-1.5 text-[11px] text-muted-foreground tabular-nums bg-secondary/80 px-2 py-0.5 rounded-md">
          <Clock className="h-3 w-3" /> {time}ms
        </span>
      )}
    </div>
  );
}

function CodeOutput({ label, variant, size = "md", icon, children }) {
  const isError = variant === "error";
  return (
    <div>
      {label && (
        <div className="judge-label flex items-center gap-1.5" style={isError ? { color: 'var(--color-danger)' } : undefined}>
          {icon}
          {label}
        </div>
      )}
      <pre className={`judge-codeblock ${size === "sm" ? "text-[12px]" : "text-[13px]"} ${isError ? "judge-codeblock--error" : ""}`}>
        {children}
      </pre>
    </div>
  );
}
