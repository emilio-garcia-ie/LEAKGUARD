"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, User, BreachAlert } from "@/lib/api";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<BreachAlert | undefined>;
  register: (email: string, password: string, name: string) => Promise<BreachAlert | undefined>;
  demo: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("leakguard_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api.me()
      .then((r) => setUser(r.authenticated ? r.user || null : null))
      .catch(() => localStorage.removeItem("leakguard_token"))
      .finally(() => setLoading(false));
  }, []);

  const persist = (token: string, u: User) => {
    localStorage.setItem("leakguard_token", token);
    setUser(u);
  };

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    persist(res.access_token, res.user);
    return res.breach_alert;
  };

  const register = async (email: string, password: string, name: string) => {
    const res = await api.register(email, password, name);
    persist(res.access_token, res.user);
    return res.breach_alert;
  };

  const demo = async () => {
    const res = await api.demo();
    persist(res.access_token, res.user);
  };

  const logout = () => {
    localStorage.removeItem("leakguard_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, demo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
