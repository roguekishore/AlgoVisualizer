import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Clock, ArrowLeft } from "lucide-react";
import { problems as PROBLEM_CATALOG } from "../search/catalog";
import categories from "../data/categories";
import { categoryConfig, getCategoryByKey } from "../routes/config";
import { useTheme } from "./theme-provider";

/* ═══════════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════════ */

const ACCENT_MAP = {
  Sorting: "#f97316", Arrays: "#3b82f6", BinarySearch: "#14b8a6",
  Strings: "#a855f7", Searching: "#10b981", Hashing: "#ef4444",
  LinkedList: "#6366f1", Recursion: "#8b5cf6", BitManipulation: "#64748b",
  Stack: "#7c3aed", Queue: "#ec4899", SlidingWindows: "#0d9488",
  Heaps: "#ea580c", Trees: "#22c55e", Graphs: "#0ea5e9",
  Pathfinding: "#d946ef", GreedyAlgorithms: "#f43f5e",
  Backtracking: "#fb923c", DynamicProgramming: "#c026d3",
  Design: "#06b6d4", MathematicalMiscellaneous: "#2dd4bf",
};

/* Bento grid sizing pattern for visual variety */
const BENTO = [
  [2, 1], [1, 1], [1, 1],
  [1, 2], [1, 1], [2, 1],
  [1, 1], [1, 1], [1, 1],
  [1, 1], [2, 1], [1, 1],
];
const bento = (i) => ({ col: BENTO[i % BENTO.length][0], row: BENTO[i % BENTO.length][1] });

const diffColor = (d) => {
  if (d === "Easy") return { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)", text: "#22c55e" };
  if (d === "Medium") return { bg: "rgba(234,179,8,0.1)", border: "rgba(234,179,8,0.25)", text: "#eab308" };
  if (d === "Hard") return { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)", text: "#ef4444" };
  return { bg: "var(--secondary)", border: "var(--border)", text: "var(--muted-foreground)" };
};

/* ═══════════════════════════════════════════════════════════════════════
   STYLE INJECTION
   ═══════════════════════════════════════════════════════════════════════ */

const STYLE_ID = "algo-cards-styles";

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes ac-fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes ac-pulse {
      0%,100% { opacity: 1; }
      50%     { opacity: .4; }
    }
    @keyframes ac-slideArrow {
      0%   { transform: translateX(0); }
      100% { transform: translateX(4px); }
    }
    @keyframes ac-grainDrift {
      0%,100% { transform: translate(0,0); }
      25%  { transform: translate(-1%,-1%); }
      50%  { transform: translate(1%,1%); }
      75%  { transform: translate(-1%,1%); }
    }

    .ac-grain {
      position: fixed; inset: 0; pointer-events: none; z-index: 9999;
      opacity: 0.028;
      animation: ac-grainDrift 6s steps(4) infinite;
    }

    .ac-card:hover .ac-arrow {
      animation: ac-slideArrow .45s ease infinite alternate;
    }

    .ac-tabs::-webkit-scrollbar { height: 0; width: 0; }
    .ac-tabs { -ms-overflow-style: none; scrollbar-width: none; }

    .ac-bar {
      position: absolute; bottom: 0; height: 2px; border-radius: 1px;
      transition: left .3s cubic-bezier(.4,0,.2,1), width .3s cubic-bezier(.4,0,.2,1), background .3s ease;
    }

    /* Responsive collapse bento to 1-col on mobile */
    @media (max-width: 900px) {
      .ac-card { grid-column: span 1 !important; }
    }
    @media (max-width: 640px) {
      .ac-card { grid-column: span 1 !important; grid-row: span 1 !important; }
    }
  `;
  document.head.appendChild(s);
}

/* ═══════════════════════════════════════════════════════════════════════
   3D TILT HOOK
   ═══════════════════════════════════════════════════════════════════════ */

function useTilt(ref) {
  const [style, setStyle] = useState({});
  const onMove = useCallback((e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    setStyle({
      transform: `perspective(700px) rotateX(${y * -8}deg) rotateY(${x * 8}deg) scale(1.015)`,
      transition: "transform .1s ease-out",
    });
  }, [ref]);
  const onLeave = useCallback(() => {
    setStyle({ transform: "perspective(700px) rotateX(0) rotateY(0) scale(1)", transition: "transform .4s ease-out" });
  }, []);
  return { tiltStyle: style, onMouseMove: onMove, onMouseLeave: onLeave };
}

/* ═══════════════════════════════════════════════════════════════════════
   GRAIN SVG
   ═══════════════════════════════════════════════════════════════════════ */

const Grain = () => (
  <svg className="ac-grain" width="100%" height="100%">
    <filter id="acNoise">
      <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="4" stitchTiles="stitch" />
    </filter>
    <rect width="100%" height="100%" filter="url(#acNoise)" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════════════════
   EYEBROW PILL
   ═══════════════════════════════════════════════════════════════════════ */

const Eyebrow = ({ text, accent }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 7,
    padding: "5px 14px", borderRadius: 999,
    background: `color-mix(in srgb, ${accent} 8%, transparent)`,
    border: `1px solid color-mix(in srgb, ${accent} 18%, transparent)`,
    marginBottom: 14,
  }}>
    <span style={{
      width: 6, height: 6, borderRadius: "50%", background: accent,
      animation: "ac-pulse 2s ease-in-out infinite",
    }} />
    <span style={{
      fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 600,
      letterSpacing: ".1em", textTransform: "uppercase", color: accent,
    }}>{text}</span>
  </span>
);

/* ═══════════════════════════════════════════════════════════════════════
   CATEGORY TAB ROW
   ═══════════════════════════════════════════════════════════════════════ */

const Tabs = ({ items, activeKey, onSelect }) => {
  const boxRef = useRef(null);
  const refs = useRef({});
  const [bar, setBar] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const el = refs.current[activeKey];
    if (el && boxRef.current) {
      const br = boxRef.current.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      setBar({ left: er.left - br.left + boxRef.current.scrollLeft, width: er.width });
    }
  }, [activeKey]);

  const accent = ACCENT_MAP[activeKey] || "var(--foreground)";

  return (
    <div style={{ position: "relative", marginBottom: 36 }}>
      <div ref={boxRef} className="ac-tabs" style={{
        display: "flex", gap: 2, overflowX: "auto", paddingBottom: 8,
        borderBottom: "1px solid var(--border)",
      }}>
        {items.map((it) => {
          const active = it.key === activeKey;
          const itAccent = ACCENT_MAP[it.key] || "var(--foreground)";
          return (
            <button key={it.key}
              ref={(el) => { refs.current[it.key] = el; }}
              onClick={() => onSelect(it.key)}
              style={{
                background: active ? `color-mix(in srgb, ${itAccent} 8%, transparent)` : "transparent",
                border: "none", cursor: "pointer",
                padding: "8px 14px", borderRadius: 6,
                fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600,
                color: active ? itAccent : "var(--muted-foreground)",
                whiteSpace: "nowrap", transition: "all .2s ease",
                letterSpacing: ".03em",
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = "var(--foreground)"; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = "var(--muted-foreground)"; }}
            >
              {it.label}
              {active && (
                <span style={{
                  marginLeft: 6, fontSize: 9, padding: "1px 6px",
                  borderRadius: 4,
                  background: `color-mix(in srgb, ${itAccent} 12%, transparent)`,
                  color: itAccent, fontWeight: 700,
                }}>{it.count}</span>
              )}
            </button>
          );
        })}
      </div>
      <div className="ac-bar" style={{ ...bar, background: accent }} />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   ALGORITHM CARD
   ═══════════════════════════════════════════════════════════════════════ */

const AlgoCard = ({ algo, accent, index, basePath, col, row }) => {
  const nav = useNavigate();
  const ref = useRef(null);
  const { tiltStyle, onMouseMove, onMouseLeave } = useTilt(ref);
  const [hov, setHov] = useState(false);
  const dc = diffColor(algo.difficulty);

  return (
    <div ref={ref} className="ac-card"
      onClick={() => nav(`${basePath}/${algo.subpage}`)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); nav(`${basePath}/${algo.subpage}`); } }}
      onMouseMove={(e) => { onMouseMove(e); setHov(true); }}
      onMouseLeave={(e) => { onMouseLeave(e); setHov(false); }}
      tabIndex={0} role="button"
      style={{
        ...tiltStyle,
        gridColumn: `span ${col}`, gridRow: `span ${row}`,
        position: "relative", cursor: "pointer",
        borderRadius: "var(--radius)",
        border: `1px solid ${hov ? `color-mix(in srgb, ${accent} 35%, transparent)` : "var(--border)"}`,
        background: hov
          ? `linear-gradient(135deg, color-mix(in srgb, ${accent} 5%, transparent), var(--card))`
          : "var(--card)",
        overflow: "hidden",
        padding: col === 2 ? "24px 28px" : "20px 22px",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        minHeight: row === 2 ? 300 : col === 2 ? 180 : 200,
        animation: `ac-fadeUp .5s cubic-bezier(.22,1,.36,1) ${index * .05}s both`,
        transition: "border-color .25s ease, background .25s ease, box-shadow .25s ease",
        boxShadow: hov ? `0 0 0 1px color-mix(in srgb, ${accent} 10%, transparent), 0 8px 32px -8px rgba(0,0,0,.12)` : "none",
        willChange: "transform",
      }}
    >
      {/* Radial glow — subtle */}
      <div style={{
        position: "absolute", top: -30, right: -30,
        width: 160, height: 160, borderRadius: "50%",
        background: `radial-gradient(circle, color-mix(in srgb, ${accent} ${hov ? "12" : "0"}%, transparent), transparent 70%)`,
        transition: "background .35s ease", pointerEvents: "none",
      }} />

      {/* Top */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          {algo.number && (
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 500,
              color: "var(--muted-foreground)", letterSpacing: ".04em", opacity: .5,
            }}>#{algo.number}</span>
          )}
          {algo.difficulty && (
            <span style={{
              fontSize: 9, fontWeight: 700, padding: "2px 8px",
              borderRadius: 999, background: dc.bg,
              border: `1px solid ${dc.border}`, color: dc.text,
              fontFamily: "var(--font-mono)", letterSpacing: ".06em",
              textTransform: "uppercase",
            }}>{algo.difficulty}</span>
          )}
        </div>

        <h3 style={{
          fontFamily: "var(--font-heading)", fontWeight: 700,
          fontSize: col === 2 ? 22 : 18, lineHeight: 1.25,
          color: "var(--foreground)", margin: "0 0 8px",
        }}>{algo.label}</h3>

        <p style={{
          fontFamily: "var(--font-body)", fontSize: 11.5,
          lineHeight: 1.6, color: "var(--muted-foreground)",
          margin: "0 0 14px",
          display: "-webkit-box", WebkitLineClamp: row === 2 ? 4 : 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>{algo.description}</p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {(algo.tags || []).slice(0, col === 2 ? 5 : 3).map((t) => (
            <span key={t} style={{
              fontSize: 9, fontWeight: 600, padding: "2px 8px",
              borderRadius: 999, fontFamily: "var(--font-mono)",
              background: `color-mix(in srgb, ${accent} 8%, transparent)`,
              border: `1px solid color-mix(in srgb, ${accent} 16%, transparent)`,
              color: accent, letterSpacing: ".02em",
            }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginTop: 16, paddingTop: 12,
        borderTop: "1px solid var(--border)",
      }}>
        {algo.timeComplexity ? (
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10.5,
            color: "var(--muted-foreground)", fontWeight: 500,
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <Clock size={11} strokeWidth={2} /> {algo.timeComplexity}
          </span>
        ) : <span />}

        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 10,
          fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em",
          color: hov ? accent : "var(--muted-foreground)",
          transition: "color .2s ease",
          display: "flex", alignItems: "center", gap: 3,
        }}>
          Explore <ChevronRight className="ac-arrow" size={12} />
        </span>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   CATEGORY CARD
   ═══════════════════════════════════════════════════════════════════════ */

const CatCard = ({ category, index }) => {
  const nav = useNavigate();
  const ref = useRef(null);
  const { tiltStyle, onMouseMove, onMouseLeave } = useTilt(ref);
  const [hov, setHov] = useState(false);

  const config = getCategoryByKey(category.page);
  const routePath = config?.path || `/${category.page.toLowerCase()}`;
  const accent = ACCENT_MAP[category.page] || "var(--foreground)";
  const Icon = category.icon;
  const { col, row } = bento(index);

  const count = PROBLEM_CATALOG.filter((p) => p.category === category.page).length;

  return (
    <div ref={ref} className="ac-card"
      onClick={() => nav(routePath)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); nav(routePath); } }}
      onMouseMove={(e) => { onMouseMove(e); setHov(true); }}
      onMouseLeave={(e) => { onMouseLeave(e); setHov(false); }}
      tabIndex={0} role="button"
      style={{
        ...tiltStyle,
        gridColumn: `span ${col}`, gridRow: `span ${row}`,
        position: "relative", cursor: "pointer",
        borderRadius: "var(--radius)",
        border: `1px solid ${hov ? `color-mix(in srgb, ${accent} 35%, transparent)` : "var(--border)"}`,
        background: hov
          ? `linear-gradient(135deg, color-mix(in srgb, ${accent} 5%, transparent), var(--card))`
          : "var(--card)",
        overflow: "hidden",
        padding: col === 2 ? "26px 30px" : "22px 24px",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        minHeight: row === 2 ? 300 : col === 2 ? 170 : 210,
        animation: `ac-fadeUp .5s cubic-bezier(.22,1,.36,1) ${index * .04}s both`,
        transition: "border-color .25s ease, background .25s ease, box-shadow .25s ease",
        boxShadow: hov ? `0 0 0 1px color-mix(in srgb, ${accent} 10%, transparent), 0 8px 32px -8px rgba(0,0,0,.1)` : "none",
        willChange: "transform",
      }}
    >
      {/* Radial glow */}
      <div style={{
        position: "absolute", top: -30, right: -30,
        width: 180, height: 180, borderRadius: "50%",
        background: `radial-gradient(circle, color-mix(in srgb, ${accent} ${hov ? "10" : "0"}%, transparent), transparent 70%)`,
        transition: "background .35s ease", pointerEvents: "none",
      }} />

      {/* Top */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
            color: "var(--muted-foreground)", letterSpacing: ".08em",
            textTransform: "uppercase", opacity: .4,
          }}>{String(index + 1).padStart(2, "0")}</span>

          {Icon && (
            <span style={{
              width: 34, height: 34, borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: `color-mix(in srgb, ${accent} 10%, transparent)`,
              color: accent,
              transition: "all .25s ease",
              ...(hov ? { background: `color-mix(in srgb, ${accent} 18%, transparent)` } : {}),
            }}>
              <Icon size={17} strokeWidth={2} />
            </span>
          )}
        </div>

        <h3 style={{
          fontFamily: "var(--font-heading)", fontWeight: 700,
          fontSize: col === 2 ? 24 : 19, lineHeight: 1.2,
          color: "var(--foreground)", margin: "0 0 6px",
        }}>{category.name}</h3>

        <p style={{
          fontFamily: "var(--font-mono)", fontSize: 10,
          color: accent, fontWeight: 600, letterSpacing: ".05em",
          margin: "0 0 8px", textTransform: "uppercase", opacity: .7,
        }}>{category.subtitle}</p>

        <p style={{
          fontFamily: "var(--font-body)", fontSize: 11.5,
          lineHeight: 1.6, color: "var(--muted-foreground)",
          margin: 0,
          display: "-webkit-box", WebkitLineClamp: row === 2 ? 4 : 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>{category.description}</p>
      </div>

      {/* Bottom */}
      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginTop: 16, paddingTop: 12,
        borderTop: "1px solid var(--border)",
      }}>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 10,
          color: "var(--muted-foreground)", fontWeight: 500,
        }}>{count} problem{count !== 1 ? "s" : ""}</span>

        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 10,
          fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em",
          color: hov ? accent : "var(--muted-foreground)",
          transition: "color .2s ease",
          display: "flex", alignItems: "center", gap: 3,
        }}>
          Explore <ChevronRight className="ac-arrow" size={12} />
        </span>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

const AlgoCards = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => { injectStyles(); }, []);

  const [activeCategory, setActiveCategory] = useState(categories[0]?.page || "Sorting");
  const [fadeKey, setFadeKey] = useState(0);

  const tabItems = useMemo(() =>
    categories.map((c) => ({
      key: c.page, label: c.name,
      count: PROBLEM_CATALOG.filter((p) => p.category === c.page).length,
    })), []
  );

  const activeAlgos = useMemo(
    () => PROBLEM_CATALOG.filter((p) => p.category === activeCategory),
    [activeCategory]
  );

  const activeCfg = useMemo(() => getCategoryByKey(activeCategory), [activeCategory]);
  const accent = ACCENT_MAP[activeCategory] || "var(--foreground)";

  const handleTab = (key) => {
    setActiveCategory(key);
    setFadeKey((k) => k + 1);
  };

  /* ── Grid style (shared) ── */
  const gridCss = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 14,
  };

  return (
    <div style={{
      position: "relative", minHeight: "100vh", width: "100%",
      background: "var(--background)",
      color: "var(--foreground)",
      overflowX: "hidden",
    }}>
      <Grain />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 24px 72px" }}>

        {/* Back link */}
        <button
          onClick={() => navigate("/")}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "var(--secondary)", border: "1px solid var(--border)",
            borderRadius: "var(--radius)", padding: "7px 14px",
            fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600,
            color: "var(--foreground)", cursor: "pointer",
            marginBottom: 36, transition: "border-color .2s ease",
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--muted-foreground)"}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
        >
          <ArrowLeft size={13} /> Back to Home
        </button>

        {/* ─── Page header ─── */}
        <div style={{ marginBottom: 48 }}>
          <Eyebrow text="Algorithm Visualizer" accent={accent} />
          <h1 style={{
            fontFamily: "var(--font-heading)", fontWeight: 700,
            fontSize: "clamp(32px, 4.5vw, 54px)", lineHeight: 1.1,
            color: "var(--foreground)", margin: "0 0 10px",
            letterSpacing: "-.025em",
          }}>Explore Topics</h1>
          <p style={{
            fontFamily: "var(--font-body)", fontSize: 12.5,
            color: "var(--muted-foreground)", maxWidth: 460,
            lineHeight: 1.7, margin: 0,
          }}>
            Pick a category and dive into interactive algorithm visualizations.
          </p>
        </div>

        {/* ─── Category Grid ─── */}
        <section style={{ marginBottom: 56 }}>
          <div style={{
            display: "flex", alignItems: "baseline", justifyContent: "space-between",
            marginBottom: 20,
          }}>
            <h2 style={{
              fontFamily: "var(--font-heading)", fontWeight: 700,
              fontSize: 22, color: "var(--foreground)", margin: 0,
              letterSpacing: "-.015em",
            }}>Categories</h2>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 10,
              color: "var(--muted-foreground)", fontWeight: 500,
            }}>{categories.length} topics</span>
          </div>
          <div style={gridCss}>
            {categories.map((cat, i) => (
              <CatCard key={cat.page} category={cat} index={i} />
            ))}
          </div>
        </section>

        {/* ─── Divider ─── */}
        <div style={{
          height: 1,
          background: "linear-gradient(90deg, transparent, var(--border), transparent)",
          margin: "0 0 48px",
        }} />

        {/* ─── Algorithms section ─── */}
        <section>
          <div style={{ marginBottom: 24 }}>
            <Eyebrow text={activeCfg?.eyebrow || activeCategory} accent={accent} />
            <h2 style={{
              fontFamily: "var(--font-heading)", fontWeight: 700,
              fontSize: "clamp(24px, 3vw, 36px)", lineHeight: 1.15,
              color: "var(--foreground)", margin: "0 0 8px",
              letterSpacing: "-.015em",
            }}>Algorithms</h2>
            <p style={{
              fontFamily: "var(--font-body)", fontSize: 11.5,
              color: "var(--muted-foreground)", maxWidth: 400, margin: 0,
            }}>Switch categories to browse their algorithms.</p>
          </div>

          <Tabs items={tabItems} activeKey={activeCategory} onSelect={handleTab} />

          <div key={fadeKey} style={{
            ...gridCss,
            animation: "ac-fadeUp .4s cubic-bezier(.22,1,.36,1) both",
          }}>
            {activeAlgos.length === 0 ? (
              <div style={{
                gridColumn: "1 / -1", textAlign: "center", padding: "52px 0",
                color: "var(--muted-foreground)",
                fontFamily: "var(--font-body)", fontSize: 12.5,
              }}>
                No algorithms cataloged yet for this category.
              </div>
            ) : (
              activeAlgos.map((algo, i) => {
                const { col, row } = bento(i);
                return (
                  <AlgoCard key={algo.subpage} algo={algo} accent={accent} index={i}
                    basePath={activeCfg?.path || `/${activeCategory.toLowerCase()}`}
                    col={col} row={row} />
                );
              })
            )}
          </div>
        </section>

        {/* Footer note */}
        <p style={{
          fontFamily: "var(--font-body)", fontSize: 11,
          color: "var(--muted-foreground)", textAlign: "center",
          marginTop: 48, opacity: .6,
        }}>
          Click any card to explore its interactive visualization.
        </p>
      </div>
    </div>
  );
};

export default AlgoCards;
