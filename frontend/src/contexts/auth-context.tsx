"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { getMe } from "@/lib/api/auth";

import type { AuthUser } from "@/lib/api/auth";

import { getToken, getUser, logout, saveAuth } from "@/lib/auth";

type AuthContextValue = {
  user: AuthUser | null;

  token: string | null;

  loading: boolean;

  setSession: (token: string, user: AuthUser) => void;

  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const [token, setToken] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      const storedToken = getToken();

      const storedUser = getUser();

      if (!storedToken) {
        setLoading(false);
        return;
      }

      setToken(storedToken);

      if (storedUser) {
        setUser(storedUser);
      }

      try {
        const current = await getMe();

        setUser(current);

        saveAuth(storedToken, current);
      } catch {
        logout();

        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, []);

  function setSession(newToken: string, newUser: AuthUser) {
    saveAuth(newToken, newUser);

    setToken(newToken);
    setUser(newUser);
  }

  function signOut() {
    logout();

    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        setSession,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth precisa estar dentro de AuthProvider.");
  }

  return context;
}
