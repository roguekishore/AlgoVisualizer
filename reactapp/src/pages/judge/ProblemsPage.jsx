import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { fetchProblems } from "../../services/judgeApi";
import { ThemeToggle } from "../../components/theme-toggle";
import { ArrowLeft, Code2, CheckCircle2, Clock, Tag } from "lucide-react";
import "./Judge.css";

const difficultyColor = {
  Easy: "#22c55e",
  Medium: "#eab308",
  Hard: "#ef4444",
};

export default function ProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProblems()
      .then(setProblems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="judge-shell">
      {/* Header */}
      <header className="judge-header">
        <div className="judge-header-left">
          <Link to="/" className="judge-back-btn">
            <ArrowLeft size={18} />
          </Link>
          <Code2 size={22} style={{ color: "var(--color-accent-primary)" }} />
          <h1 className="judge-title">Online Judge</h1>
        </div>
        <ThemeToggle />
      </header>

      {/* Content */}
      <main className="judge-problems-main">
        <div className="judge-problems-intro">
          <h2>Problem Set</h2>
          <p>Select a problem to solve. Write your solution in C++ or Java, then submit to run it against test cases.</p>
        </div>

        {loading && (
          <div className="judge-loading">
            <div className="judge-spinner" />
            <span>Loading problems...</span>
          </div>
        )}

        {error && (
          <div className="judge-error">
            <p>⚠️ Could not connect to judge server.</p>
            <p className="judge-error-detail">{error}</p>
            <p className="judge-error-hint">Make sure the judge backend is running on <code>13.202.136.154:9000</code></p>
          </div>
        )}

        {!loading && !error && (
          <div className="judge-problems-table-wrapper">
            <table className="judge-problems-table">
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>#</th>
                  <th>Title</th>
                  <th style={{ width: "110px" }}>Difficulty</th>
                  <th style={{ width: "130px" }}>Category</th>
                  <th>Tags</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((problem, idx) => (
                  <tr
                    key={problem.id}
                    className="judge-problem-row"
                    onClick={() => navigate(`/judge/${problem.id}`)}
                  >
                    <td className="judge-problem-num">{idx + 1}</td>
                    <td className="judge-problem-title">{problem.title}</td>
                    <td>
                      <span
                        className="judge-difficulty-badge"
                        style={{ color: difficultyColor[problem.difficulty] }}
                      >
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="judge-problem-category">{problem.category}</td>
                    <td className="judge-problem-tags">
                      {problem.tags?.map((tag) => (
                        <span key={tag} className="judge-tag">{tag}</span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
