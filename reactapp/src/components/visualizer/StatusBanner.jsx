import React from "react";
import { cn } from "../../lib/utils";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";

/**
 * StatusBanner — success/error/warning/loading/info banner.
 *
 * Subtle background tint, no shadow, border accent via border-l.
 */

const VARIANTS = {
  success: {
    icon: CheckCircle,
    className: "border-l-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400",
  },
  error: {
    icon: XCircle,
    className: "border-l-red-500 bg-red-500/5 text-red-600 dark:text-red-400",
  },
  warning: {
    icon: AlertCircle,
    className: "border-l-amber-500 bg-amber-500/5 text-amber-600 dark:text-amber-400",
  },
  loading: {
    icon: Loader2,
    className: "border-l-blue-500 bg-blue-500/5 text-blue-600 dark:text-blue-400",
  },
  info: {
    icon: AlertCircle,
    className: "border-l-primary bg-primary/5 text-primary",
  },
};

const StatusBanner = ({
  variant = "info",
  message,
  children,
  dismissible = false,
  onDismiss,
}) => {
  const v = VARIANTS[variant] ?? VARIANTS.info;
  const Icon = v.icon;

  if (!message) return null;

  return (
    <div
      className={cn(
        "flex items-start gap-2.5 px-4 py-3 rounded-lg border border-l-[3px]",
        v.className
      )}
    >
      <Icon
        className={cn("h-4 w-4 mt-0.5 shrink-0", variant === "loading" && "animate-spin")}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{message}</p>
        {children && (
          <div className="mt-1 text-xs opacity-80">{children}</div>
        )}
      </div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <XCircle className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default StatusBanner;
