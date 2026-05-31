import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { fetchProblem, submitCode, runCode } from "../../services/judgeApi";
import { getStoredUser } from "../../services/userApi";
import { useTheme } from "../../components/common/ThemeProvider";
import useProgressStore, { getConquestIdByJudgeId } from "../../map/useProgressStore";
import { ThemeToggle } from "../../components/common/ThemeToggle";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { ScrollArea } from "../../components/ui/scroll-area";
import {
  ResizablePanelGroup, ResizablePanel, ResizableHandle,
} from "../../components/ui/resizable";
import {
  Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
} from "../../components/ui/tooltip";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
} from "../../components/ui/dropdown-menu";
import {
  ArrowLeft, Play, CheckCircle2, XCircle, Clock, AlertTriangle,
  Terminal, Loader2, SquareTerminal, FlaskConical, BookOpen,
  ListChecks, RotateCcw, Copy, Check, Plus, X, ArrowUpRight,
  ChevronDown, Code2, Zap, CircleDot, Hash, Braces, LogIn, Sparkles,
  Workflow, Columns2,
} from "lucide-react";
import "./Judge.css";
import VisualizerDrawer, { VisualizerToggleButton } from "./VisualizerDrawer";
import CodeFlowPanel from "./codeflow/CodeFlowPanel";
import DryRunPanel from "./codeflow/DryRunPanel";
import { useCodeFlow } from "./codeflow/useCodeFlow";

/* ── Constants ── */
const LANGUAGES = [
  { value: "cpp", label: "C++", monacoId: "cpp" },
  { value: "java", label: "Java", monacoId: "java" },
];

const DIFF_COLOR = {
  Easy: { text: "text-emerald-400", dot: "bg-emerald-500" },
  Medium: { text: "text-amber-400", dot: "bg-amber-500" },
  Hard: { text: "text-rose-400", dot: "bg-rose-500" },
};

const S = {
  bg: "#09090b",
  surface: "#0c0c0f",
  border: "rgba(255,255,255,0.2)",
  borderSub: "rgba(255,255,255,0.14)",
  textPri: "#ffffff",
  textSec: "rgba(255,255,255,0.34)",
  textMeta: "rgba(255,255,255,0.2)",
  acid: "#EDFF66",
  red: "#f87171",
  green: "#34d399",
  amber: "#fbbf24",
};

/* ════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════ */
export default function JudgePage() {
  const { problemId } = useParams();
  const { theme } = useTheme();
  const completeProblem = useProgressStore(s => s.completeProblem);
  const markProblemAttempted = useProgressStore(s => s.markProblemAttempted);
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
  const [dryRunOpen, setDryRunOpen] = useState(false);
  const [testCases, setTestCases] = useState([]);
  const editorRef = useRef(null);
  const codeFlowRef = useRef(null);
  // Single shared flow trace + playback state consumed by BOTH the Flow bottom
  // tab (CodeFlowPanel) and the parallel dry-run window (DryRunPanel) so stepping
  // in one is reflected in the other (task 27.1, Requirement R12).
  const flow = useCodeFlow();
  // Holds the editor-cursor handler registered by CodeFlowPanel for the
  // editor -> block highlight direction (Requirements 4.2, 4.4, 4.5).
  const cursorResolverRef = useRef(null);

  useEffect(() => {
    if (problem?.sampleTestCases?.length) {
      setTestCases(problem.sampleTestCases.map(tc => ({ input: tc.input, output: tc.output, isCustom: false })));
      setActiveTestCase(0);
    }
  }, [problem]);

  const customInput = testCases[activeTestCase]?.input || "";
  const sampleCount = problem?.sampleTestCases?.length || 0;

  const updateActiveInput = (value) =>
    setTestCases(prev => prev.map((tc, i) => i === activeTestCase ? { ...tc, input: value } : tc));

  const addCustomTestCase = () => {
    const last = testCases[testCases.length - 1];
    setTestCases(prev => [...prev, { input: last?.input || "", output: "", isCustom: true }]);
    setActiveTestCase(testCases.length);
  };

  const removeTestCase = (idx) => {
    if (!testCases[idx]?.isCustom) return;
    setTestCases(prev => prev.filter((_, i) => i !== idx));
    setActiveTestCase(prev => Math.min(prev, testCases.length - 2));
  };

  const useFailedAsTestCase = (input, expected) => {
    setTestCases(prev => [...prev, { input, output: expected || "", isCustom: true }]);
    setActiveTestCase(testCases.length);
    setBottomTab("testcases");
  };

  const testArray = useMemo(() => {
    const tc = testCases[activeTestCase];
    if (!tc?.input) return null;
    const lines = tc.input.trim().split("\n");
    const arrLine = lines.length > 1 ? lines[lines.length - 1] : lines[0];
    const nums = arrLine.trim().split(/\s+/).map(Number);
    return nums.length > 0 && nums.every(n => !isNaN(n)) ? nums : null;
  }, [testCases, activeTestCase]);

  const editorTheme = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ? "vs-dark" : "light";

  useEffect(() => {
    fetchProblem(problemId)
      .then(p => { setProblem(p); setCode(p.boilerplate?.cpp || ""); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [problemId]);

  const handleLanguageChange = useCallback((lang) => {
    setLanguage(lang);
    if (problem?.boilerplate?.[lang]) setCode(problem.boilerplate[lang]);
  }, [problem]);

  const handleSubmit = async () => {
    setSubmitting(true); setResult(null); setRunResult(null); setBottomTab("result");
    try {
      const res = await submitCode({ problemId, language, code });
      setResult(res); setLeftTab("results");
      const cid = getConquestIdByJudgeId(problemId);
      if (cid) {
        if (res.status === "Accepted") completeProblem(cid);
        else markProblemAttempted(cid);
      }
    } catch (err) {
      setResult({ status: "Error", error: err.message, results: [], totalPassed: 0, totalTests: 0 });
      setLeftTab("results");
    } finally { setSubmitting(false); }
  };

  const handleRun = async () => {
    setRunning(true); setRunResult(null); setResult(null); setBottomTab("result");
    try { setRunResult(await runCode({ language, code, input: customInput })); }
    catch (err) { setRunResult({ status: "Error", stderr: err.message }); }
    finally { setRunning(false); }
  };

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
    // Editor -> block direction: forward cursor line changes to the Flow panel's
    // resolver, which highlights the innermost covering block or clears the hover
    // when no block covers the line (Requirements 4.2, 4.4).
    editor.onDidChangeCursorPosition((e) => {
      const line = e?.position?.lineNumber;
      if (typeof line === "number") cursorResolverRef.current?.(line);
    });
  };
  const handleResetCode = () => { if (problem?.boilerplate?.[language]) setCode(problem.boilerplate[language]); };
  const handleCopyCode = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  // Trigger a flow trace and switch the bottom panel to the Flow tab (Req 1.1, 1.3).
  // Uses the shared `flow` instance so both the Flow tab and the parallel dry-run
  // window reflect the same trace/playback state.
  const handleVisualizeFlow = () => {
    setBottomTab("flow");
    flow.run({ language, code, input: customInput });
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
          <span className="text-sm text-zinc-500">Loading problem…</span>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto">
            <Code2 className="w-5 h-5 text-zinc-600" />
          </div>
          <p className="text-sm font-semibold text-zinc-400">Problem not found</p>
          <Link to="/problems" className="text-xs text-primary hover:underline flex items-center justify-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Back to problems
          </Link>
        </div>
      </div>
    );
  }

  const currentLang = LANGUAGES.find(l => l.value === language);
  const diffStyle = DIFF_COLOR[problem.difficulty] || { text: "text-zinc-400", dot: "bg-zinc-500" };

  /* ════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════ */
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen flex-col bg-zinc-950 text-white overflow-hidden">

        {/* ═══════════ HEADER ═══════════ */}
        <header className="flex items-center justify-between h-11 px-3 flex-shrink-0 border-b border-zinc-800/80 bg-zinc-950 z-10">
          {/* Left */}
          <div className="flex items-center gap-2.5 min-w-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/problems"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs bg-zinc-900 border-zinc-800">Back to Problems</TooltipContent>
            </Tooltip>

            <div className="w-px h-4 bg-zinc-800" />

            <div className="flex items-center gap-2 min-w-0">
              <Code2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <span className="text-[13px] font-bold text-white tracking-tight truncate">{problem.title}</span>

              {/* Difficulty - dot + text */}
              <div className="flex items-center gap-1 shrink-0">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${diffStyle.dot}`} />
                <span className={`text-[11px] font-bold ${diffStyle.text}`}>{problem.difficulty}</span>
              </div>

              {problem.topic && (
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-lg bg-zinc-800 border border-zinc-700/60 text-[10px] font-bold text-zinc-400 shrink-0">
                  {problem.topic}
                </span>
              )}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-1.5">
            <VisualizerToggleButton problemId={problemId} isOpen={vizOpen} onToggle={() => setVizOpen(v => !v)} />
            <div className="w-px h-4 bg-zinc-800 hidden sm:block mx-0.5" />
            <ThemeToggle />
          </div>
        </header>

        {/* ═══════════ VISUALIZER DRAWER ═══════════ */}
        <VisualizerDrawer
          problemId={problemId}
          isOpen={vizOpen}
          onToggle={() => setVizOpen(v => !v)}
          testArray={testArray}
        />

        {/* ═══════════ WORKSPACE ═══════════ */}
        <ResizablePanelGroup orientation="horizontal" className="flex-1 min-h-0">

          {/* ─── LEFT PANEL: Description + Results ─── */}
          <ResizablePanel id="left" defaultSize="40%" minSize="25%" maxSize="60%">
            <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800/80">
              <Tabs value={leftTab} onValueChange={setLeftTab} className="flex flex-col h-full">
                <div style={{ display: "flex", alignItems: "center", borderBottom: `1px solid ${S.border}`, padding: "0 4px", flexShrink: 0, background: S.bg }}>
                  <TabsList style={{ background: "transparent", height: 38, padding: 0, display: "flex", gap: 0 }}>
                    {[
                      { value: "description", Icon: BookOpen, label: "Description" },
                      { value: "results", Icon: ListChecks, label: "Results", dot: result ? (result.status === "Accepted" ? S.green : S.red) : null },
                    ].map((tab) => (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "0 12px",
                          height: 38,
                          borderRadius: 0,
                          border: "none",
                          background: "transparent",
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          color: leftTab === tab.value ? "#fff" : "rgba(255,255,255,0.28)",
                          borderBottom: leftTab === tab.value ? `1px solid ${S.acid}` : "1px solid transparent",
                          transition: "color 0.15s, border-color 0.15s",
                          marginBottom: -1,
                        }}
                      >
                        <tab.Icon size={12} />
                        {tab.label}
                        {tab.dot && <div style={{ width: 5, height: 5, borderRadius: "50%", background: tab.dot }} />}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {/* ── Description ── */}
                <TabsContent value="description" className="flex-1 overflow-hidden m-0">
                  <ScrollArea className="h-full">
                    <div className="p-5 space-y-6">

                      {/* Stage intro */}
                      {problem.stageIntro && (
                        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-primary">
                            <Zap className="h-3 w-3" /> Prologue
                          </div>
                          <p className="text-[12px] leading-relaxed text-zinc-400 italic">{problem.stageIntro}</p>
                        </div>
                      )}

                      {/* Story briefing */}
                      {problem.storyBriefing && (
                        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-amber-400">
                            <Sparkles className="h-3 w-3" /> Story
                          </div>
                          <p className="text-[12px] leading-relaxed text-zinc-400 italic">{problem.storyBriefing}</p>
                        </div>
                      )}

                      {/* Description body */}
                      <div className="text-[13px] leading-relaxed text-zinc-400 space-y-2">
                        {problem.description.split("\n").map((line, i) => (
                          <p key={i} className={line ? "" : "h-2"}>{line}</p>
                        ))}
                      </div>

                      {/* Examples */}
                      {problem.examples?.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Examples</h3>
                          {problem.examples.map((ex, i) => (
                            <div key={i} className="rounded-xl border border-zinc-800 overflow-hidden">
                              <div className="px-3 py-2 border-b border-zinc-800 bg-zinc-900/60">
                                <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1.5">
                                  <Hash className="h-3 w-3" /> Example {i + 1}
                                </span>
                              </div>
                              <div className="p-3.5 space-y-2.5 bg-zinc-950">
                                <div>
                                  <div className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1.5">Input</div>
                                  <code className="block text-[12px] font-mono bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-300 whitespace-pre-wrap">{ex.input}</code>
                                </div>
                                <div>
                                  <div className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1.5">Output</div>
                                  <code className="block text-[12px] font-mono bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-300 whitespace-pre-wrap">{ex.output}</code>
                                </div>
                                {ex.explanation && (
                                  <div className="pt-2.5 border-t border-zinc-800">
                                    <div className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1.5">Explanation</div>
                                    <span className="text-xs text-zinc-500 leading-relaxed">{ex.explanation}</span>
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
                          <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Constraints</h3>
                          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 space-y-1">
                            {problem.constraints.map((c, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <span className="w-1 h-1 rounded-full bg-zinc-600 mt-1.5 shrink-0" />
                                <code className="text-xs font-mono text-zinc-400">{c}</code>
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
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                            <Terminal className="h-4 w-4 text-zinc-600" />
                          </div>
                          <p className="text-sm font-semibold text-zinc-400">No results yet</p>
                          <p className="text-xs text-zinc-600">Run or submit your code to see results</p>
                        </div>
                      )}

                      {runResult && (
                        <div className="space-y-4">
                          <StatusBanner status={runResult.status} time={runResult.time} />
                          {runResult.stdout && <CodeOutput label="Standard Output" icon={<SquareTerminal className="h-3 w-3" />}>{runResult.stdout}</CodeOutput>}
                          {runResult.stderr && <CodeOutput label="Error Output" variant="error" icon={<AlertTriangle className="h-3 w-3" />}>{runResult.stderr}</CodeOutput>}
                        </div>
                      )}

                      {result && (
                        <div className="space-y-5">
                          <StatusBanner status={result.status} time={result.time} />

                          {result.error && <CodeOutput label="Compilation / Runtime Error" variant="error" icon={<AlertTriangle className="h-3 w-3" />}>{result.error}</CodeOutput>}

                          {result.totalTests > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-baseline justify-between">
                                <span className="text-sm text-white">
                                  <span className="font-black tabular-nums">{result.totalPassed}</span>
                                  <span className="text-zinc-500"> / {result.totalTests} passed</span>
                                </span>
                                <span className={`text-xs font-black tabular-nums ${result.totalPassed === result.totalTests ? "text-emerald-400" : "text-rose-400"}`}>
                                  {Math.round((result.totalPassed / result.totalTests) * 100)}%
                                </span>
                              </div>
                              <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-700"
                                  style={{
                                    width: `${(result.totalPassed / result.totalTests) * 100}%`,
                                    background: result.totalPassed === result.totalTests ? "#10b981" : "#f43f5e",
                                  }} />
                              </div>
                            </div>
                          )}

                          {/* First failed test case */}
                          {(() => {
                            const ff = result.results?.find(tc => !tc.passed);
                            if (!ff) return null;
                            return (
                              <div className="space-y-3">
                                <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">First Failed Test</h4>
                                <div className="rounded-xl border border-zinc-800 overflow-hidden">
                                  <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-800 bg-zinc-900/60">
                                    <div className="flex items-center gap-2">
                                      <XCircle className="h-3.5 w-3.5 text-rose-400" />
                                      <span className="text-xs font-bold text-rose-400">Test Case {ff.testCase}</span>
                                    </div>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={() => useFailedAsTestCase(ff.input, ff.expected)}
                                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                                        >
                                          <ArrowUpRight className="h-3 w-3" /> Debug
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="left" className="text-xs bg-zinc-900 border-zinc-800">Load as custom test case</TooltipContent>
                                    </Tooltip>
                                  </div>
                                  <div className="p-3.5 space-y-3 bg-zinc-950">
                                    <div>
                                      <div className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1.5">Input</div>
                                      <pre className="text-[12px] font-mono bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-300 whitespace-pre-wrap">{ff.input}</pre>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <div className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-1.5">Expected</div>
                                        <pre className="text-[12px] font-mono bg-zinc-900 border border-emerald-900/40 rounded-lg px-3 py-2 text-zinc-300 whitespace-pre-wrap">{ff.expected}</pre>
                                      </div>
                                      <div>
                                        <div className="text-[9px] font-black uppercase tracking-widest text-rose-600 mb-1.5">Your Output</div>
                                        <pre className="text-[12px] font-mono bg-zinc-900 border border-rose-900/40 rounded-lg px-3 py-2 text-zinc-300 whitespace-pre-wrap">{ff.actual}</pre>
                                      </div>
                                    </div>
                                    {ff.error && (
                                      <div>
                                        <div className="text-[9px] font-black uppercase tracking-widest text-rose-600 mb-1.5">Runtime Error</div>
                                        <pre className="text-[12px] font-mono bg-rose-950/30 border border-rose-900/40 rounded-lg px-3 py-2 text-rose-300 whitespace-pre-wrap">{ff.error}</pre>
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

          {/* ─── RIGHT PANEL: Editor + Testcases ─── */}
          <ResizablePanel id="right" defaultSize="60%" minSize="35%">
            <ResizablePanelGroup orientation="vertical">

              {/* ── Editor ── */}
              <ResizablePanel id="right-top" defaultSize="60%" minSize="25%">
                <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 40, padding: "0 10px", flexShrink: 0, borderBottom: `1px solid ${S.border}`, background: S.bg }}>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 8, border: `1px solid ${S.border}`, background: "transparent", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.55)", transition: "all 0.15s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; e.currentTarget.style.background = "transparent"; }}
                      >
                        <Braces size={11} color="rgba(255,255,255,0.4)" />
                        {currentLang?.label}
                        <ChevronDown size={11} color="rgba(255,255,255,0.32)" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" style={{ background: "#0d0d10", border: `1px solid ${S.border}`, borderRadius: 10, padding: 4, minWidth: 140 }}>
                        <DropdownMenuLabel style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase", color: S.textMeta, padding: "4px 8px" }}>Language</DropdownMenuLabel>
                        <DropdownMenuSeparator style={{ background: S.border, margin: "4px 0" }} />
                        {LANGUAGES.map((l) => (
                          <DropdownMenuItem
                            key={l.value}
                            onClick={() => handleLanguageChange(l.value)}
                            style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 8px", borderRadius: 7, fontSize: 12, fontWeight: 600, color: language === l.value ? S.acid : "rgba(255,255,255,0.55)", background: "transparent" }}
                          >
                            <Braces size={11} />
                            {l.label}
                            {language === l.value && <Check size={11} style={{ marginLeft: "auto" }} />}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={handleResetCode}
                            style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", transition: "all 0.15s" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#fff"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
                          >
                            <RotateCcw size={13} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" style={{ fontSize: 11, background: "#0d0d10", border: `1px solid ${S.border}`, borderRadius: 7 }}>Reset to boilerplate</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={handleCopyCode}
                            style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: copied ? S.green : "rgba(255,255,255,0.3)", transition: "all 0.15s" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; if (!copied) e.currentTarget.style.color = "#fff"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = copied ? S.green : "rgba(255,255,255,0.3)"; }}
                          >
                            {copied ? <Check size={13} /> : <Copy size={13} />}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" style={{ fontSize: 11, background: "#0d0d10", border: `1px solid ${S.border}`, borderRadius: 7 }}>
                          {copied ? "Copied!" : "Copy code"}
                        </TooltipContent>
                      </Tooltip>

                      <div style={{ width: 1, height: 14, background: S.border, margin: "0 4px" }} />

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={handleVisualizeFlow}
                            disabled={running || submitting}
                            style={{ display: "flex", alignItems: "center", gap: 5, height: 28, padding: "0 12px", borderRadius: 7, border: `1px solid ${S.border}`, background: "transparent", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)", opacity: running || submitting ? 0.4 : 1, transition: "all 0.15s" }}
                            onMouseEnter={(e) => {
                              if (!running && !submitting) {
                                e.currentTarget.style.borderColor = "rgba(237,255,102,0.4)";
                                e.currentTarget.style.color = S.acid;
                                e.currentTarget.style.background = "rgba(237,255,102,0.06)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = S.border;
                              e.currentTarget.style.color = "rgba(255,255,255,0.45)";
                              e.currentTarget.style.background = "transparent";
                            }}
                          >
                            <Workflow size={12} />
                            Visualize Flow
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" style={{ fontSize: 11, background: "#0d0d10", border: `1px solid ${S.border}`, borderRadius: 7 }}>Trace and visualize execution flow</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setDryRunOpen(v => !v)}
                            aria-pressed={dryRunOpen}
                            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 7, border: `1px solid ${dryRunOpen ? "rgba(237,255,102,0.4)" : S.border}`, background: dryRunOpen ? "rgba(237,255,102,0.06)" : "transparent", color: dryRunOpen ? S.acid : "rgba(255,255,255,0.45)", transition: "all 0.15s" }}
                            onMouseEnter={(e) => {
                              if (!dryRunOpen) {
                                e.currentTarget.style.borderColor = "rgba(237,255,102,0.4)";
                                e.currentTarget.style.color = S.acid;
                                e.currentTarget.style.background = "rgba(237,255,102,0.06)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!dryRunOpen) {
                                e.currentTarget.style.borderColor = S.border;
                                e.currentTarget.style.color = "rgba(255,255,255,0.45)";
                                e.currentTarget.style.background = "transparent";
                              }
                            }}
                          >
                            <Columns2 size={13} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" style={{ fontSize: 11, background: "#0d0d10", border: `1px solid ${S.border}`, borderRadius: 7 }}>
                          {dryRunOpen ? "Hide dry-run window" : "Show dry-run window beside editor"}
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={handleRun}
                            disabled={running || submitting}
                            style={{ display: "flex", alignItems: "center", gap: 5, height: 28, padding: "0 12px", borderRadius: 7, border: `1px solid ${S.border}`, background: "transparent", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)", opacity: running || submitting ? 0.4 : 1, transition: "all 0.15s" }}
                            onMouseEnter={(e) => {
                              if (!running && !submitting) {
                                e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
                                e.currentTarget.style.color = "#fff";
                                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = S.border;
                              e.currentTarget.style.color = "rgba(255,255,255,0.45)";
                              e.currentTarget.style.background = "transparent";
                            }}
                          >
                            {running ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> : <Play size={12} />}
                            Run
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" style={{ fontSize: 11, background: "#0d0d10", border: `1px solid ${S.border}`, borderRadius: 7 }}>Run against active test case</TooltipContent>
                      </Tooltip>

                      {isLoggedIn ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={handleSubmit}
                              disabled={submitting || running}
                              style={{ display: "flex", alignItems: "center", gap: 5, height: 28, padding: "0 14px", borderRadius: 7, border: "none", background: S.acid, color: "#09090b", fontSize: 11, fontWeight: 900, letterSpacing: "0.06em", opacity: submitting || running ? 0.45 : 1, marginLeft: 2, transition: "opacity 0.15s" }}
                              onMouseEnter={(e) => { if (!submitting && !running) e.currentTarget.style.opacity = "0.82"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.opacity = (submitting || running) ? "0.45" : "1"; }}
                            >
                              {submitting ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> : <Zap size={12} />}
                              Submit
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" style={{ fontSize: 11, background: "#0d0d10", border: `1px solid ${S.border}`, borderRadius: 7 }}>Submit against all test cases</TooltipContent>
                        </Tooltip>
                      ) : (
                        <Link
                          to="/login"
                          style={{ display: "flex", alignItems: "center", gap: 5, height: 28, padding: "0 12px", borderRadius: 7, border: `1px solid ${S.borderSub}`, color: "rgba(255,255,255,0.62)", textDecoration: "none", fontSize: 11, fontWeight: 700, marginLeft: 2 }}
                        >
                          <LogIn size={12} /> Sign in
                        </Link>
                      )}
                    </div>
                  </div>

                  <div style={{ flex: 1, minHeight: 0 }}>
                    <Editor
                      height="100%"
                      language={currentLang?.monacoId || "cpp"}
                      theme="vs-dark"
                      value={code}
                      onChange={val => setCode(val || "")}
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
                <div style={{ display: "flex", flexDirection: "column", height: "100%", background: S.bg }}>
                  <Tabs value={bottomTab} onValueChange={setBottomTab} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", borderBottom: `1px solid ${S.border}`, padding: "0 4px", flexShrink: 0 }}>
                      <TabsList style={{ background: "transparent", height: 36, padding: 0, display: "flex", gap: 0 }}>
                        {[
                          { value: "testcases", Icon: FlaskConical, label: "Testcases" },
                          {
                            value: "result",
                            Icon: SquareTerminal,
                            label: "Output",
                            dot: (runResult || result)
                              ? (runResult?.status === "Success" || result?.status === "Accepted" ? S.green : S.red)
                              : null,
                          },
                          { value: "flow", Icon: Workflow, label: "Flow" },
                        ].map((tab) => (
                          <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                              padding: "0 12px",
                              height: 36,
                              borderRadius: 0,
                              border: "none",
                              background: "transparent",
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: "0.06em",
                              color: bottomTab === tab.value ? "#fff" : "rgba(255,255,255,0.28)",
                              borderBottom: bottomTab === tab.value ? `1px solid ${S.acid}` : "1px solid transparent",
                              transition: "color 0.15s, border-color 0.15s",
                              marginBottom: -1,
                            }}
                          >
                            <tab.Icon size={12} />
                            {tab.label}
                            {tab.dot && <div style={{ width: 5, height: 5, borderRadius: "50%", background: tab.dot }} />}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>

                    {/* Testcases */}
                    <TabsContent value="testcases" style={{ flex: 1, overflow: "hidden", margin: 0 }}>
                      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 12px", flexShrink: 0, flexWrap: "wrap" }}>
                          {testCases.map((tc, idx) => (
                            <div key={idx} style={{ position: "relative" }}>
                              <button
                                onClick={() => setActiveTestCase(idx)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 5,
                                  padding: "4px 10px",
                                  borderRadius: 7,
                                  border: "none",
                                  fontSize: 11,
                                  fontWeight: 700,
                                  transition: "all 0.15s",
                                  background: activeTestCase === idx ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
                                  outline: activeTestCase === idx ? (tc.isCustom ? "1px solid rgba(237,255,102,0.22)" : `1px solid ${S.border}`) : "1px solid rgba(255,255,255,0.04)",
                                  color: activeTestCase === idx ? "#fff" : "rgba(255,255,255,0.4)",
                                }}
                              >
                                <CircleDot size={9} />
                                {tc.isCustom ? `Custom ${idx - sampleCount + 1}` : `Case ${idx + 1}`}
                              </button>
                              {tc.isCustom && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeTestCase(idx);
                                  }}
                                  style={{ position: "absolute", top: -3, right: -3, width: 13, height: 13, borderRadius: "50%", border: `1px solid ${S.border}`, background: "#0c0c0f", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.42)" }}
                                >
                                  <X size={8} />
                                </button>
                              )}
                            </div>
                          ))}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={addCustomTestCase}
                                style={{ width: 26, height: 26, borderRadius: 7, border: `1px solid ${S.border}`, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.35)" }}
                              >
                                <Plus size={11} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" style={{ fontSize: 11, background: "#0d0d10", border: `1px solid ${S.border}`, borderRadius: 7 }}>Add custom test case</TooltipContent>
                          </Tooltip>
                        </div>

                        <ScrollArea style={{ flex: 1, padding: "0 12px 12px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div>
                              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: S.textMeta, marginBottom: 6 }}>Input</div>
                              <textarea
                                value={testCases[activeTestCase]?.input || ""}
                                onChange={(e) => updateActiveInput(e.target.value)}
                                placeholder="Enter test input…"
                                spellCheck={false}
                                style={{ width: "100%", minHeight: 80, borderRadius: 9, border: `1px solid ${S.border}`, background: S.surface, padding: "8px 12px", fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "rgba(255,255,255,0.7)", outline: "none", resize: "vertical", lineHeight: 1.65 }}
                              />
                            </div>
                            {testCases[activeTestCase]?.output && (
                              <div>
                                <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: S.textMeta, marginBottom: 6 }}>Expected Output</div>
                                <pre style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, background: S.surface, border: `1px solid ${S.border}`, borderRadius: 9, padding: "8px 12px", color: "rgba(255,255,255,0.7)", whiteSpace: "pre-wrap", lineHeight: 1.65, margin: 0 }}>
                                  {testCases[activeTestCase].output}
                                </pre>
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </div>
                    </TabsContent>

                    {/* Output */}
                    <TabsContent value="result" style={{ flex: 1, overflow: "hidden", margin: 0 }}>
                      <ScrollArea style={{ height: "100%", padding: "12px 14px" }}>
                        {!runResult && !result && (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 0", gap: 8, textAlign: "center" }}>
                            <SquareTerminal size={16} color="rgba(255,255,255,0.2)" />
                            <span style={{ fontSize: 12, color: S.textMeta }}>Run your code to see output</span>
                          </div>
                        )}

                        {runResult && (
                          <div style={{ padding: "12px 0", display: "flex", flexDirection: "column", gap: 10 }}>
                            <StatusBanner status={runResult.status} time={runResult.time} compact />
                            {runResult.stdout && <CodeOutput label="Stdout" icon={<SquareTerminal size={10} />}>{runResult.stdout}</CodeOutput>}
                            {runResult.stderr && <CodeOutput label="Stderr" variant="error" icon={<AlertTriangle size={10} />}>{runResult.stderr}</CodeOutput>}
                          </div>
                        )}

                        {result && !runResult && (
                          <div style={{ padding: "12px 0", display: "flex", flexDirection: "column", gap: 10 }}>
                            <StatusBanner status={result.status} time={result.time} compact />
                            {result.totalTests > 0 && (
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 12, color: S.textSec }}>
                                  <span style={{ fontWeight: 800, color: "#fff" }}>{result.totalPassed}</span>/{result.totalTests} passed
                                </span>
                                <div style={{ flex: 1, height: 3, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                                  <div
                                    style={{
                                      height: "100%",
                                      borderRadius: 3,
                                      transition: "width 0.8s ease-out",
                                      width: `${(result.totalPassed / result.totalTests) * 100}%`,
                                      background: result.totalPassed === result.totalTests ? "#10b981" : "#f43f5e",
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                            {result.error && <CodeOutput variant="error">{result.error}</CodeOutput>}
                          </div>
                        )}
                      </ScrollArea>
                    </TabsContent>

                    {/* Flow — kept mounted (display-toggled) so the Visualize Flow
                        affordance can trigger a trace before the tab is shown and so
                        trace/playback state survives tab switches. */}
                    <div
                      style={{
                        flex: bottomTab === "flow" ? 1 : "0 0 0",
                        minHeight: 0,
                        display: bottomTab === "flow" ? "flex" : "none",
                        flexDirection: "column",
                        overflow: "hidden",
                      }}
                    >
                      <CodeFlowPanel
                        ref={codeFlowRef}
                        flow={flow}
                        language={language}
                        code={code}
                        input={customInput}
                        editorRef={editorRef}
                        cursorResolverRef={cursorResolverRef}
                        active={bottomTab === "flow" || dryRunOpen}
                      />
                    </div>
                  </Tabs>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          {/* ─── PARALLEL DRY-RUN WINDOW (task 27.1, Requirement R12) ───
              Rendered beside the editor only when toggled on, so the existing
              layout is unaffected by default. Shares the same `flow` instance as
              the Flow tab, so stepping/playing here is reflected there and the
              editor exec-line highlight (shared editorRef) stays in sync. */}
          {dryRunOpen && (
            <>
              <ResizableHandle orientation="horizontal" withHandle />
              <ResizablePanel id="dryrun" defaultSize="32%" minSize="20%" maxSize="50%">
                <div style={{ display: "flex", flexDirection: "column", height: "100%", background: S.bg, borderLeft: `1px solid ${S.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 40, padding: "0 10px", flexShrink: 0, borderBottom: `1px solid ${S.border}`, background: S.bg }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "rgba(255,255,255,0.65)" }}>
                      <Columns2 size={12} color={S.acid} />
                      Dry Run
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setDryRunOpen(false)}
                          style={{ width: 26, height: 26, borderRadius: 7, border: "none", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#fff"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
                        >
                          <X size={13} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" style={{ fontSize: 11, background: "#0d0d10", border: `1px solid ${S.border}`, borderRadius: 7 }}>Hide dry-run window</TooltipContent>
                    </Tooltip>
                  </div>
                  <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <DryRunPanel
                      trace={flow.trace}
                      status={flow.status}
                      error={flow.error}
                      step={flow.step}
                      totalSteps={flow.totalSteps}
                      playing={flow.playing}
                      speed={flow.speed}
                      onForward={flow.stepForward}
                      onBackward={flow.stepBackward}
                      onPlayPause={flow.togglePlay}
                      onReset={flow.reset}
                      onSpeedChange={flow.setSpeed}
                    />
                  </div>
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </TooltipProvider>
  );
}

/* ────────────────────────────────────────────
   SUB-COMPONENTS
   ──────────────────────────────────────────── */

const STATUS_MAP = {
  Accepted: { icon: CheckCircle2, color: S.green, bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.22)" },
  Success: { icon: CheckCircle2, color: S.green, bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.22)" },
  "Wrong Answer": { icon: XCircle, color: S.red, bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.2)" },
  "Compilation Error": { icon: AlertTriangle, color: S.red, bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.2)" },
  "Runtime Error": { icon: AlertTriangle, color: S.amber, bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.22)" },
  "Time Limit Exceeded": { icon: Clock, color: S.amber, bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.22)" },
  Error: { icon: AlertTriangle, color: S.red, bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.2)" },
};

function StatusBanner({ status, time, compact }) {
  const cfg = STATUS_MAP[status] || STATUS_MAP.Error;
  const Icon = cfg.icon;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 10, border: `1px solid ${cfg.border}`, background: cfg.bg, padding: compact ? "7px 12px" : "9px 14px" }}>
      <Icon size={compact ? 14 : 16} color={cfg.color} />
      <span style={{ fontWeight: 900, fontSize: compact ? 13 : 14, color: cfg.color, flex: 1 }}>{status}</span>
      {time > 0 && (
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", padding: "2px 7px", borderRadius: 6, fontFamily: "monospace" }}>
          <Clock size={10} /> {time}ms
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
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5, fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: isError ? S.red : S.textMeta }}>
          {icon} {label}
        </div>
      )}
      <pre style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: size === "sm" ? 12 : 13, borderRadius: 9, border: `1px solid ${isError ? "rgba(248,113,113,0.2)" : S.borderSub}`, background: isError ? "rgba(127,29,29,0.2)" : S.surface, padding: "8px 12px", color: isError ? "#fca5a5" : "rgba(255,255,255,0.68)", whiteSpace: "pre-wrap", lineHeight: 1.65, margin: 0, overflowX: "auto" }}>
        {children}
      </pre>
    </div>
  );
}