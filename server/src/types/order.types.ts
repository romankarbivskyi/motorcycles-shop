export interface CreateOrder {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  shipAddress: string;
  userId: number;
  orderItems: {
    productId: number;
    quantity: number;
  }[];
}

export interface GetOrderArgs {
  orderId?: number;
  userId?: number;
}
