import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import HomePage from "./pages/HomePage";
import AppRoutes from "./routes";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Home page */}
          <Route path="/" element={<HomePage />} />
          
          {/* All category and algorithm routes */}
          <Route path="/*" element={<AppRoutes />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
