import { User } from "../global/types.ts";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { API } from "../utils/api.ts";
import { RegisterFormInput } from "../components/RegisterForm.tsx";
import { LoginFormInput } from "../components/LoginForm.tsx";
import { handleFetch, HandleFetchResponse } from "../utils/handleFetch.ts";

interface AuthContextType {
  user: Omit<User, "password"> | null;
  token: string | null;
  logout: () => void;
  saveAuthData: (user: Omit<User, "password">, token: string) => void;
  isLoading: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<Omit<User, "password"> | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const EXPIRATION_TIME = 3600000;

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("authData") || "{}");
    const { user, token, expiresAt } = storedData;

    if (user && token && expiresAt > Date.now()) {
      setUser(user);
      setToken(token);
    } else {
      setUser(null);
      setToken(null);
    }

    setIsLoading(false);
  }, []);

  const saveAuthData = (user: Omit<User, "password">, token: string) => {
    const expiresAt = Date.now() + EXPIRATION_TIME;
    const authData = { user, token, expiresAt };

    localStorage.setItem("authData", JSON.stringify(authData));

    setUser(user);
    setToken(token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authData");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        saveAuthData,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
