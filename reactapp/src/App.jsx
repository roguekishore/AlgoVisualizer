import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import HomePage from "./pages/HomePage";
import AppRoutes from "./routes";
import WorldMap from "./map/WorldMap";

const ProblemsPage = lazy(() => import("./pages/judge/ProblemsPage"));
const JudgePage = lazy(() => import("./pages/judge/JudgePage"));

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="algovisualizer-theme">
      <BrowserRouter>
        <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>Loading...</div>}>
          <Routes>
            {/* Home page */}
            <Route path="/" element={<HomePage />} />
            
            {/* DSA Skill Tree Map */}
            <Route path="/map" element={<WorldMap />} />

            {/* Online Judge */}
            <Route path="/judge" element={<ProblemsPage />} />
            <Route path="/judge/:problemId" element={<JudgePage />} />
            
            {/* All category and algorithm routes */}
            <Route path="/*" element={<AppRoutes />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}
