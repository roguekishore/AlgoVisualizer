import React from "react";
import { cn } from "../../lib/utils";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

/**
 * InputBar — labeled input field with optional action button.
 *
 * Uses shadcn Input and Button for consistent styling.
 */
const InputBar = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  options = [],
  min,
  max,
  action,
  disabled = false,
  className = "",
}) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground whitespace-nowrap">
          {label}
        </label>
      )}

      {type === "select" ? (
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <Input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min={min}
          max={max}
          disabled={disabled}
          className="max-w-[200px]"
        />
      )}

      {action && (
        <Button
          size="sm"
          onClick={action.onClick}
          disabled={disabled}
        >
          {action.icon}
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default InputBar;
