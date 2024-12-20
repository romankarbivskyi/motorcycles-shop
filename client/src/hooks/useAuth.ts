import { useAuthContext } from "../contexts/AuthContext.tsx";
import { UserRole } from "../types/global.ts";

export function useAuth() {
  const { user, accessToken, login, logout } = useAuthContext();

  const isAuthenticated = !!user && !!accessToken;
  const isAdmin = isAuthenticated && user?.role === UserRole.Admin;

  return { user, accessToken, login, logout, isAuthenticated, isAdmin };
}
