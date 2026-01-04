import React from "react";
import { Github, Mail, Heart, Code2 } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-theme-primary text-theme-tertiary border-t border-theme-secondary backdrop-blur-md">
      {/* Subtle Glow Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-0 bottom-0 w-72 h-72 bg-accent-primary-hover/10 blur-3xl" />
        <div className="absolute right-0 top-0 w-72 h-72 bg-pinkhover/10 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
          <div className="flex items-center gap-2 text-theme-primary font-semibold text-lg">
            <Code2 className="w-5 h-5 text-accent-primary" />
            AlgoVisualizer
          </div>
          <p className="text-sm text-theme-tertiary">
            Interactive algorithm visualization platform for learners and
            developers.
          </p>
          <div className="flex gap-3 pt-2">
            <a
              href="https://github.com/mahaveergurjar/AlgoVisualizer"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-theme-tertiary hover:bg-theme-elevated hover:scale-110 transition-all"
            >
              <Github className="w-4 h-4 text-theme-secondary" />
            </a>
            <a
              href="mailto:contact@algovisualizer.com"
              className="p-2 rounded-lg bg-theme-tertiary hover:bg-theme-elevated hover:scale-110 transition-all"
            >
              <Mail className="w-4 h-4 text-theme-secondary" />
            </a>
          </div>
        </div>

        {/* Links + Copyright */}
        <div className="flex flex-col items-center md:items-end text-sm gap-3 text-theme-muted">
          <div className="flex gap-6">
            <a
              href="https://github.com/mahaveergurjar/AlgoVisualizer"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent-primary transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://github.com/mahaveergurjar/AlgoVisualizer/blob/main/LICENSE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent-primary transition-colors"
            >
              MIT License
            </a>
            <a
              href="#privacy"
              className="hover:text-accent-primary transition-colors"
            >
              Privacy
            </a>
          </div>

          <div className="flex items-center gap-2 text-theme-muted">
            <span>© {currentYear} AlgoVisualizer</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              Made with
              <Heart className="w-4 h-4 text-danger animate-pulse" />
              by{" "}
              <a
                href="https://github.com/mahaveergurjar"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-primary hover:text-accent-primary transition-colors"
              >
                Mahaveer Gurjar
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
