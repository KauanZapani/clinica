import { createContext, useContext, useState, useEffect } from "react";

export type Role = "recepcao" | "administrador";

interface AuthUser {
  role: Role;
  name: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (role: Role, password: string) => boolean;
  logout: () => void;
  isAdmin: boolean;
  isRecepcao: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const CREDENTIALS: Record<Role, string> = {
  recepcao: "recepção21",
  administrador: "kauan09",
};

const ROLE_NAMES: Record<Role, string> = {
  recepcao: "Recepção",
  administrador: "Administrador",
};

const STORAGE_KEY = "clinica_auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = (role: Role, password: string): boolean => {
    if (CREDENTIALS[role] === password) {
      setUser({ role, name: ROLE_NAMES[role] });
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAdmin: user?.role === "administrador",
        isRecepcao: user?.role === "recepcao",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
