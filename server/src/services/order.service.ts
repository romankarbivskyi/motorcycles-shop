import { Order, OrderStatus, User, UserRole } from "../types/models.types";
import { UserService } from "./user.service";
import { ApiError } from "../utils/ApiError";
import { ProductService } from "./product.service";
import { sequelize } from "../config/database";
import { QueryTypes } from "sequelize";
import {
  CreateOrder,
  GetOrderArgs,
  OrderWithItems,
} from "../types/order.types";
import { ProductWithAssets } from "../types/product.types";

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
            'price', oi.price,
            'make', oi.make,
            'model', oi.model,
            'year', oi.year
          )
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'::json
      ) AS "orderItems"
    FROM orders o
    LEFT JOIN "orderItems" oi ON oi."orderId" = o.id
    WHERE 1=1
      ${orderId ? `AND o.id = :orderId` : ""}
      ${userId ? `AND o."userId" = :userId` : ""}
    GROUP BY o.id
    ${limit ? "LIMIT :limit" : ""}
    ${offset ? "OFFSET :offset" : ""}
    `,
      {
        type: QueryTypes.SELECT,
        replacements: { orderId, userId, offset, limit },
      },
    )) as OrderWithItems[];

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
    if (!existUser) throw ApiError.NotFound("Користувача не знайдено");

    if (!orderItems)
      throw ApiError.BadRequest("Список товарів не повинен бути порожнім");

    let totalPrice: number = 0;

    const products: ProductWithAssets[] = [];

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
      )[0] as any;
      if (!product) {
        throw ApiError.NotFound(
          `Товар з ID ${parsedOrderItem.productId} не знайдено`,
        );
      }
      console.log(product);
      products.push(product);
      totalPrice += product.price * parsedOrderItem.quantity;
    }

    const transaction = await sequelize.transaction();
    try {
      const [newOrders] = await sequelize.query(
        `
    INSERT INTO orders 
    ("firstName", "lastName", phone, email, "totalPrice", "shipAddress", "userId", status, "createAt") 
    VALUES 
    (:firstName, :lastName, :phone, :email, :totalPrice, :shipAddress, :userId, :status, :createAt)
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
            createAt: new Date(Date.now()).toUTCString(),
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
        throw new Error("Створення замовлення не вдалося.");
      }

      const newOrder = newOrders[0];

      const orderId = newOrder.id;

      if (!orderId) {
        throw new Error("Не вдалося створити замовлення");
      }

      console.log(products);
      for (const [i, orderItem] of parseOrderItems.entries()) {
        await sequelize.query(
          `
        INSERT INTO "orderItems" 
        ("orderId", "productId", quantity, price, make, model, year) 
        VALUES 
        (:orderId, :productId, :quantity, :price, :make, :model, :year);
        `,
          {
            replacements: {
              orderId,
              productId: orderItem.productId,
              quantity: orderItem.quantity,
              price: parseInt(products[i].price as string),
              make: products[i].make,
              model: products[i].model,
              year: products[i].year,
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
      throw new Error("Замовлення не знайдено");
    }

    const userWithOrder = usersWithOrder[0] as User & Order;

    if (userWithOrder.role != UserRole.Admin || userId !== userWithOrder.userId)
      throw ApiError.Forbidden();

    const transaction = await sequelize.transaction();
    try {
      await sequelize.query(
        'DELETE FROM "orderItems" WHERE "orderId" = :orderId',
        {
          replacements: { orderId },
          type: QueryTypes.DELETE,
          transaction,
        },
      );

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

  static async changeStatus(orderId: number, newStatus: OrderStatus) {
    const existOrder = (await this.getOrders({ orderId }))[0];
    if (!existOrder) {
      throw ApiError.NotFound("Замовлення не знайдено");
    }

    const transaction = await sequelize.transaction();
    try {
      if (
        newStatus === OrderStatus.Completed ||
        newStatus === OrderStatus.Cancelled
      ) {
        for (const item of existOrder.orderItems) {
          const adjustment =
            newStatus === OrderStatus.Completed
              ? -item.quantity
              : item.quantity;

          await sequelize.query(
            'UPDATE products SET "stockQuantity" = "stockQuantity" + :adjustment WHERE id = :productId',
            {
              replacements: { adjustment, productId: item.productId },
              type: QueryTypes.UPDATE,
              transaction,
            },
          );
        }
      }

      const [updateOrders] = await sequelize.query(
        "UPDATE orders SET status = :status WHERE id = :orderId RETURNING *",
        {
          replacements: { status: newStatus, orderId },
          type: QueryTypes.UPDATE,
          transaction,
        },
      );

      if (
        !updateOrders ||
        !Array.isArray(updateOrders) ||
        typeof updateOrders[0] !== "object"
      ) {
        throw new Error("Оновлення статусу замовлення не вдалося.");
      }

      await transaction.commit();
      return updateOrders[0];
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
}
