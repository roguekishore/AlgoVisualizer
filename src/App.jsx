import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AppRoutes from "./routes";
import WorldMap from "./map/WorldMap";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home page */}
        <Route path="/" element={<HomePage />} />
        
        {/* DSA Skill Tree Map */}
        <Route path="/map" element={<WorldMap />} />
        
        {/* All category and algorithm routes */}
        <Route path="/*" element={<AppRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}
