"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from "@/lib/constants";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/verify", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);

        // Also store in localStorage for quick access
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      } else {
        setUser(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial auth check
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }

      const data: AuthResponse = await response.json();
      setUser(data.user);

      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
      }
      router.push(APP_ROUTES.LOGIN);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        checkAuth,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
