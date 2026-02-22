import React from "react";
import { cn } from "../../lib/utils";
import { Badge } from "../ui/badge";

/**
 * VisualizerShell — outermost page layout wrapper.
 *
 * Clean Inter font, tight tracking, shadcn Badge for LeetCode tag.
 * No shadows anywhere — just clean spacing and typography.
 */
const VisualizerShell = ({ title, subtitle, icon, leetcode, children, className }) => {
  return (
    <div className={cn("px-4 md:px-6 py-6 max-w-7xl mx-auto", className)} tabIndex={0}>
      <header className="mb-6">
        <div className="flex items-center justify-center gap-2">
          {icon && <span className="text-muted-foreground [&>svg]:h-5 [&>svg]:w-5">{icon}</span>}
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {leetcode && (
            <Badge variant="outline" className="text-[10px] font-mono h-5 px-1.5">
              {leetcode}
            </Badge>
          )}
        </div>
        {subtitle && (
          <p className="text-center text-[13px] text-muted-foreground mt-1">{subtitle}</p>
        )}
      </header>
      {children}
    </div>
  );
};

export default VisualizerShell;
