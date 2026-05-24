import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearAuthStorage } from "@/lib/api";
import { STORAGE_KEYS, AUTH_EVENTS } from "@/lib/constants";

const AuthContext = createContext(undefined);

function getStoredUser() {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

  if (!token || !storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem(STORAGE_KEYS.USER);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());

  useEffect(() => {
    const syncAuthState = () => {
      setUser(getStoredUser());
    };

    window.addEventListener(AUTH_EVENTS.CHANGED, syncAuthState);

    return () => {
      window.removeEventListener(AUTH_EVENTS.CHANGED, syncAuthState);
    };
  }, []);

  const login = (accessToken, refreshToken, userData) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    setUser(userData);
    window.dispatchEvent(new Event(AUTH_EVENTS.CHANGED));
  };

  const logout = () => {
    clearAuthStorage();
    setUser(null);
    window.dispatchEvent(new Event(AUTH_EVENTS.CHANGED));
    window.location.href = "/login";
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user && localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)),
      login,
      logout,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }

  return context;
}
