import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X, Lock, CheckCircle, Play, RotateCcw, ZoomIn, ZoomOut,
  Home, MapPin, Bug, ChevronRight, Sparkles, Eye, Trophy,
  Target, ArrowLeft, Hash
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
import { GridPattern } from '@/components/ui/grid-pattern';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import './WorldMap.css';

/* ─── status config for badges ─── */
const statusConfig = {
  completed: { icon: CheckCircle, label: 'Completed', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40' },
  current:   { icon: Target,      label: 'Current',   cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/40' },
  available: { icon: Play,        label: 'Available',  cls: 'bg-zinc-100/10 text-zinc-200 border-zinc-500/40' },
  locked:    { icon: Lock,        label: 'Locked',     cls: 'bg-zinc-800/50 text-zinc-500 border-zinc-700' },
};

/**
 * DSA Conquest World Map
 * Redesigned with: shadcn Dock · GridPattern · Badge
 * Professional minimal dark UI
 */
const WorldMap = () => {
  const navigate = useNavigate();
  const transformRef = useRef(null);
  const mapContainerRef = useRef(null);

  /* ── local state ── */
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: '' });
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [currentPositionMarker, setCurrentPositionMarker] = useState(null);
  const [isHighRes, setIsHighRes] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleResolution = useCallback(() => setIsHighRes(p => !p), []);

  /* ── zustand store ── */
  const completedProblems = useProgressStore(s => s.completedProblems);
  const {
    completeProblem, getProblemState, getCurrentRoadmapProblem,
    getRoadmapIndex, getStageProgress, getTotalProgress,
    resetProgress, markStageComplete,
  } = useProgressStore();

  /* ───────────────────────────────────────────────
     COUNTRY HELPERS (SVG path identification)
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
        const mappedCode = COUNTRY_NAME_TO_CODE[originalClass];
        if (mappedCode === countryId) { element = path; break; }
      }
    }

    if (!element) return null;
    const viewBox = svg.viewBox.baseVal;
    const svgRect = svg.getBoundingClientRect();
    const bbox = element.getBBox();
    const centerX = bbox.x + bbox.width / 2;
    const centerY = bbox.y + bbox.height / 2;
    const scaleX = svgRect.width / viewBox.width;
    const scaleY = svgRect.height / viewBox.height;
    return { x: centerX * scaleX, y: centerY * scaleY, svgX: centerX, svgY: centerY };
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

  /* ── CSS class painter — applies state classes to SVG paths ── */
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
      const stageColor = STAGES[problem.stage]?.color || '#6366f1';
      path.style.setProperty('--topic-color', stageColor);
      path.classList.add(`country-${state}`);
    });
  }, [getCountryId, getProblemState, completedProblems]);

  /* effects — paint & marker */
  useEffect(() => {
    applyCountryStyles();
    const t = setTimeout(applyCountryStyles, 100);
    return () => clearTimeout(t);
  }, [applyCountryStyles]);

  useEffect(() => { updatePositionMarker(); }, [completedProblems, updatePositionMarker]);

  useEffect(() => {
    const check = () => {
      const svg = mapContainerRef.current?.querySelector('svg');
      if (svg && svg.querySelectorAll('path').length > 0) {
        applyCountryStyles();
        updatePositionMarker();
        return true;
      }
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
    if (!el) return;
    transformRef.current.zoomToElement(el, scale, 400, 'easeOut');
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

  const goToProblem = useCallback(() => {
    if (selectedProblem) navigate(selectedProblem.route);
  }, [selectedProblem, navigate]);

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
      'skill-tree-wrapper relative flex flex-col w-full h-screen bg-[#09090b] overflow-hidden font-sans text-zinc-50',
      isHighRes && 'high-res-mode'
    )}>

      {/* ── Grid Pattern background ── */}
      <GridPattern
        width={48}
        height={48}
        className="absolute inset-0 z-0 fill-zinc-800/20 stroke-zinc-800/30 [mask-image:radial-gradient(700px_circle_at_center,white,transparent)]"
      />

      {/* ══════════════════ TOP BAR ══════════════════ */}
      <header className="absolute top-0 inset-x-0 z-[100] flex items-center justify-between px-5 py-3 bg-gradient-to-b from-[#09090b] via-[#09090b]/80 to-transparent">
        {/* left — back + title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="grid place-items-center w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-50 hover:border-zinc-600 transition-colors"
            title="Back to Home"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-sm font-semibold tracking-tight leading-none text-zinc-100">DSA Conquest Map</h1>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              {totalProgress.completed} / {totalProgress.total} problems solved
            </p>
          </div>
        </div>

        {/* center — progress bar */}
        <div className="hidden md:flex items-center gap-3">
          <div className="w-44 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-zinc-400 to-emerald-500 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[11px] font-medium text-zinc-400 tabular-nums">{pct}%</span>
        </div>

        {/* right — compact actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleResolution}
            className={cn(
              'grid place-items-center h-7 px-2 rounded-md text-[11px] font-medium border transition-colors',
              isHighRes
                ? 'bg-zinc-100/10 border-zinc-500 text-zinc-200'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
            )}
          >
            <span className="flex items-center gap-1"><Sparkles size={12} />{isHighRes ? 'HD' : 'SD'}</span>
          </button>
          <button
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            className="grid place-items-center w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Debug Panel"
          >
            <Bug size={14} />
          </button>
          <button
            onClick={resetProgress}
            className="grid place-items-center w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-900 transition-colors"
            title="Reset Progress"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </header>

      {/* ══════════════════ STAGES SIDEBAR ══════════════════ */}
      <aside className={cn(
        'absolute top-16 left-3 z-[100] flex flex-col gap-1 transition-all duration-300',
        sidebarOpen ? 'w-56' : 'w-9'
      )}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="grid place-items-center w-9 h-9 rounded-lg bg-zinc-900/90 backdrop-blur border border-zinc-800 text-zinc-400 hover:text-zinc-50 transition-colors shrink-0"
          title={sidebarOpen ? 'Collapse stages' : 'Expand stages'}
        >
          <Hash size={16} />
        </button>

        {sidebarOpen && (
          <div className="flex flex-col gap-0.5 max-h-[calc(100vh-140px)] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800 animate-in fade-in slide-in-from-left-2 duration-200">
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
                    'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] text-left transition-all',
                    'bg-zinc-900/80 backdrop-blur border border-zinc-800 hover:border-zinc-600 hover:translate-x-0.5',
                    prog.isComplete && 'border-emerald-800/60 bg-emerald-500/5'
                  )}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                  <span className="flex-1 truncate text-zinc-300 font-medium">{stage.name}</span>
                  <span className={cn(
                    'text-[10px] tabular-nums px-1.5 py-px rounded',
                    prog.isComplete ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                  )}>
                    {prog.completed}/{prog.total}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </aside>

      {/* ══════════════════ BOTTOM DOCK ══════════════════ */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[100]">
        <Dock
          iconSize={36}
          iconMagnification={52}
          iconDistance={120}
          className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800 h-14 px-3 gap-2 rounded-xl"
        >
          <DockIcon className="bg-zinc-800 hover:bg-zinc-700 transition-colors" onClick={() => transformRef.current?.zoomIn()}>
            <ZoomIn size={18} className="text-zinc-300" />
          </DockIcon>
          <DockIcon className="bg-zinc-800 hover:bg-zinc-700 transition-colors" onClick={resetZoom}>
            <Home size={18} className="text-zinc-300" />
          </DockIcon>
          <DockIcon className="bg-zinc-800 hover:bg-zinc-700 transition-colors" onClick={() => transformRef.current?.zoomOut()}>
            <ZoomOut size={18} className="text-zinc-300" />
          </DockIcon>

          {/* dock separator */}
          <div className="h-8 w-px bg-zinc-700/60 mx-1" />

          <DockIcon className="bg-yellow-500/15 hover:bg-yellow-500/25 transition-colors" onClick={jumpToCurrentProblem}>
            <MapPin size={18} className="text-yellow-400" />
          </DockIcon>
          <DockIcon className="bg-zinc-800 hover:bg-zinc-700 transition-colors" onClick={() => setSidebarOpen(o => !o)}>
            <Eye size={18} className="text-zinc-300" />
          </DockIcon>
        </Dock>
      </div>

      {/* ══════════════════ CURRENT PROBLEM PILL ══════════════════ */}
      {currentRoadmapProblem && (
        <button
          onClick={jumpToCurrentProblem}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs font-medium backdrop-blur-sm hover:bg-yellow-500/20 transition-colors"
        >
          <MapPin size={13} className="animate-pulse" />
          <span>Next: {currentRoadmapProblem.title}</span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-yellow-500/40 text-yellow-400">
            #{roadmapIndex + 1}
          </Badge>
          <ChevronRight size={13} />
        </button>
      )}

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
          <div ref={mapContainerRef} className="map-container" onClick={handleMapClick}>
            <Map className="world-svg" />

            {/* position marker */}
            {currentPositionMarker && (
              <svg
                className="position-marker-overlay"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}
                viewBox="0 0 2000 857"
                preserveAspectRatio="xMidYMid meet"
              >
                <circle cx={currentPositionMarker.x} cy={currentPositionMarker.y} r="12" fill="rgba(250,204,21,0.25)" className="pulse-ring" />
                <circle cx={currentPositionMarker.x} cy={currentPositionMarker.y} r="5" fill="#facc15" stroke="#18181b" strokeWidth="2" />
              </svg>
            )}
          </div>
        </TransformComponent>
      </TransformWrapper>

      {/* ══════════════════ TOOLTIP ══════════════════ */}
      {tooltip.visible && (
        <div
          className="fixed z-[1000] px-2.5 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs pointer-events-none animate-in fade-in"
          style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
        >
          {tooltip.content}
        </div>
      )}

      {/* ══════════════════ DEBUG MODAL ══════════════════ */}
      {showDebugPanel && (
        <div
          className="fixed inset-0 z-[500] grid place-items-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowDebugPanel(false)}
        >
          <div
            className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-xl bg-zinc-900 border border-zinc-800 p-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-100">Debug — Mark stages complete</h3>
              <button onClick={() => setShowDebugPanel(false)} className="text-zinc-500 hover:text-zinc-200 transition-colors">
                <X size={18} />
              </button>
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
                        ? 'bg-emerald-500/10 border-emerald-800/50 text-emerald-400 cursor-default'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:border-zinc-500'
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
        'fixed top-0 right-0 h-full w-[380px] max-w-full z-[200] bg-zinc-950/95 backdrop-blur-xl border-l border-zinc-800 transition-transform duration-300',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 grid place-items-center w-8 h-8 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
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
                <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                  {STAGES[selectedProblem.stage]?.name}
                </span>
              </div>
              <h2 className="text-xl font-bold text-zinc-50 leading-tight">{selectedProblem.title}</h2>
            </div>

            {/* meta badges */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-zinc-700 text-zinc-500">
                Problem #{selectedProblem.order}
              </Badge>
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-zinc-700 text-zinc-500">
                Roadmap #{FULL_ROADMAP.findIndex(p => p.id === selectedProblem.id) + 1}
              </Badge>
            </div>

            {/* divider */}
            <div className="h-px bg-zinc-800" />

            {/* actions */}
            <div className="flex flex-col gap-2">
              {(selectedProblem.state === 'available' || selectedProblem.state === 'current') && (
                <>
                  <button
                    onClick={goToProblem}
                    className="flex items-center justify-center gap-2 h-10 rounded-lg bg-zinc-50 text-zinc-950 text-sm font-semibold hover:bg-zinc-200 transition-colors"
                  >
                    <Play size={15} /> Start Problem
                  </button>
                  <button
                    onClick={markComplete}
                    className="flex items-center justify-center gap-2 h-10 rounded-lg border border-zinc-800 text-zinc-400 text-sm font-medium hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                  >
                    <CheckCircle size={15} /> Mark Complete
                  </button>
                </>
              )}
              {selectedProblem.state === 'completed' && (
                <>
                  <button
                    onClick={goToProblem}
                    className="flex items-center justify-center gap-2 h-10 rounded-lg bg-zinc-50 text-zinc-950 text-sm font-semibold hover:bg-zinc-200 transition-colors"
                  >
                    <Play size={15} /> Review Problem
                  </button>
                  <div className="flex items-center justify-center gap-1.5 py-2 text-emerald-400 text-xs">
                    <Trophy size={14} /> Challenge conquered!
                  </div>
                </>
              )}
            </div>

            {/* route */}
            <code className="block px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-500 font-mono truncate">
              {selectedProblem.route}
            </code>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorldMap;
