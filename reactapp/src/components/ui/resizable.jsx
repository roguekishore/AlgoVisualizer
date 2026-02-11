import * as React from "react"
import { GripVertical, GripHorizontal } from "lucide-react"
import {
  Group as PanelGroup,
  Panel,
  Separator as PanelResizeHandle,
} from "react-resizable-panels"
import { cn } from "../../lib/utils"

/**
 * Wraps PanelGroup. Pass `orientation="horizontal"` (default) or `"vertical"`.
 */
const ResizablePanelGroup = ({ className, orientation = "horizontal", ...props }) => (
  <PanelGroup
    orientation={orientation}
    className={cn("flex h-full w-full", className)}
    {...props}
  />
)

const ResizablePanel = Panel

/**
 * Resize handle. Set `orientation` to match the *parent Group* orientation.
 * - horizontal group → vertical handle bar (the default)
 * - vertical group   → horizontal handle bar
 */
const ResizableHandle = ({ withHandle, className, orientation = "horizontal", ...props }) => {
  const isVertical = orientation === "vertical"

  return (
    <PanelResizeHandle
      className={cn(
        "judge-resize-handle relative flex items-center justify-center bg-border transition-colors duration-150 hover:bg-[var(--color-accent-primary)]",
        isVertical
          ? "h-[3px] w-full cursor-row-resize"
          : "w-[3px] h-full cursor-col-resize",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className={cn(
          "z-10 flex items-center justify-center rounded-sm border bg-border",
          isVertical ? "h-3 w-6" : "h-6 w-3"
        )}>
          {isVertical
            ? <GripHorizontal className="h-2.5 w-2.5 text-muted-foreground" />
            : <GripVertical className="h-2.5 w-2.5 text-muted-foreground" />
          }
        </div>
      )}
    </PanelResizeHandle>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
