import {
  FetchPaginationParams,
  ProductWithAssets,
  User,
} from "../global/types.ts";
import { API } from "../utils/api.ts";
import { UserProfileInput } from "../pages/ProfilePage.tsx";
import { handleFetch, HandleFetchResponse } from "../utils/handleFetch.ts";

export interface FetchUsersParams extends FetchPaginationParams {}

export const fetchUserById = async (
  userId: number,
): Promise<Omit<User, "password">> => {
  const { data } = await API.get<Omit<User, "password">>(`/users/${userId}`);
  return data as Omit<User, "password">;
};

export const fetchUsers = async (
  params?: FetchUsersParams,
): Promise<{
  users: Omit<User, "password">[];
  count: number;
}> => {
  const { data: usersData } = await API.get<Omit<User, "password">[]>(
    "/users",
    {
      params,
    } as any,
  );

  const { data: countData } = await API.get<number>(`/users/count`, {
    params,
  } as any);

  return { users: usersData, count: countData } as {
    users: Omit<User, "password">[];
    count: number;
  };
};

export const updateUser = async (
  userId: number,
  userData: Partial<UserProfileInput>,
): Promise<
  HandleFetchResponse<{ user: Omit<User, "password">; token: string }>
> => {
  return handleFetch<{ user: Omit<User, "password">; token: string }>({
    fetch: async () => await API.put(`/users/${userId}`, userData),
  });
};
