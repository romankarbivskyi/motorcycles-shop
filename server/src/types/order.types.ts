import { OrderItem } from "./models.types";

export interface CreateOrder {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  shipAddress: string;
  userId: number;
  orderItems: Omit<OrderItem, "id" | "orderId" | "price">[];
}

export interface GetOrderArgs {
  orderId?: number;
  userId?: number;
  offset?: number;
  limit?: number;
}
