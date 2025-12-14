import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { api } from "../services/api";
import type { User, RegisterData, LoginData } from "../services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state from localStorage
  const getInitialUser = (): User | null => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  };

  const [user, setUser] = useState<User | null>(getInitialUser);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [loading] = useState(false);

  const login = useCallback(async (data: LoginData) => {
    const response = await api.login(data);
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const response = await api.register(data);
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  const isAdmin = useCallback(() => {
    return user?.role === "admin";
  }, [user]);

  const contextValue = useMemo(
    () => ({ user, token, loading, login, register, logout, isAdmin }),
    [user, token, loading, login, register, logout, isAdmin]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
