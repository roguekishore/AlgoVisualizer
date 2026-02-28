/**
 * ProblemsPage - /judge
 * Online Judge problem listing powered by the Node.js judge backend.
 * Uses the shared ProblemsTable for a consistent LeetCode-style layout.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { Code2 } from "lucide-react";
import { fetchProblems } from "../../services/judgeApi";
import ProblemsTable from "../../components/ProblemsTable";
import "./Judge.css";

export default function ProblemsPage() {
  const navigate = useNavigate();

  return (
    <ProblemsTable
      source="judge"
      fetchList={fetchProblems}
      title="Online Judge"
      subtitle="Write, run & submit solutions"
      icon={Code2}
      showLeetCode={false}
      showStage={false}
      onRowClick={(id) => navigate(`/judge/${id}`)}
    />
  );
}
