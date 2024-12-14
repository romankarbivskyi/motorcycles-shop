import { Request, Response, NextFunction } from "express";
import { TokenService } from "../services/token.service";
import { ApiError } from "../utils/ApiError";
import { UserRole } from "../types/models.types";

export const authMiddleware = (onlyAdmin?: boolean) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw ApiError.Unauthorized();
    }

    const accessToken = authHeader.split(" ")[1];
    const user = TokenService.validateToken(accessToken);

    if (onlyAdmin && user.role !== UserRole.Admin) {
      throw ApiError.Forbidden();
    }

    (req as any).user = user;
    next();
  };
};
