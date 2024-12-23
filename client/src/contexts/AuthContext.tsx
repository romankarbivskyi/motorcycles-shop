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

interface AuthContextType {
  user: Omit<User, "password"> | null;
  token: string | null;
  logout: () => void;
  saveAuthData: (user: Omit<User, "password">, token: string) => void;
  registerUser: (userData: RegisterFormInput) => Promise<void>;
  loginUser: (userData: LoginFormInput) => Promise<void>;
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
    // Retrieve the saved authentication data
    const storedData = JSON.parse(localStorage.getItem("authData") || "{}");
    const { user, token, expiresAt } = storedData;

    // Check if the token is still valid and set user/token in state
    if (user && token && expiresAt > Date.now()) {
      setUser(user);
      setToken(token);
    } else {
      // If no valid data, clear user and token
      setUser(null);
      setToken(null);
    }

    setIsLoading(false);
  }, []);

  const saveAuthData = (user: Omit<User, "password">, token: string) => {
    const expiresAt = Date.now() + EXPIRATION_TIME;
    const authData = { user, token, expiresAt };

    // Store the auth data as an object in localStorage, not as an array
    localStorage.setItem("authData", JSON.stringify(authData));

    setUser(user);
    setToken(token);
  };

  const registerUser = async (userData: RegisterFormInput) => {
    try {
      const { data } = await API.post<{
        user: Omit<User, "password">;
        token: string;
      }>("/auth/register", userData, {
        headers: { "Content-Type": "application/json" },
      } as any);

      saveAuthData(data.user, data.token);
    } catch (error) {
      console.error("Registration error", error);
    }
  };

  const loginUser = async (userData: LoginFormInput) => {
    try {
      const { data } = await API.post<{
        user: Omit<User, "password">;
        token: string;
      }>("/auth/login", userData, {
        headers: { "Content-Type": "application/json" },
      } as any);

      saveAuthData(data.user, data.token);
    } catch (error) {
      console.error("Login error", error);
    }
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
        registerUser,
        loginUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
