import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError";

export const validateMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      throw ApiError.BadRequest(JSON.stringify(errors.array()));
    next();
  } catch (err) {
    next(err);
  }
};
