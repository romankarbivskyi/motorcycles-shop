import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/user.service";
import { ApiError } from "../utils/ApiError";
import { UserRole } from "../types/models.types";
import { sequelize } from "../config/database";
import { QueryTypes } from "sequelize";

export class UserController {
  static async registerUser(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const newUser = await UserService.registerUser(data);

      res.status(200).json(newUser);
    } catch (err) {
      next(err);
    }
  }

  static async loginUser(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const { user, accessToken } = await UserService.loginUser(data);

      res.status(200).json({ user, accessToken });
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

      if (users.length > 1) {
        res.status(200).json(users);
        return;
      }
      res.status(200).json(users[0]);
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
}
