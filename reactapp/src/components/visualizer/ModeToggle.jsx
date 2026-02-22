import React from "react";
import { cn } from "../../lib/utils";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

/**
 * ModeToggle — Brute Force / Optimal tab switcher.
 *
 * Uses shadcn Tabs primitive for a professional pill toggle.
 */
const ModeToggle = ({
  mode,
  onModeChange,
  bruteLabel = "Brute Force",
  optimalLabel = "Optimal",
}) => {
  return (
    <Tabs value={mode} onValueChange={onModeChange}>
      <TabsList>
        <TabsTrigger value="brute">{bruteLabel}</TabsTrigger>
        <TabsTrigger value="optimal">{optimalLabel}</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default ModeToggle;
