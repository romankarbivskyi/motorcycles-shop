import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/user.service";
import { ApiError } from "../utils/ApiError";
import { UserRole } from "../types/models.types";

export class UserController {
  static async registerUser(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const { user, token } = await UserService.registerUser(data);

      res.status(200).json({ user, token });
    } catch (err) {
      next(err);
    }
  }

  static async loginUser(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const { user, token } = await UserService.loginUser(data);

      res.status(200).json({ user, token });
    } catch (err) {
      next(err);
    }
  }

  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.userId);

      const limit: number | undefined = req.query.limit
        ? parseInt(req.query.limit as string)
        : undefined;
      const offset: number | undefined = req.query.offset
        ? parseInt(req.query.offset as string)
        : undefined;

      if (
        userId &&
        (req as any).user.id !== userId &&
        (req as any).user.role !== UserRole.Admin
      ) {
        throw ApiError.Forbidden();
      }

      const users = await UserService.getUsers({ userId, limit, offset });

      if (userId) {
        res.status(200).json(users[0]);
        return;
      }
      res.status(200).json(users);
    } catch (err) {
      next(err);
    }
  }

  static async getUserCount(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await UserService.getUserCount();

      res.status(200).json(count);
    } catch (err) {
      next(err);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.userId);
      const isAdmin = (req as any).user.role == UserRole.Admin;
      const isOwner = (req as any).user.id == userId;

      if (!isAdmin && !isOwner) {
        throw ApiError.Forbidden();
      }

      const data = req.body;
      const { user, token } = await UserService.updateUser(userId, data);
      res.status(200).json({ user, token });
    } catch (err) {
      next(err);
    }
  }
}
