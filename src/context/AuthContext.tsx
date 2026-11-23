import React, { createContext, useContext, useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import type { AuthResponse, User } from "../types/models";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, avatarUrl?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("animehub_token"));

  useEffect(() => {
    const savedUser = localStorage.getItem("animehub_user");
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
  }, [token]);

  const saveSession = (data: AuthResponse) => {
    localStorage.setItem("animehub_token", data.token);
    localStorage.setItem("animehub_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const login = async (email: string, password: string) => {
    const res = await axiosClient.post<AuthResponse>("/Users/login", { email, password });
    saveSession(res.data);
  };

  const register = async (username: string, email: string, password: string, avatarUrl = "") => {
    const res = await axiosClient.post<AuthResponse>("/Users/register", {
      username,
      email,
      password,
      avatarUrl,
    });
    saveSession(res.data);
  };

  const logout = () => {
    localStorage.removeItem("animehub_token");
    localStorage.removeItem("animehub_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);