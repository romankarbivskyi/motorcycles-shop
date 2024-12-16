import { Order, Product, User, UserRole } from "../types/models.types";
import { UserService } from "./user.service";
import { ApiError } from "../utils/ApiError";
import { ProductService } from "./product.service";
import { sequelize } from "../config/database";
import { QueryTypes } from "sequelize";
import { CreateOrder, GetOrderArgs } from "../types/order.types";

export class OrderService {
  static async getOrders({ userId, orderId }: GetOrderArgs) {
    const orders = (await sequelize.query(
      `
    SELECT 
      o.*,
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'id', oi.id,
            'productId', oi."productId",
            'quantity', oi.quantity,
            'price', oi.price
          )
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'::json
      ) AS orderItems
    FROM orders o
    LEFT JOIN "orderItems" oi ON oi."orderId" = o.id
    ${orderId ? `WHERE o.id = :orderId` : ""}
    ${orderId ? `WHERE o."userId" = :userId` : ""}
    GROUP BY o.id
    `,
      {
        type: QueryTypes.SELECT,
        replacements: { orderId },
      },
    )) as Order[];

    if (orders.length === 0) throw ApiError.NotFound("Orders not found");

    return orders;
  }

  static async createOrder({
    firstName,
    lastName,
    phone,
    email,
    shipAddress,
    userId,
    orderItems,
  }: CreateOrder) {
    const existUser = (await UserService.getUsers(userId))[0];
    if (!existUser) throw ApiError.NotFound("User not found");

    if (!orderItems)
      throw ApiError.BadRequest("OrderItems should not be empty");

    let totalPrice: number = 0;

    const productsPrice: number[] = [];

    const parseOrderItems = orderItems.map((orderItem) =>
      typeof orderItem === "string" ? JSON.parse(orderItem) : orderItem,
    );

    for (const orderItem of parseOrderItems) {
      const parsedOrderItem =
        typeof orderItem === "string" ? JSON.parse(orderItem) : orderItem;

      const product = (
        await ProductService.getProducts({
          productId: parsedOrderItem.productId,
        })
      )[0];
      if (!product) {
        throw ApiError.NotFound(
          `Product with ID ${parsedOrderItem.productId} not found`,
        );
      }
      productsPrice.push(product.price);
      totalPrice += product.price * parsedOrderItem.quantity;
    }

    const transaction = await sequelize.transaction();

    try {
      const newOrder = (
        (await sequelize.query(
          `
      INSERT INTO orders 
      ("firstName", "lastName", phone, email, "totalPrice", "shipAddress", "userId", status) 
      VALUES 
      (:firstName, :lastName, :phone, :email, :totalPrice, :shipAddress, :userId, :status)
      RETURNING *;
      `,
          {
            replacements: {
              firstName,
              lastName,
              phone,
              email,
              totalPrice,
              shipAddress,
              userId,
              status: "Pending",
            },
            type: QueryTypes.INSERT,
            transaction,
          },
        )) as any
      )[0][0] as Order;

      const orderId = newOrder.id;

      if (!orderId) {
        throw new Error("Failed to create the order");
      }

      for (const [i, orderItem] of parseOrderItems.entries()) {
        await sequelize.query(
          `
        INSERT INTO "orderItems" 
        ("orderId", "productId", quantity, price) 
        VALUES 
        (:orderId, :productId, :quantity, :price);
        `,
          {
            replacements: {
              orderId,
              productId: orderItem.productId,
              quantity: orderItem.quantity,
              price: productsPrice[i],
            },
            type: QueryTypes.INSERT,
            transaction,
          },
        );
      }

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
