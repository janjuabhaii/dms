import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Replaces the ad-hoc "Couldn't load X: {error.message}" divs that had
 * drifted into three slightly different styles across Products/Workers/
 * Orders pages (one even had a different border/background entirely).
 * One component, one look, and — the part the old inline divs never had —
 * an actual way to recover without a full page refresh.
 */
const ErrorState = ({ title = "Couldn't load this", message, onRetry }) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center">
    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10">
      <AlertTriangle className="h-5 w-5 text-destructive" />
    </div>
    <div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {message && <p className="mt-1 max-w-sm text-xs text-muted-foreground">{message}</p>}
    </div>
    {onRetry && (
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RotateCw className="h-3.5 w-3.5" />
        Try again
      </Button>
    )}
  </div>
);

export default ErrorState;
