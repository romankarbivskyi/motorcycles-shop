import jwt, { JwtPayload } from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";
import { User } from "../types/models.types";

export class TokenService {
  static generateAccessToken(tokenPayload: User) {
    return jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
        data: tokenPayload,
      },
      process.env.JWT_SECRET as string,
    );
  }

  static validateToken(accessToken: string) {
    try {
      const { data } = jwt.verify(
        accessToken,
        process.env.JWT_SECRET as string,
      ) as JwtPayload;

      return data;
    } catch (err) {
      throw ApiError.Unauthorized();
    }
  }
}
