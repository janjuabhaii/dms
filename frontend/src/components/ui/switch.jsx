import * as React from "react";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef(({ className, checked, onCheckedChange, disabled, ...props }, ref) => (
  <label
    className={cn(
      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors",
      checked ? "bg-primary" : "bg-input",
      disabled && "cursor-not-allowed opacity-50",
      className
    )}
  >
    <input
      type="checkbox"
      ref={ref}
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      disabled={disabled}
      className="sr-only"
      {...props}
    />
    <span
      className={cn(
        "inline-block h-4 w-4 transform rounded-full bg-background shadow transition-transform",
        checked ? "translate-x-6" : "translate-x-1"
      )}
    />
  </label>
));
Switch.displayName = "Switch";

export { Switch };
