import React, { useState, useEffect } from "react";

/**
 * SlidingWindowOverlay — animated bounding box around a sub-range.
 *
 * Measures DOM positions and renders a translucent highlight rectangle.
 * Uses CSS-variable-based colors for consistency with shadcn theme.
 */

const PALETTE = {
  blue:   { bg: "hsl(var(--primary) / 0.08)",  border: "hsl(var(--primary) / 0.4)"  },
  red:    { bg: "hsl(0 84% 60% / 0.08)",       border: "hsl(0 84% 60% / 0.4)"      },
  green:  { bg: "hsl(142 71% 45% / 0.08)",     border: "hsl(142 71% 45% / 0.4)"    },
  purple: { bg: "hsl(270 95% 75% / 0.08)",     border: "hsl(270 95% 75% / 0.4)"    },
};

const SlidingWindowOverlay = ({
  containerId,
  startIndex,
  endIndex,
  color = "blue",
  elementPrefix,
}) => {
  const [style, setStyle] = useState({ opacity: 0 });

  useEffect(() => {
    if (startIndex == null || endIndex == null) {
      setStyle({ opacity: 0 });
      return;
    }

    const prefix = elementPrefix ?? `${containerId}-element-`;
    const container = document.getElementById(containerId);
    const startEl = document.getElementById(`${prefix}${startIndex}`);
    const endEl = document.getElementById(`${prefix}${endIndex}`);

    if (container && startEl && endEl) {
      const containerRect = container.getBoundingClientRect();
      const startRect = startEl.getBoundingClientRect();
      const endRect = endEl.getBoundingClientRect();
      const p = PALETTE[color] ?? PALETTE.blue;

      setStyle({
        position: "absolute",
        top: "-6px",
        bottom: "-6px",
        left: `${startRect.left - containerRect.left - 6}px`,
        width: `${endRect.right - startRect.left + 12}px`,
        backgroundColor: p.bg,
        border: `1.5px solid ${p.border}`,
        borderRadius: "8px",
        transition: "all 250ms ease-out",
        opacity: 1,
        pointerEvents: "none",
      });
    } else {
      setStyle({ opacity: 0 });
    }
  }, [containerId, startIndex, endIndex, color, elementPrefix]);

  return <div style={style} />;
};

export default SlidingWindowOverlay;
