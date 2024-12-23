export interface User {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  role: UserRole;
}

export enum UserRole {
  Admin = "Admin",
  Customer = "Customer",
}

export interface Product {
  id: number;
  make: string;
  model: string;
  year: number;
  price: number;
  description: string;
  stockQuantity: number;
  createAt: Date;
  categoryId: number;
}

export interface Attribute {
  id: number;
  name: string;
  value: string;
  productId: number;
}

export interface Image {
  id: number;
  url: string;
  productId: number;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Order {
  id: number;
  userId: number;
  totalPrice: number;
  shipAddress: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  status: OrderStatus;
  createAt: Date;
}

export enum OrderStatus {
  Pending = "Pending",
  Completed = "Completed",
  Shipped = "Shipped",
  Cancelled = "Cancelled",
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  make: string;
  model: string;
  year: number;
}

export interface Review {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  comment: string;
  createAt: string;
  updateAt?: string;
}

export interface ProductWithAssets {
  id: number;
  make: string;
  model: string;
  year: number;
  price: number | string;
  description: string;
  stockQuantity: number;
  createAt?: Date;
  categoryId: number;
  categoryName: string;
  attributes: Attribute[];
  images: Image[];
}

export interface OrderWithItems extends Order {
  orderItems: OrderItem[];
}

export interface FetchPaginationParams {
  limit?: number;
  offset?: number;
}

export type ReviewWithUserName = Review & Pick<User, "firstName" | "lastName">;
