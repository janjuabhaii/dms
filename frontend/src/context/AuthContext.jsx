import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "@/api/auth.api";

const AuthContext = createContext(null);

const TOKEN_KEY = "dms_token";
const USER_KEY = "dms_user";

/**
 * Global auth state: current user, role, and loading state.
 * Scoped with plain Context + useState rather than Redux, since auth is
 * the only truly global piece of state this app needs — everything else
 * (products, orders, etc.) will live in React Query's cache.
 *
 * On mount, if a token exists in storage, we don't just trust it blindly —
 * we call GET /auth/me to confirm it's still valid (not expired, user still
 * active) and refresh the user object from the source of truth. This avoids
 * a stale/expired token silently granting access to protected routes on
 * the client while every real API call would 401 anyway.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await authApi.me();
        setUser(res.data);
        localStorage.setItem(USER_KEY, JSON.stringify(res.data));
      } catch (err) {
        // Token invalid/expired — the axios interceptor already clears it
        // and would redirect on a 401, but we still clear local state here
        // defensively in case validateSession runs before that.
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, []);

  /**
   * Calls the login API, stores the token + user, and updates state.
   * Throws on failure so the Login page can show the error inline.
   */
  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    const { user: loggedInUser, token } = res.data;

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(loggedInUser));
    setUser(loggedInUser);

    return loggedInUser;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // Even if the network call fails, still clear the local session —
      // the user's intent to log out should always succeed client-side.
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      role: user?.role || null,
      isAuthenticated: !!user,
      loading,
      login,
      logout,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
