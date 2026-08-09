import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("teleseva_user");
      if (stored) {
        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);
        initializeSocket(parsedUser);
      }
    } catch (_) {
      // ignore
    }
  }, []);

  const initializeSocket = (userData) => {
    if (socket) return; // Prevent multiple connections
    // Assuming backend runs on 3000 (from .env)
    const newSocket = io("http://localhost:3000"); 
    
    newSocket.on("connect", () => {
      console.log("Connected to Socket.IO server");
      // Send the userId and role to register online status
      newSocket.emit("join", { userId: userData._id || userData.email, role: userData.role });
    });

    setSocket(newSocket);
  };

  function login(userData) {
    setUser(userData);
    try {
      localStorage.setItem("teleseva_user", JSON.stringify(userData));
    } catch (_) {
      // ignore
    }
    initializeSocket(userData);
  }

  function logout() {
    setUser(null);
    try {
      localStorage.removeItem("teleseva_user");
      localStorage.removeItem("teleseva_token"); // if we store token separately
    } catch (_) {
      // ignore
    }
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  }

  const value = useMemo(() => ({ user, socket, login, logout }), [user, socket]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
