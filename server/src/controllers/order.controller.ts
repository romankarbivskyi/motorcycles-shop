import { Request, Response, NextFunction } from "express";
import { OrderService } from "../services/order.service";
import { ApiError } from "../utils/ApiError";
import { OrderStatus, UserRole } from "../types/models.types";

export class OrderController {
  static async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = parseInt(req.params.orderId);
      const userId = parseInt(req.params.userId);
      const limit = parseInt(req.query.limit as string);
      const offset = parseInt(req.query.offset as string);

      if (
        userId &&
        (req as any).user.role != UserRole.Admin &&
        (req as any).user.id != userId
      )
        throw ApiError.Forbidden();

      const orders = await OrderService.getOrders({
        userId,
        orderId,
        limit,
        offset,
      });

      if (orderId) {
        const order = orders[0];
        console.log((req as any).user.role != UserRole.Admin);
        if (
          (req as any).user.role != UserRole.Admin &&
          (req as any).user.id != order.userId
        ) {
          throw ApiError.Forbidden();
        }

        res.status(200).json(orders);
        return;
      }
      res.status(200).json(orders);
    } catch (err) {
      next(err);
    }
  }

  static async getOrderCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.query.userId as string);
      const count = await OrderService.getOrderCount(userId);

      res.status(200).json(count);
    } catch (err) {
      next(err);
    }
  }

  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      if ((req as any).user.id != data.userId) throw ApiError.Forbidden();

      const newOrder = await OrderService.createOrder(data);

      res.status(200).json(newOrder);
    } catch (err) {
      next(err);
    }
  }

  static async deleteOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = parseInt(req.params.orderId);
      const userId = (req as any).user.id as number;

      await OrderService.deleteOrder(orderId, userId);

      res.status(200).json({
        message: "Замовлення видалено успішно",
      });
    } catch (err) {
      next(err);
    }
  }

  static async changeStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = parseInt(req.params.orderId);
      const data = req.body.status as OrderStatus;

      const updateOrder = await OrderService.changeStatus(orderId, data);

      res.status(200).json({ updateOrder });
    } catch (err) {
      next(err);
    }
  }
}
