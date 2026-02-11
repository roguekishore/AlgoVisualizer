import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"

const Select = React.forwardRef(({ className, value, onValueChange, children, ...props }, ref) => {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef(null)

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className={cn("relative", className)} {...props}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child
        return React.cloneElement(child, {
          _value: value,
          _onValueChange: onValueChange,
          _open: open,
          _setOpen: setOpen,
        })
      })}
    </div>
  )
})
Select.displayName = "Select"

const SelectTrigger = React.forwardRef(({ className, _value, _open, _setOpen, children, ...props }, ref) => (
  <button
    ref={ref}
    data-slot="select-trigger"
    className={cn(
      "flex h-8 items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    onClick={() => _setOpen?.(!_open)}
    {...props}
  >
    {children}
    <ChevronDown className={cn("h-3.5 w-3.5 opacity-50 transition-transform", _open && "rotate-180")} />
  </button>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = React.forwardRef(({ className, _value, _onValueChange, _open, _setOpen, children, ...props }, ref) => {
  if (!_open) return null
  return (
    <div
      ref={ref}
      data-slot="select-content"
      className={cn(
        "absolute top-[calc(100%+4px)] left-0 z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
        className
      )}
      {...props}
    >
      <div className="p-1">
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child
          return React.cloneElement(child, { _value, _onValueChange, _setOpen })
        })}
      </div>
    </div>
  )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef(({ className, value, _value, _onValueChange, _setOpen, children, ...props }, ref) => {
  const isSelected = _value === value
  return (
    <div
      ref={ref}
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
        isSelected && "bg-accent text-accent-foreground font-medium",
        className
      )}
      onClick={() => {
        _onValueChange?.(value)
        _setOpen?.(false)
      }}
      {...props}
    >
      {children}
    </div>
  )
})
SelectItem.displayName = "SelectItem"

const SelectValue = ({ placeholder, _value, children }) => {
  return <span className="truncate">{_value || children || placeholder}</span>
}
SelectValue.displayName = "SelectValue"

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue }
