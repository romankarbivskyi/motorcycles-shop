import { useQuery } from "@tanstack/react-query";
import { fetchUserById, fetchUsers, FetchUsersParams } from "../api/users.ts";

export interface UseUsersProps {
  params?: FetchUsersParams;
}

export const useUser = (userId: number) => {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => fetchUserById(userId),
  });
};

export const useUsers = ({ params }: UseUsersProps) => {
  return useQuery({
    queryKey: ["users", params],
    queryFn: async () => await fetchUsers(params),
  });
};
