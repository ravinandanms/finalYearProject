import React, { createContext, useContext, useEffect, useMemo, useState, useRef } from "react";
import { io } from "socket.io-client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("teleseva_user");
      return stored ? JSON.parse(stored) : null;
    } catch (_) {
      return null;
    }
  });
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  // Manage socket connection lifecycle
  useEffect(() => {
    if (!socketRef.current) {
      const newSocket = io("http://localhost:3000", {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 20,
        reconnectionDelay: 1000,
      });
      socketRef.current = newSocket;
      setSocket(newSocket);
    }

    const currentSocket = socketRef.current;

    const handleJoin = () => {
      if (user) {
        const uid = String(user._id || user.id || user.email);
        console.log(`[Socket.IO] Emitting join event for user: ${uid} (Role: ${user.role})`);
        currentSocket.emit("join", { 
          userId: uid, 
          role: user.role,
          name: user.name || 'User'
        });
      }
    };

    currentSocket.on("connect", handleJoin);

    if (currentSocket.connected && user) {
      handleJoin();
    }

    return () => {
      currentSocket.off("connect", handleJoin);
    };
  }, [user]);

  function login(userData) {
    setUser(userData);
    try {
      localStorage.setItem("teleseva_user", JSON.stringify(userData));
    } catch (_) {
      // ignore
    }
  }

  function logout() {
    setUser(null);
    try {
      localStorage.removeItem("teleseva_user");
      localStorage.removeItem("teleseva_token");
    } catch (_) {
      // ignore
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
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

