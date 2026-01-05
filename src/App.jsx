import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AlertContextProvider } from "./context/AlertContext";
import { ChatbotProvider } from "./context/ChatbotContext";
import AlertBox from "./components/AlertBox";
import ChatbotWidget from "./components/ChatbotWidget";
import HomePage from "./pages/HomePageNew";
import AppRoutes from "./routes";

export default function App() {
  return (
    <ThemeProvider>
      <AlertContextProvider>
          <BrowserRouter>
            <AlertBox />
            <Routes>
              {/* Home page */}
              <Route path="/" element={<HomePage />} />
              
              {/* All category and algorithm routes */}
              <Route path="/*" element={<AppRoutes />} />
            </Routes>
          </BrowserRouter>
      </AlertContextProvider>
    </ThemeProvider>
  );
}
