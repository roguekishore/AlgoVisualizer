import { cn } from "../../lib/utils"

const texturePatterns = {
  dots: "bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.4)_1px,transparent_0)] bg-[length:8px_8px]",
  grid: "bg-[linear-gradient(rgba(0,0,0,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.3)_1px,transparent_1px)] bg-[length:12px_12px]",
  noise:
    "bg-[radial-gradient(circle_at_2px_2px,rgba(0,0,0,0.25)_1px,transparent_0)] bg-[length:6px_6px]",
  crosshatch:
    "bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(0,0,0,0.3)_2px,rgba(0,0,0,0.3)_4px),repeating-linear-gradient(-45deg,transparent,transparent_2px,rgba(0,0,0,0.3)_2px,rgba(0,0,0,0.3)_4px)]",
  diagonal:
    "bg-[repeating-linear-gradient(-45deg,rgba(0,0,0,0.2),rgba(0,0,0,0.2)_1px,transparent_1px,transparent_6px)]",
  scatteredDots:
    "bg-[radial-gradient(circle_at_3px_7px,rgba(0,0,0,0.3)_1px,transparent_0),radial-gradient(circle_at_11px_2px,rgba(0,0,0,0.3)_1px,transparent_0),radial-gradient(circle_at_7px_12px,rgba(0,0,0,0.3)_1px,transparent_0)] bg-[length:16px_16px]",
  halftone:
    "bg-[radial-gradient(circle,rgba(0,0,0,0.4)_25%,transparent_25%)] bg-[length:10px_10px] bg-[position:0_0,5px_5px]",
  triangular:
    "bg-[conic-gradient(from_0deg_at_50%_50%,rgba(0,0,0,0.3)_0deg_120deg,transparent_120deg_240deg,rgba(0,0,0,0.3)_240deg_360deg)] bg-[length:8px_8px] bg-[position:0_0,4px_4px]",
  chevron:
    "bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.2)_0px,rgba(0,0,0,0.2)_2px,transparent_2px,transparent_8px),repeating-linear-gradient(-45deg,rgba(0,0,0,0.2)_0px,rgba(0,0,0,0.2)_2px,transparent_2px,transparent_8px)]",
  paperGrain:
    "bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.1)_0px,transparent_1px,transparent_3px),repeating-linear-gradient(90deg,rgba(0,0,0,0.1)_0px,transparent_1px,transparent_4px),repeating-linear-gradient(45deg,rgba(0,0,0,0.05)_0px,transparent_1px,transparent_5px)]",
  horizontalLines:
    "bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.25)_0px,rgba(0,0,0,0.25)_1px,transparent_1px,transparent_4px)]",
  verticalLines:
    "bg-[repeating-linear-gradient(90deg,rgba(0,0,0,0.25)_0px,rgba(0,0,0,0.25)_1px,transparent_1px,transparent_4px)]",
  none: "",
}

const defaultOpacities = {
  dots: 1,
  grid: 1,
  noise: 1,
  crosshatch: 1,
  diagonal: 1,

  scatteredDots: 1,
  halftone: 1,
  triangular: 1,
  chevron: 1,
  paperGrain: 1,
  horizontalLines: 1,
  verticalLines: 1,
  none: 0,
}

export function TextureOverlay({ texture, opacity, className }) {
  if (texture === "none") return null

  const finalOpacity = opacity ?? defaultOpacities[texture]
  const pattern = texturePatterns[texture]

  // Inline fallback styles for environments where Tailwind's arbitrary
  // background utilities may not be applied. Keep these subtle so they
  // layer nicely on top of card backgrounds.
  let inlineBackground = undefined
  if (texture === "grid") {
    // Use faint light lines on dark backgrounds (more visible than darker lines)
    inlineBackground = {
      backgroundImage:
        "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px, transparent 1px)",
      backgroundSize: "12px 12px",
    }
  }

  return (
    <div
      className={cn("absolute inset-0 pointer-events-none", pattern, className)}
      style={{ opacity: finalOpacity, ...(inlineBackground || {}) }}
    />
  )
}
