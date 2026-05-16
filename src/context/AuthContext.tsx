import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "@/api/auth";

interface User {
  id: string;
  email: string;
  fullName?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
  try {
    const data = await authApi.login(email, password);
    console.log("API Response:", data);
    localStorage.setItem("token", data.token);
    const userData = {
      id: data.id,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
    };
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    console.log("User set:", userData);
  } catch (err) {
    console.error("SignIn Error:", err);
    throw err;
  }
};

  const signUp = async (email: string, password: string, fullName?: string) => {
    const data = await authApi.register(email, password, fullName);
    localStorage.setItem("token", data.token);
    const userData = {
      id: data.id,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
    };
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const signOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin: user?.role === "admin",
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};