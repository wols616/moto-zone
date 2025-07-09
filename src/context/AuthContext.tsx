import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { User } from "@/types";
import { toast } from "sonner";
import axios from "axios";
import api from "../services/api";
import { useBackendStatus } from "@/hooks/use-backend-status";
import { localStorageService } from "@/services/localStorage";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (
    email: string,
    password: string,
    name: string,
    role: string
  ) => Promise<boolean>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEmployee: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { isBackendAvailable, isChecking } = useBackendStatus();

  // Initialize local storage data when backend is not available
  useEffect(() => {
    if (isBackendAvailable === false) {
      localStorageService.initializeMockData();
      console.log("🎭 [AuthContext] Offline mode initialized with mock data");
    }
  }, [isBackendAvailable]);

  // Check if user is authenticated on app start
  useEffect(() => {
    if (isChecking) return; // Wait for backend status check

    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (isBackendAvailable === false) {
        // Offline mode - check for stored offline user
        const offlineUser = localStorage.getItem("offline-user");
        if (offlineUser) {
          try {
            setUser(JSON.parse(offlineUser));
            console.log("🎭 [AuthContext] Offline user restored");
          } catch (error) {
            localStorage.removeItem("offline-user");
          }
        }
        setLoading(false);
        return;
      }

      if (token) {
        try {
          // Set token in axios headers
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          console.log("🔐 [AuthContext] Verifying token...");
          const response = await api.get("/auth/profile");
          console.log(
            "🔐 [AuthContext] Token verified, user:",
            response.data.data
          );
          setUser(response.data.data);
        } catch (error) {
          // Token is invalid, remove it
          console.log("🔐 [AuthContext] Token invalid, removing...");
          localStorage.removeItem("token");
          delete api.defaults.headers.common["Authorization"];
        }
      } else {
        console.log("🔐 [AuthContext] No token found");
      }
      setLoading(false);
    };

    checkAuth();
  }, [isBackendAvailable, isChecking]);

  // Set up axios interceptors
  useEffect(() => {
    // Request interceptor to add token
    const requestInterceptor = api.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor to handle 401 errors
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired, logout user
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);

      // Offline mode
      if (isBackendAvailable === false) {
        const user = localStorageService.authenticateUser(email, password);
        if (user) {
          setUser(user);
          localStorage.setItem("offline-user", JSON.stringify(user));
          toast.success(`¡Bienvenido, ${user.name}! (Modo sin conexión)`);
          return true;
        } else {
          toast.error(
            "Credenciales inválidas. Usa contraseña: demo, 123456 o admin"
          );
          return false;
        }
      }

      // Online mode
      const response = await api.post("/auth/login", { email, password });
      const { user: userData, token } = response.data.data;

      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(userData);
      toast.success(`¡Bienvenido, ${userData.name}!`);
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Error al iniciar sesión");
      } else {
        toast.error("Error desconocido al iniciar sesión");
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: string
  ): Promise<boolean> => {
    try {
      setLoading(true);

      // Offline mode - simplified registration
      if (isBackendAvailable === false) {
        const newUser: User = {
          id: `offline-user-${Date.now()}`,
          email,
          name,
          role: role as "admin" | "employee",
        };
        setUser(newUser);
        localStorage.setItem("offline-user", JSON.stringify(newUser));
        toast.success(
          `¡Usuario registrado exitosamente, ${newUser.name}! (Modo sin conexión)`
        );
        return true;
      }

      // Online mode
      const response = await api.post("/auth/register", {
        email,
        password,
        name,
        role,
      });
      const { user: userData, token } = response.data.data;

      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(userData);
      toast.success(`¡Usuario registrado exitosamente, ${userData.name}!`);
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Error al registrar usuario"
        );
      } else {
        toast.error("Error desconocido al registrar usuario");
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (isBackendAvailable === false) {
      localStorage.removeItem("offline-user");
    } else {
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
    }
    setUser(null);
    toast.info("Sesión cerrada.");
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";
  const isEmployee = user?.role === "employee";

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        isAuthenticated,
        isAdmin,
        isEmployee,
        loading,
      }}
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
