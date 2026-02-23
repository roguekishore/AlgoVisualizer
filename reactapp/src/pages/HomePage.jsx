import React from "react";
import "./HomePage.css";

// Zentry-style components
import ZentryHero from "../components/zentry/ZentryHero";
import About from "../components/zentry/About";
import Features from "../components/zentry/Features";
import Footer from "../components/zentry/Footer";

const HomePage = () => {
  return (
    <main className="relative min-h-screen w-screen overflow-x-hidden bg-[#0a0a0a] dark:bg-blue-50">

      {/* Zentry Hero Section */}
      <ZentryHero />

      {/* About Section */}
      <About />

      {/* Features Section (Bento Grid) */}
      <Features />

      {/* Footer */}
      <Footer />
    </main>
  );
};

export default HomePage;
