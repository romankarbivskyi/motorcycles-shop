import { useAuthContext } from "../contexts/AuthContext.tsx";
import { UserRole } from "../global/types.ts";

export function useAuth() {
  const { user, token, saveAuthData, logout } = useAuthContext();

  const isAuthenticated = !!user && !!token;
  const isAdmin = isAuthenticated && user?.role === UserRole.Admin;

  return {
    user,
    token,
    saveAuthData,
    logout,
    isAuthenticated,
    isAdmin,
  };
}
