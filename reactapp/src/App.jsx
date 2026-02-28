import React, { lazy, Suspense, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import ZentryNavbar from "./components/zentry/ZentryNavbar";
import HomePage from "./pages/HomePage";
import AppRoutes from "./routes";
import WorldMap from "./map/WorldMap";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";

const ProblemsPage = lazy(() => import("./pages/judge/ProblemsPage"));
const JudgePage = lazy(() => import("./pages/judge/JudgePage"));
const ProblemListPage = lazy(() => import("./pages/problems/ProblemListPage"));

const NAVBAR_HIDDEN_PATHS = [
  '/map',
  '/login',
  '/signup',
];

const TRANSPARENT_NAVBAR_PATHS = [
  '/',
];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function AppContent() {
  const location = useLocation();
  
  const [scrollDirection, setScrollDirection] = useState(1);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Scroll listener
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      
      setScrollDirection(currentScrollY > lastScrollY ? 1 : -1);
      setScrollProgress(maxScroll > 0 ? currentScrollY / maxScroll : 0);
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if navbar should be shown for current path
  const showNavbar = !NAVBAR_HIDDEN_PATHS.some(path => 
    location.pathname === path || location.pathname.startsWith(path + '/')
  ) && !location.pathname.startsWith('/judge/');

  // Check if navbar should allow transparency at top
  const allowTransparency = TRANSPARENT_NAVBAR_PATHS.some(path => 
    location.pathname === path
  );

  const showScrollTop = scrollProgress > 0.1;

  return (
    <div>
      <ScrollToTop />
      {showNavbar && (
        <ZentryNavbar
          allowTransparency={allowTransparency}
          controls={{
            scrollDirection,
            scrollProgress,
          }}
        />
      )}

      <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>Loading...</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/map" element={<WorldMap />} />
          <Route path="/problems" element={<ProblemListPage />} />
          <Route path="/judge" element={<ProblemsPage />} />
          <Route path="/judge/:problemId" element={<JudgePage />} />
          <Route path="/*" element={<AppRoutes />} />
        </Routes>
      </Suspense>

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
        style={{
          position: "fixed",
          bottom: "1.75rem",
          right: "1.75rem",
          zIndex: 9999,
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(15,15,20,0.75)",
          backdropFilter: "blur(10px)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
          opacity: showScrollTop ? 1 : 0,
          transform: showScrollTop ? "translateY(0) scale(1)" : "translateY(12px) scale(0.85)",
          transition: "opacity 0.25s ease, transform 0.25s ease",
          pointerEvents: showScrollTop ? "auto" : "none",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 12V4M4 8l4-4 4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vantage-theme">
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}
