import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const QuantityStepper = ({ quantity, onChange, max, size = "default" }) => {
  const isSmall = size === "sm";

  return (
    <div className="flex items-center rounded-lg border border-input">
      <button
        type="button"
        onClick={() => onChange(quantity - 1)}
        disabled={quantity <= 1}
        className={cn(
          "flex items-center justify-center text-muted-foreground disabled:opacity-30",
          isSmall ? "h-7 w-7" : "h-9 w-9"
        )}
        aria-label="Decrease quantity"
      >
        <Minus className={isSmall ? "h-3 w-3" : "h-3.5 w-3.5"} />
      </button>
      <span className={cn("min-w-[2ch] text-center font-medium text-foreground", isSmall ? "text-xs" : "text-sm")}>
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        disabled={quantity >= max}
        className={cn(
          "flex items-center justify-center text-muted-foreground disabled:opacity-30",
          isSmall ? "h-7 w-7" : "h-9 w-9"
        )}
        aria-label="Increase quantity"
      >
        <Plus className={isSmall ? "h-3 w-3" : "h-3.5 w-3.5"} />
      </button>
    </div>
  );
};

export default QuantityStepper;
