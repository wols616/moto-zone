import React, { createContext, useState, useContext, ReactNode } from "react";
import { User } from "@/types";
import { mockUsers } from "@/data/mockData";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEmployee: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string): boolean => {
    const foundUser = mockUsers.find(
      (u) => u.email === email && u.password === password,
    );
    if (foundUser) {
      setUser(foundUser);
      toast.success(`Bienvenido, ${foundUser.name}!`);
      return true;
    }
    toast.error("Credenciales incorrectas.");
    return false;
  };

  const logout = () => {
    setUser(null);
    toast.info("Sesión cerrada.");
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";
  const isEmployee = user?.role === "employee";

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated, isAdmin, isEmployee }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};