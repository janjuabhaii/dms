import { Component } from "react";
import { AlertOctagon, RotateCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Must be a class component — React error boundaries have no Hook
 * equivalent (getDerivedStateFromError/componentDidCatch only exist on
 * classes). This catches crashes in rendering/lifecycle methods; it does
 * NOT catch errors in event handlers or async code (those are handled by
 * try/catch + toast, or by React Query's isError + <ErrorState/>, elsewhere
 * in the app). Wraps the whole app in main.jsx as the last line of defense
 * so a bug in one component never takes down the entire page to a blank
 * white screen — a jarring, unrecoverable-feeling failure for a commercial
 * product to ship.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // In a real deployment this is where an error-tracking service
    // (Sentry, etc.) would be called. Logged to console for now.
    console.error("[ErrorBoundary] Caught a render error:", error, info);
  }

  handleReload = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertOctagon className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold text-foreground">Something went wrong</h1>
            <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
              An unexpected error occurred. Reloading usually fixes it — if it keeps happening,
              contact support.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={this.handleReload}>
              <Home className="h-4 w-4" />
              Go home
            </Button>
            <Button onClick={() => window.location.reload()}>
              <RotateCw className="h-4 w-4" />
              Reload page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
