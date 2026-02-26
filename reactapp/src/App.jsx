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
  '/judge',
];

const TRANSPARENT_NAVBAR_PATHS = [
  '/',
];

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
  );

  // Check if navbar should allow transparency at top
  const allowTransparency = TRANSPARENT_NAVBAR_PATHS.some(path => 
    location.pathname === path
  );

  return (
    <div>
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
