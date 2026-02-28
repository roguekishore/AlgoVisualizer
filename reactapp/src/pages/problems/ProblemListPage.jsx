/**
 * ProblemListPage � /problems
 * Spring Boot-backed problem listing with full pagination, sorting,
 * filtering, status tracking and detail dialog.
 */

import React from "react";
import { BookOpen } from "lucide-react";
import { fetchProblems, fetchProblemById, fetchStages } from "../../services/problemApi";
import ProblemsTable from "../../components/ProblemsTable";

export default function ProblemListPage() {
  return (
    <ProblemsTable
      source="spring"
      fetchList={fetchProblems}
      fetchDetail={fetchProblemById}
      fetchStages={fetchStages}
      title="Problems"
      subtitle="Practice & master DSA"
      icon={BookOpen}
      showLeetCode
      showStage
    />
  );
}
