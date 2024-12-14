import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/user.service";
import { ApiError } from "../utils/ApiError";
import { UserRole } from "../types/models.types";

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

      if (
        userId &&
        (req as any).user.id !== userId &&
        (req as any).user.role !== UserRole.Admin
      ) {
        throw ApiError.Forbidden();
      }

      const users = await UserService.getUsers(userId);

      if (users.length > 1) {
        res.status(200).json(users);
        return;
      }
      res.status(200).json(users[0]);
    } catch (err) {
      next(err);
    }
  }
}
