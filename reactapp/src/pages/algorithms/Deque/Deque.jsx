import React, { useState } from "react";
import { ArrowLeft, Plus, Minus, RotateCcw, Database } from "lucide-react";

const Deque = ({ navigate }) => {
  const [deque, setDeque] = useState([]);
  const [value, setValue] = useState("");
  const [maxVisible, setMaxVisible] = useState(12);

  const pushFront = () => {
    if (value.trim() === "") return;
    setDeque((prev) => [value.trim(), ...prev]);
    setValue("");
  };

  const pushBack = () => {
    if (value.trim() === "") return;
    setDeque((prev) => [...prev, value.trim()]);
    setValue("");
  };

  const popFront = () => setDeque((prev) => (prev.length ? prev.slice(1) : prev));
  const popBack = () => setDeque((prev) => (prev.length ? prev.slice(0, -1) : prev));
  const reset = () => {
    setDeque([]);
    setValue("");
  };
  const loadExample = () => setDeque(["10", "20", "30", "40"]);

  return (
    <div className="bg-theme-primary text-theme-primary min-h-screen relative overflow-hidden">
      {/* Glowing Animated Backgrounds */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purplelight rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pinklight rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-primary/10 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      {/* Header */}
      <div className="relative z-10 px-6 py-10 max-w-7xl mx-auto text-center">
        <button
          onClick={() => (navigate ? navigate("home") : window.history.back())}
          className="flex items-center gap-2 text-theme-secondary hover:text-theme-primary transition-colors mb-6 group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-5 mb-6">
          <div className="relative">
            <Database className="h-14 sm:h-16 w-14 sm:w-16 text-pink animated-icon" />
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple400 via-pink-400 to-fuchsia-400 animated-gradient">
            Deque (Double-Ended Queue)
          </h1>
        </div>

        <p className="text-lg sm:text-xl text-theme-secondary mt-4 max-w-3xl mx-auto leading-relaxed px-4">
          A <span className="text-pink font-semibold">Deque</span> allows insertion and deletion 
          from both ends. Try different operations and watch it update in real-time!
        </p>
      </div>

      {/* Controls and Visualization */}
      <div className="relative z-10 px-6 pb-16 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
        {/* Left Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm rounded-2xl p-6 border border-pink/30 shadow-xl transition-all duration-500 hover:shadow-pink-500/30">
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter value"
                className="px-4 py-2 rounded-lg bg-theme-tertiary border border-theme-primary focus:outline-none w-44 text-theme-secondary"
              />

              <button
                onClick={pushFront}
                className="px-4 py-2 bg-success-hover hover:bg-success-hover rounded-xl font-medium flex items-center gap-2 transition-transform hover:scale-105"
              >
                <Plus className="h-4 w-4" /> Push Front
              </button>

              <button
                onClick={pushBack}
                className="px-4 py-2 bg-accent-primary-hover hover:bg-accent-primary-hover rounded-xl font-medium flex items-center gap-2 transition-transform hover:scale-105"
              >
                <Plus className="h-4 w-4" /> Push Back
              </button>

              <button
                onClick={popFront}
                className="px-4 py-2 bg-danger-hover hover:bg-danger-hover rounded-xl font-medium flex items-center gap-2 transition-transform hover:scale-105"
              >
                <Minus className="h-4 w-4" /> Pop Front
              </button>

              <button
                onClick={popBack}
                className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 rounded-xl font-medium flex items-center gap-2 transition-transform hover:scale-105"
              >
                <Minus className="h-4 w-4" /> Pop Back
              </button>

              <button
                onClick={reset}
                className="px-4 py-2 bg-theme-elevated hover:bg-theme-elevated rounded-xl font-medium flex items-center gap-2 transition-transform hover:scale-105"
              >
                <RotateCcw className="h-4 w-4" /> Reset
              </button>

              <button
                onClick={loadExample}
                className="px-4 py-2 bg-purplehover hover:bg-purple700 rounded-xl font-medium transition-transform hover:scale-105"
              >
                Load Example
              </button>
            </div>

            {/* Visualization */}
            <div className="flex items-center justify-center my-8">
              <div className="text-sm text-theme-tertiary mr-4">Front</div>
              <div className="flex gap-3 flex-wrap justify-center transition-all duration-500">
                {deque.map((item, idx) => (
                  <div
                    key={idx}
                    className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-purple500 to-pink500 rounded-xl shadow-lg transform transition hover:scale-110 hover:shadow-pink-500/40 animate-fade-in-up"
                    title={`Index ${idx}`}
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <span className="font-bold text-theme-primary truncate px-2">{item}</span>
                  </div>
                ))}
              </div>
              <div className="text-sm text-theme-tertiary ml-4">Rear</div>
            </div>

            <div className="text-center text-theme-tertiary">
              Current size:{" "}
              <span className="text-theme-primary font-semibold">{deque.length}</span>
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm rounded-2xl p-6 border border-theme-primary">
            <h3 className="text-xl font-bold mb-3 text-pink">How it Works</h3>
            <p className="text-theme-secondary mb-4">
              A deque is represented as a dynamic array. You can add or remove elements 
              from both ends efficiently, simulating queue and stack operations.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-theme-secondary">
              <div>
                <h4 className="font-semibold text-purple mb-1">Operations</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>pushFront(x): O(n)</li>
                  <li>pushBack(x): O(1)</li>
                  <li>popFront(): O(1)</li>
                  <li>popBack(): O(1)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-purple mb-1">Use Cases</h4>
                <p>Sliding window, undo/redo, scheduling tasks, and more.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm rounded-2xl p-6 border border-theme-primary animate-fade-in-up">
            <h3 className="text-xl font-bold text-pink mb-3">Quick Tips</h3>
            <ol className="list-decimal list-inside text-theme-secondary space-y-2">
              <li>Try combining front and back pushes.</li>
              <li>Use reset before loading examples.</li>
            </ol>
          </div>

          <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm rounded-2xl p-6 border border-theme-primary animate-fade-in-up">
            <h3 className="text-xl font-bold text-pink mb-3">Complexity</h3>
            <div className="text-theme-secondary space-y-1">
              <p><strong>Time:</strong> O(1) – O(n)</p>
              <p><strong>Space:</strong> O(n)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        .animated-gradient {
          background-size: 200% auto;
          animation: gradient-animation 4s ease-in-out infinite;
        }
        @keyframes gradient-animation {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animated-icon {
          animation: float-rotate 8s ease-in-out infinite;
          filter: drop-shadow(0 0 20px rgba(236, 72, 153, 0.6));
        }
        @keyframes float-rotate {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-8px) rotate(120deg); }
          66% { transform: translateY(-4px) rotate(240deg); }
        }
        .animate-float, .animate-float-delayed {
          animation: float 20s ease-in-out infinite;
          animation-delay: var(--animation-delay, 0s);
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};

export default Deque;
