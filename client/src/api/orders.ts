import { OrderInput } from "../pages/CartPage.tsx";
import { API } from "../utils/api.ts";
import {
  Category,
  FetchPaginationParams,
  Order,
  OrderStatus,
  OrderWithItems,
} from "../global/types.ts";
import { handleFetch, HandleFetchResponse } from "../utils/handleFetch.ts";

export interface FetchOrdersParams extends FetchPaginationParams {}

export const createOrder = async (
  orderData: OrderInput,
): Promise<HandleFetchResponse<OrderWithItems>> => {
  return handleFetch({
    fetch: async () => await API.post<OrderWithItems>("/orders", orderData),
  });
};

export const fetchUserOrders = async (userId: number) => {
  const { data } = await API.get<OrderWithItems[]>(`/orders/user/${userId}`);
  return data as OrderWithItems[];
};

export const fetchOrders = async (
  params?: FetchOrdersParams,
  userId?: number,
): Promise<{ orders: OrderWithItems[]; count: number }> => {
  const { data: ordersData } = await API.get<OrderWithItems[]>(
    `/orders${userId ? `/user/${userId}` : ""}`,
    {
      params,
    } as any,
  );

  const { data: countData } = await API.get<number>(
    `/orders/count${userId ? `/user/${userId}` : ""}`,
    {
      params,
    } as any,
  );

  return { orders: ordersData, count: countData } as {
    orders: OrderWithItems[];
    count: number;
  };
};

export const changeOrderStatus = async (
  orderId: string,
  newStatus: OrderStatus,
): Promise<HandleFetchResponse<Order>> => {
  return handleFetch<Order>({
    fetch: async () =>
      await API.post<Order>(`/orders/${orderId}/status`, {
        status: newStatus,
      }),
  });
};

export const deleteOrder = async (
  orderId: number,
): Promise<HandleFetchResponse<any>> => {
  return handleFetch({
    fetch: async () => await API.delete(`/orders/${orderId}`),
  });
};
