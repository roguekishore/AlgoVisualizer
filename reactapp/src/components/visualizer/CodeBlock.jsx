import React from "react";
import { cn } from "../../lib/utils";
import { Code } from "lucide-react";
import { Separator } from "../ui/separator";

/**
 * CodeBlock — pseudocode panel with active-line highlighting.
 *
 * Supports Format A (token-based) and Format B (plain string).
 * Clean card border, no shadow, mono font, subtle line highlight.
 */

const TOKEN_COLOR_MAP = {
  purple:       "text-purple-400",
  cyan:         "text-sky-400",
  yellow:       "text-amber-300",
  orange:       "text-orange-400",
  "light-gray": "text-muted-foreground/60",
  "":           "text-foreground/70",
};

const CodeBlock = ({
  title = "Pseudocode",
  lines = [],
  activeLine,
  maxHeight = "24rem",
  children,
}) => {
  const renderLine = (line) => {
    // Format A: token-based { l, c: [{ t, c }] }
    if (line.c && Array.isArray(line.c)) {
      const lineNum = line.l;
      const isActive = activeLine === lineNum;
      return (
        <div
          key={lineNum}
          className={cn(
            "flex items-start rounded-sm px-2 py-px transition-colors",
            isActive
              ? "bg-primary/8 border-l-2 border-primary"
              : "border-l-2 border-transparent"
          )}
        >
          <span className="text-muted-foreground/50 w-6 text-right pr-3 select-none shrink-0 font-mono text-[11px] leading-6">
            {lineNum}
          </span>
          <code className="text-[13px] leading-6 font-mono">
            {line.c.map((token, idx) => (
              <span key={idx} className={TOKEN_COLOR_MAP[token.c] ?? "text-foreground/70"}>
                {token.t}
              </span>
            ))}
          </code>
        </div>
      );
    }

    // Format B: plain string { line, content }
    const lineNum = line.line ?? line.l;
    const content = line.content ?? line.t ?? "";
    const isActive = activeLine === lineNum;
    return (
      <div
        key={lineNum}
        className={cn(
          "flex items-start rounded-sm px-2 py-px transition-colors",
          isActive
            ? "bg-primary/8 border-l-2 border-primary"
            : "border-l-2 border-transparent"
        )}
      >
        <span className="text-muted-foreground/50 w-6 text-right pr-3 select-none shrink-0 font-mono text-[11px] leading-6">
          {lineNum}
        </span>
        <code
          className={cn(
            "text-[13px] leading-6 font-mono",
            isActive ? "text-foreground" : "text-foreground/60"
          )}
        >
          {content}
        </code>
      </div>
    );
  };

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center gap-2 px-4 py-2.5">
        <Code className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[13px] font-medium text-foreground">{title}</span>
      </div>
      <Separator />
      <div className="p-2 overflow-auto" style={{ maxHeight }}>
        <div className="text-xs font-mono">
          {children
            ? children
            : lines.map((line) => renderLine(line))}
        </div>
      </div>
    </div>
  );
};

export default CodeBlock;
