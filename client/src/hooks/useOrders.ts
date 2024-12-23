import { useQuery } from "@tanstack/react-query";
import {
  fetchOrders,
  FetchOrdersParams,
  fetchUserOrders,
} from "../api/orders.ts";

export interface UseOrdersProps {
  params?: FetchOrdersParams;
  userId?: number;
}

export const useUserOrders = (userId: number) => {
  return useQuery({
    queryKey: ["userOrders", userId],
    queryFn: async () => await fetchUserOrders(userId),
  });
};

export const useOrders = ({ params, userId }: UseOrdersProps) => {
  return useQuery({
    queryKey: ["orders", params, userId],
    queryFn: async () => await fetchOrders(params, userId),
  });
};
