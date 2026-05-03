import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("teleseva_user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (_) {
      // ignore
    }
  }, []);

  function login({ name, email }) {
    const newUser = { name, email };
    setUser(newUser);
    try {
      localStorage.setItem("teleseva_user", JSON.stringify(newUser));
    } catch (_) {
      // ignore
    }
  }

  function logout() {
    setUser(null);
    try {
      localStorage.removeItem("teleseva_user");
    } catch (_) {
      // ignore
    }
  }

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}


