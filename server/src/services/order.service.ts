import { Order, OrderStatus, User, UserRole } from "../types/models.types";
import { UserService } from "./user.service";
import { ApiError } from "../utils/ApiError";
import { ProductService } from "./product.service";
import { sequelize } from "../config/database";
import { QueryTypes } from "sequelize";
import { CreateOrder, GetOrderArgs } from "../types/order.types";

export class OrderService {
  static async getOrders({ userId, orderId, offset, limit }: GetOrderArgs) {
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
    ${userId ? `WHERE o."userId" = :userId` : ""}
    GROUP BY o.id
    ${limit ? "LIMIT :limit" : ""}
    ${offset ? "OFFSET :offset" : ""}
    `,
      {
        type: QueryTypes.SELECT,
        replacements: { orderId, userId, offset, limit },
      },
    )) as Order[];

    return orders;
  }

  static async getOrderCount(userId?: number): Promise<number> {
    const [res] = (await sequelize.query(
      `
      SELECT COUNT(*) FROM orders
      ${userId ? 'WHERE "userId" = :userId' : ""}
        `,
      {
        replacements: { userId },
        type: QueryTypes.SELECT,
      },
    )) as any;

    return parseInt(res.count);
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
    const existUser = (await UserService.getUsers({ userId }))[0];
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
      const [newOrders] = await sequelize.query(
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
            status: OrderStatus.Pending,
          },
          type: QueryTypes.INSERT,
          transaction,
        },
      );

      if (
        !newOrders ||
        !Array.isArray(newOrders) ||
        typeof newOrders[0] !== "object"
      ) {
        throw new Error("Order creation failed.");
      }

      const newOrder = newOrders[0];

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
    const usersWithOrder = await sequelize.query(
      'SELECT o.id, o."userId", u.role FROM orders o JOIN users u ON o."userId" = u.id WHERE o.id = :orderId AND o."userId" = :userId',
      {
        replacements: {
          orderId,
          userId,
        },
        type: QueryTypes.SELECT,
      },
    );

    if (
      !usersWithOrder ||
      !Array.isArray(usersWithOrder) ||
      typeof usersWithOrder[0] !== "object"
    ) {
      throw new Error("Orders not found");
    }

    const userWithOrder = usersWithOrder[0] as User & Order;

    if (userWithOrder.role != UserRole.Admin || userId !== userWithOrder.userId)
      throw ApiError.Forbidden();

    const transaction = await sequelize.transaction();
    try {
      await sequelize.query(
        'DELETE FROM orders WHERE id = :orderId AND "userId" = :userId',
        {
          replacements: { orderId, userId },
          type: QueryTypes.DELETE,
          transaction,
        },
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
}
