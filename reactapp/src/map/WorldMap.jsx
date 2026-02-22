import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X, Lock, CheckCircle, Play, RotateCcw, ZoomIn, ZoomOut,
  Home, MapPin, Bug, ChevronRight, Sparkles, Trophy,
  Target, ArrowLeft, Moon, Sun, ChevronDown, ChevronUp,
} from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as Map } from './world.svg';
import useProgressStore, {
  STAGES,
  STAGE_ORDER,
  FULL_ROADMAP,
  COUNTRY_NAME_TO_CODE,
  CODE_TO_COUNTRY_NAME,
  getProblemsByStage,
  getProblemForCountry,
  getCountryForProblem,
} from './useProgressStore';

import { Dock, DockIcon } from '@/components/ui/dock';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import './WorldMap.css';

/* ─── status badge config ─── */
const statusConfig = {
  completed: {
    icon: CheckCircle, label: 'Completed',
    cls: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40',
  },
  current: {
    icon: Target, label: 'Current',
    cls: 'bg-[#5542FF]/10 text-[#5542FF] dark:text-[#B28EF2] border-[#5542FF]/40',
  },
  available: {
    icon: Play, label: 'Available',
    cls: 'bg-secondary text-muted-foreground border-border',
  },
  locked: {
    icon: Lock, label: 'Locked',
    cls: 'bg-muted/50 text-muted-foreground border-border opacity-60',
  },
};

/**
 * DSA Conquest World Map
 * Dock · DotPattern · Badge · Dual-theme
 */
const WorldMap = () => {
  const navigate = useNavigate();
  const transformRef = useRef(null);
  const mapContainerRef = useRef(null);
  const { theme, setTheme } = useTheme();

  /* ── local state ── */
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: '' });
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [currentPositionMarker, setCurrentPositionMarker] = useState(null);
  const [isHighRes, setIsHighRes] = useState(false);
  const [stagesOpen, setStagesOpen] = useState(false);

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');
  const toggleResolution = useCallback(() => setIsHighRes(p => !p), []);

  /* ── zustand store ── */
  const completedProblems = useProgressStore(s => s.completedProblems);
  const {
    completeProblem, getProblemState, getCurrentRoadmapProblem,
    getRoadmapIndex, getStageProgress, getTotalProgress,
    resetProgress, markStageComplete,
  } = useProgressStore();

  /* ───────────────────────────────────────────────
     COUNTRY HELPERS
     ─────────────────────────────────────────────── */
  const getCountryId = useCallback((path) => {
    const id = path.getAttribute('id');
    if (id && id.length >= 2 && id.length <= 3) return id;
    const originalClass = path.dataset.originalClass;
    if (originalClass && COUNTRY_NAME_TO_CODE[originalClass]) return COUNTRY_NAME_TO_CODE[originalClass];
    const className = path.getAttribute('class');
    if (className && COUNTRY_NAME_TO_CODE[className]) return COUNTRY_NAME_TO_CODE[className];
    const name = path.getAttribute('name');
    if (name && COUNTRY_NAME_TO_CODE[name]) return COUNTRY_NAME_TO_CODE[name];
    return id || className || null;
  }, []);

  const getCountryCenter = useCallback((countryId) => {
    const svg = mapContainerRef.current?.querySelector('svg');
    if (!svg) return null;
    const paths = svg.querySelectorAll('path');
    let element = null;
    const countryName = CODE_TO_COUNTRY_NAME[countryId];
    for (const path of paths) {
      const pathId = path.getAttribute('id');
      if (pathId === countryId) { element = path; break; }
      const originalClass = path.dataset.originalClass || path.getAttribute('class');
      if (originalClass) {
        if (countryName && originalClass === countryName) { element = path; break; }
        if (COUNTRY_NAME_TO_CODE[originalClass] === countryId) { element = path; break; }
      }
    }
    if (!element) return null;
    const viewBox = svg.viewBox.baseVal;
    const svgRect = svg.getBoundingClientRect();
    const bbox = element.getBBox();
    const cx = bbox.x + bbox.width / 2;
    const cy = bbox.y + bbox.height / 2;
    return { x: cx * (svgRect.width / viewBox.width), y: cy * (svgRect.height / viewBox.height), svgX: cx, svgY: cy };
  }, []);

  /* ── position marker ── */
  const updatePositionMarker = useCallback(() => {
    const cur = getCurrentRoadmapProblem();
    if (!cur) { setCurrentPositionMarker(null); return; }
    const cid = getCountryForProblem(cur.id);
    if (!cid) { setCurrentPositionMarker(null); return; }
    const coords = getCountryCenter(cid);
    if (!coords) { setCurrentPositionMarker(null); return; }
    setCurrentPositionMarker({ x: coords.svgX, y: coords.svgY, problem: cur, countryId: cid });
  }, [getCurrentRoadmapProblem, getCountryCenter]);

  /* ── SVG class painter ── */
  const applyCountryStyles = useCallback(() => {
    const svg = mapContainerRef.current?.querySelector('svg');
    if (!svg) return;
    svg.querySelectorAll('path').forEach((path) => {
      if (!path.dataset.originalClass) {
        const oc = path.getAttribute('class');
        if (oc) path.dataset.originalClass = oc;
      }
      const countryId = getCountryId(path);
      if (!countryId) return;
      const problem = getProblemForCountry(countryId);
      path.classList.remove('country-completed', 'country-current', 'country-available', 'country-locked', 'country-placeholder');
      if (!problem) { path.classList.add('country-placeholder'); return; }
      const state = getProblemState(problem.id);
      path.style.setProperty('--topic-color', STAGES[problem.stage]?.color || '#6366f1');
      path.classList.add(`country-${state}`);
    });
  }, [getCountryId, getProblemState, completedProblems]);

  useEffect(() => { applyCountryStyles(); const t = setTimeout(applyCountryStyles, 100); return () => clearTimeout(t); }, [applyCountryStyles]);
  useEffect(() => { updatePositionMarker(); }, [completedProblems, updatePositionMarker]);
  useEffect(() => {
    const check = () => {
      const svg = mapContainerRef.current?.querySelector('svg');
      if (svg && svg.querySelectorAll('path').length > 0) { applyCountryStyles(); updatePositionMarker(); return true; }
      return false;
    };
    if (check()) return;
    const ts = [100, 300, 500, 1000].map(d => setTimeout(check, d));
    return () => ts.forEach(clearTimeout);
  }, [applyCountryStyles, updatePositionMarker]);

  /* ───────────────────────────────────────────────
     ZOOM / INTERACTION
     ─────────────────────────────────────────────── */
  const zoomToCountry = useCallback((countryId, scale = 4) => {
    if (!transformRef.current || !mapContainerRef.current) return;
    const svg = mapContainerRef.current.querySelector('svg');
    if (!svg) return;
    let el = null;
    const countryName = CODE_TO_COUNTRY_NAME[countryId];
    for (const p of svg.querySelectorAll('path')) {
      if (p.getAttribute('id') === countryId) { el = p; break; }
      const pc = p.getAttribute('class');
      if (pc && (pc === countryName || COUNTRY_NAME_TO_CODE[pc] === countryId)) { el = p; break; }
    }
    if (el) transformRef.current.zoomToElement(el, scale, 400, 'easeOut');
  }, []);

  const handleMapClick = useCallback((e) => {
    const path = e.target.closest('path');
    if (!path) return;
    const countryId = getCountryId(path);
    if (!countryId) return;
    const problem = getProblemForCountry(countryId);
    if (!problem) {
      setTooltip({ visible: true, x: e.clientX, y: e.clientY, content: 'No problem mapped here' });
      setTimeout(() => setTooltip(t => ({ ...t, visible: false })), 2000);
      return;
    }
    const state = getProblemState(problem.id);
    if (state === 'locked') {
      setTooltip({ visible: true, x: e.clientX, y: e.clientY, content: 'Complete previous problems first' });
      setTimeout(() => setTooltip(t => ({ ...t, visible: false })), 2000);
      return;
    }
    setSelectedProblem({ ...problem, state, countryId });
    setIsOpen(true);
  }, [getCountryId, getProblemState]);

  const goToProblem = useCallback(() => { if (selectedProblem) navigate(selectedProblem.route); }, [selectedProblem, navigate]);

  const markComplete = useCallback(() => {
    if (!selectedProblem) return;
    const result = completeProblem(selectedProblem.id);
    if (result.success) {
      if (result.nextProblem) {
        const nid = getCountryForProblem(result.nextProblem.id);
        setSelectedProblem({ ...result.nextProblem, state: getProblemState(result.nextProblem.id), countryId: nid });
        if (nid) setTimeout(() => zoomToCountry(nid, 5), 300);
      } else {
        setSelectedProblem(prev => prev ? { ...prev, state: 'completed' } : null);
      }
    }
  }, [selectedProblem, completeProblem, getProblemState, zoomToCountry]);

  const resetZoom = useCallback(() => transformRef.current?.resetTransform(500, 'easeOut'), []);
  const jumpToCurrentProblem = useCallback(() => {
    const cur = getCurrentRoadmapProblem();
    if (!cur) return;
    const cid = getCountryForProblem(cur.id);
    if (cid) zoomToCountry(cid, 5);
  }, [getCurrentRoadmapProblem, zoomToCountry]);

  /* ── derived data ── */
  const totalProgress = getTotalProgress();
  const roadmapIndex = getRoadmapIndex();
  const currentRoadmapProblem = getCurrentRoadmapProblem();
  const pct = totalProgress.percentage;

  /* ═══════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════ */
  return (
    <div className={cn(
      'skill-tree-wrapper relative flex flex-col w-full h-screen overflow-hidden font-sans',
      'bg-background text-foreground',
      isHighRes && 'high-res-mode',
    )}>

      {/* ── Lined grid background ── */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, var(--wm-grid) 1px, transparent 1px), linear-gradient(to bottom, var(--wm-grid) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, white, transparent)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, white, transparent)',
        }}
      />

      {/* ══════════════════ TOP BAR ══════════════════ */}
      <header className="absolute top-0 inset-x-0 z-[100] flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-md border-b border-border">
        {/* left — back + title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="grid place-items-center w-8 h-8 rounded-lg bg-secondary border border-border wm-icon hover:bg-accent transition-colors"
            title="Back to Home"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-sm font-semibold tracking-tight leading-none text-foreground">DSA Conquest Map</h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {totalProgress.completed} / {totalProgress.total} problems
            </p>
          </div>
        </div>

        {/* center — progress */}
        <div className="hidden md:flex items-center gap-3">
          <div className="w-44 h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: 'linear-gradient(to right, #5542FF, #B28EF2)' }} />
          </div>
          <span className="text-[11px] font-medium text-muted-foreground tabular-nums">{pct}%</span>
        </div>

        {/* right — actions */}
        <div className="flex items-center gap-1.5">
          {/* theme toggle */}
          <button
            onClick={toggleTheme}
            className="grid place-items-center w-7 h-7 rounded-md bg-secondary border border-border wm-icon hover:bg-accent transition-colors"
            title="Toggle theme"
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button
            onClick={toggleResolution}
            className={cn(
              'grid place-items-center h-7 px-2 rounded-md text-[11px] font-medium border transition-colors',
              isHighRes
                ? 'bg-[#5542FF] text-white border-[#5542FF]/50'
                : 'bg-secondary border-border wm-icon hover:bg-accent'
            )}
          >
            <span className="flex items-center gap-1">{isHighRes ? 'HD' : 'SD'}</span>
          </button>
          <button
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            className="grid place-items-center w-7 h-7 rounded-md bg-secondary border border-border wm-icon hover:bg-accent transition-colors"
            title="Debug"
          >
            <Bug size={14} />
          </button>
          <button
            onClick={resetProgress}
            className="grid place-items-center w-7 h-7 rounded-md bg-secondary border border-border wm-icon hover:text-destructive hover:border-destructive/40 transition-colors"
            title="Reset Progress"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </header>

      {/* ══════════════════ MAP CANVAS ══════════════════ */}
      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={0.5}
        maxScale={10}
        limitToBounds={false}
        centerOnInit
        wheel={{ step: 0.08, smoothStep: 0.004 }}
        panning={{ velocityDisabled: true }}
        doubleClick={{ disabled: true }}
        alignmentAnimation={{ disabled: true }}
        velocityAnimation={{ disabled: true }}
      >
        <TransformComponent
          wrapperStyle={{ width: '100%', height: '100%' }}
          contentStyle={{ width: '100%', height: '100%' }}
        >
          <div ref={mapContainerRef} className="map-container relative z-[1]" onClick={handleMapClick}>
            <Map className="world-svg" />
            {currentPositionMarker && (
              <svg
                className="position-marker-overlay"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}
                viewBox="0 0 2000 857"
                preserveAspectRatio="xMidYMid meet"
              >
                <circle cx={currentPositionMarker.x} cy={currentPositionMarker.y} r="12" fill="rgba(237,255,102,0.22)" className="pulse-ring" />
                <circle cx={currentPositionMarker.x} cy={currentPositionMarker.y} r="5" fill="#EDFF66" stroke={isDark ? '#3d2fff' : '#5542FF'} strokeWidth="2" />
              </svg>
            )}
          </div>
        </TransformComponent>
      </TransformWrapper>

      {/* ══════════════════ BOTTOM DOCK ══════════════════ */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[100]">
        <Dock
          iconSize={36}
          iconMagnification={52}
          iconDistance={120}
          className="bg-background/85 backdrop-blur-xl border-border h-14 px-3 gap-2 rounded-xl shadow-lg shadow-black/5"
        >
          <DockIcon
            className="bg-secondary hover:bg-accent transition-colors"
            onClick={() => transformRef.current?.zoomIn()}
          >
            <ZoomIn size={18} className="wm-icon" />
          </DockIcon>
          <DockIcon
            className="bg-secondary hover:bg-accent transition-colors"
            onClick={resetZoom}
          >
            <Home size={18} className="wm-icon" />
          </DockIcon>
          <DockIcon
            className="bg-secondary hover:bg-accent transition-colors"
            onClick={() => transformRef.current?.zoomOut()}
          >
            <ZoomOut size={18} className="wm-icon" />
          </DockIcon>

          <div className="h-8 w-px bg-border mx-1" />

          <DockIcon
            className="bg-secondary hover:bg-accent transition-colors"
            onClick={jumpToCurrentProblem}
          >
            <MapPin size={18} className="wm-icon" />
          </DockIcon>
          <DockIcon
            className="bg-secondary hover:bg-accent transition-colors"
            onClick={() => setStagesOpen(o => !o)}
          >
            {stagesOpen
              ? <ChevronDown size={18} className="wm-icon" />
              : <ChevronUp   size={18} className="wm-icon" />}
          </DockIcon>
        </Dock>
      </div>

      {/* ══════════════════ CURRENT PROBLEM PILL ══════════════════ */}
      {currentRoadmapProblem && !stagesOpen && (
        <button
          onClick={jumpToCurrentProblem}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm border border-border text-foreground text-xs font-medium shadow-sm hover:bg-accent transition-colors"
        >
          <MapPin size={13} className="wm-icon-purple animate-pulse" />
          <span className="max-w-[180px] truncate">Next: {currentRoadmapProblem.title}</span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border text-muted-foreground">
            #{roadmapIndex + 1}
          </Badge>
          <ChevronRight size={13} />
        </button>
      )}

      {/* ══════════════════ STAGES BOTTOM SHEET ══════════════════ */}
      <div className={cn(
        'absolute bottom-20 inset-x-3 z-[99] transition-all duration-300 ease-out',
        stagesOpen
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      )}>
        <div className="rounded-xl border border-border bg-background/90 backdrop-blur-xl shadow-xl shadow-black/5 overflow-hidden">
          {/* sheet header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <span className="text-xs font-semibold text-foreground">Stages</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground tabular-nums">{totalProgress.completed}/{totalProgress.total}</span>
              <button onClick={() => setStagesOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* scrollable chip grid */}
          <ScrollArea className="max-h-48 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 p-3">
              {STAGE_ORDER.map((key) => {
                const stage = STAGES[key];
                const prog = getStageProgress(key);
                return (
                  <button
                    key={key}
                    onClick={() => {
                      const problems = getProblemsByStage(key);
                      if (problems.length) {
                        const cid = getCountryForProblem(problems[0].id);
                        if (cid) zoomToCountry(cid, 3);
                      }
                    }}
                    className={cn(
                      'group flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] text-left transition-all border',
                      'bg-card border-border',
                      'hover:border-foreground/25 hover:bg-accent hover:shadow-sm',
                      prog.isComplete && 'border-[#5542FF]/40 bg-[#5542FF]/5 dark:bg-[#5542FF]/10'
                    )}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                    <span className="flex-1 truncate text-muted-foreground font-medium group-hover:text-foreground transition-colors">
                      {stage.name}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[9px] px-1 py-0 shrink-0 font-mono',
                        prog.isComplete
                          ? 'border-[#5542FF]/40 text-[#5542FF] dark:text-[#B28EF2] dark:border-[#B28EF2]/40'
                          : 'border-zinc-300 dark:border-zinc-700 text-zinc-500'
                      )}
                    >
                      {prog.completed}/{prog.total}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* ══════════════════ TOOLTIP ══════════════════ */}
      {tooltip.visible && (
        <div
          className="fixed z-[1000] px-2.5 py-1.5 rounded-md bg-popover border border-border text-popover-foreground text-xs pointer-events-none shadow-sm animate-in fade-in"
          style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
        >
          {tooltip.content}
        </div>
      )}

      {/* ══════════════════ DEBUG MODAL ══════════════════ */}
      {showDebugPanel && (
        <div className="fixed inset-0 z-[500] grid place-items-center bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => setShowDebugPanel(false)}>
          <div className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-xl bg-popover border border-border p-5 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Debug — Mark stages complete</h3>
              <button onClick={() => setShowDebugPanel(false)} className="text-muted-foreground hover:text-foreground transition-colors"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STAGE_ORDER.map(key => {
                const stage = STAGES[key];
                const prog = getStageProgress(key);
                return (
                  <button
                    key={key}
                    disabled={prog.isComplete}
                    onClick={() => markStageComplete(key)}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] font-medium border transition-colors',
                      prog.isComplete
                        ? 'bg-[#5542FF]/8 dark:bg-[#5542FF]/15 border-[#5542FF]/35 text-[#5542FF] dark:text-[#B28EF2] cursor-default'
                        : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-400 dark:hover:border-zinc-500'
                    )}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                    <span className="truncate">{stage.name}</span>
                    {prog.isComplete && <CheckCircle size={12} className="ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ SIDE PANEL ══════════════════ */}
      <div className={cn(
        'fixed top-0 right-0 h-full w-[380px] max-w-full z-[200] border-l transition-transform duration-300',
        'bg-background/95 backdrop-blur-xl border-border',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 grid place-items-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <X size={18} />
        </button>

        {selectedProblem && (
          <div className="flex flex-col gap-5 p-6 pt-14">
            {/* status badge */}
            {(() => {
              const cfg = statusConfig[selectedProblem.state] || statusConfig.locked;
              const Icon = cfg.icon;
              return (
                <Badge variant="outline" className={cn('w-fit text-[11px] py-0.5 gap-1', cfg.cls)}>
                  <Icon size={12} /> {cfg.label}
                </Badge>
              );
            })()}

            {/* topic + title */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STAGES[selectedProblem.stage]?.color }} />
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  {STAGES[selectedProblem.stage]?.name}
                </span>
              </div>
              <h2 className="text-xl font-bold leading-tight">{selectedProblem.title}</h2>
            </div>

            {/* meta */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-zinc-300 dark:border-zinc-700 text-zinc-500">
                Problem #{selectedProblem.order}
              </Badge>
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-zinc-300 dark:border-zinc-700 text-zinc-500">
                Roadmap #{FULL_ROADMAP.findIndex(p => p.id === selectedProblem.id) + 1}
              </Badge>
            </div>

            <div className="h-px bg-border" />

            {/* actions */}
            <div className="flex flex-col gap-2">
              {(selectedProblem.state === 'available' || selectedProblem.state === 'current') && (
                <>
                  <button
                    onClick={goToProblem}
                    className="flex items-center justify-center gap-2 h-10 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90"
                    style={{ background: 'linear-gradient(to right, #5542FF, #B28EF2)' }}
                  >
                    <Play size={15} /> Start Problem
                  </button>
                  <button
                    onClick={markComplete}
                    className="flex items-center justify-center gap-2 h-10 rounded-lg border border-[#5542FF]/30 text-[#5542FF] dark:text-[#B28EF2] text-sm font-medium hover:bg-[#5542FF]/8 transition-colors"
                  >
                    <CheckCircle size={15} /> Mark Complete
                  </button>
                </>
              )}
              {selectedProblem.state === 'completed' && (
                <>
                  <button
                    onClick={goToProblem}
                    className="flex items-center justify-center gap-2 h-10 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90"
                    style={{ background: 'linear-gradient(to right, #5542FF, #B28EF2)' }}
                  >
                    <Play size={15} /> Review Problem
                  </button>
                  <div className="flex items-center justify-center gap-1.5 py-2 text-[#5542FF] dark:text-[#EDFF66] text-xs">
                    <Trophy size={14} /> Challenge conquered!
                  </div>
                </>
              )}
            </div>

            <code className="block px-3 py-2 rounded-lg bg-muted border border-border text-[11px] text-muted-foreground font-mono truncate">
              {selectedProblem.route}
            </code>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorldMap;
