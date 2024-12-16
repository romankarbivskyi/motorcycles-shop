import { Order, Product, User, UserRole } from "../types/models.types";
import { UserService } from "./user.service";
import { ApiError } from "../utils/ApiError";
import { ProductService } from "./product.service";
import { sequelize } from "../config/database";
import { QueryTypes } from "sequelize";

export class OrderService {
  static async getOrders(orderId?: number) {
    const orders = (await sequelize.query(
      "SELECT * FROM orders" + (orderId ? ` WHERE id = ${orderId}` : ""),
      {
        type: QueryTypes.SELECT,
      },
    )) as Order[];

    if (orders.length == 0) throw ApiError.NotFound("Orders not found");

    return orders;
  }

  static async getUserOrders(userId: number) {
    const orders = (await sequelize.query(
      `SELECT * FROM orders WHERE "userId" = ${userId}`,
      {
        type: QueryTypes.SELECT,
      },
    )) as Order[];

    if (orders.length == 0) throw ApiError.NotFound("Orders not found");

    return orders;
  }

  static async createOrder({
    firstName,
    lastName,
    phone,
    email,
    shipAddress,
    productId,
    quantity,
    userId,
  }: Partial<Order>) {
    const existUser = (await UserService.getUsers(userId))[0];
    if (!existUser) throw ApiError.NotFound("User not found");

    const existProduct = (await ProductService.getProducts(productId))[0];
    if (!existProduct) throw ApiError.NotFound("Products not found");

    const transaction = await sequelize.transaction();
    try {
      const newOrder = (
        (await sequelize.query(
          `INSERT INTO orders ("firstName", "lastName", phone, email, "totalPrice", "shipAddress", "productId", quantity, "userId") 
VALUES (:firstName, :lastName, :phone, :email, :totalPrice, :shipAddress, :productId, :quantity, :userId) RETURNING *`,
          {
            type: QueryTypes.INSERT,
            replacements: {
              firstName,
              lastName,
              phone,
              email,
              totalPrice: existProduct.price * quantity! || 1,
              shipAddress,
              productId,
              quantity,
              userId,
            },
          },
        )) as any
      )[0][0] as Product;

      await transaction.commit();
      return newOrder;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  static async deleteOrder(orderId: number, userId: number) {
    const userOrder = (
      await sequelize.query(
        'SELECT o.id, o."userId", u.role FROM orders o JOIN users u ON o."userId" = u.id WHERE o.id = :orderId AND o."userId" = :userId',
        {
          replacements: {
            orderId,
            userId,
          },
          type: QueryTypes.SELECT,
        },
      )
    )?.[0] as any as Order & User;

    if (!userOrder) throw ApiError.NotFound("Orders not found");

    if (userOrder.role != UserRole.Admin || userId !== userOrder.userId)
      throw ApiError.Forbidden();

    await sequelize.query(
      'DELETE FROM orders WHERE id = :orderId AND "userId" = :userId',
      {
        replacements: { orderId, userId },
        type: QueryTypes.DELETE,
      },
    );
  }
}
