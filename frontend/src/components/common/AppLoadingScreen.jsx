import { Boxes } from "lucide-react";

/**
 * Shown only during the initial `AuthContext` session check (validating a
 * stored token against GET /auth/me) — a brief moment, but "brief" still
 * means a blank white flash on every fresh page load if left unhandled.
 * A commercial product doesn't get to skip this; it's the very first thing
 * anyone sees.
 */
const AppLoadingScreen = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
    <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-xl bg-primary/10">
      <Boxes className="h-6 w-6 text-primary" />
    </div>
    <div className="h-0.5 w-24 overflow-hidden rounded-full bg-muted">
      <div className="h-full w-1/3 animate-[loading-bar_1.1s_ease-in-out_infinite] rounded-full bg-primary" />
    </div>
  </div>
);

export default AppLoadingScreen;
