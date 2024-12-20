import { sequelize } from "../config/database";
import bcrypt from "bcrypt";
import { QueryTypes } from "sequelize";
import { User } from "../types/models.types";
import { ApiError } from "../utils/ApiError";
import { TokenService } from "./token.service";

export class UserService {
  static async getUsers({
    userId,
    limit,
    offset,
  }: {
    userId?: number;
    limit?: number;
    offset?: number;
  }): Promise<Omit<User, "password">[]> {
    const users = await sequelize.query(
      `
        SELECT id, "firstName", "lastName", phone, email, role FROM users 
        ${userId ? `WHERE id = :userId` : ""}
        ${limit ? "LIMIT :limit" : ""}
        ${offset ? "OFFSET :offset" : ""}
        `,
      {
        replacements: { userId, limit, offset },
        type: QueryTypes.SELECT,
      },
    );

    return users as Omit<User, "password">[];
  }

  static async registerUser({
    firstName,
    lastName,
    phone,
    email,
    password,
  }: Omit<User, "id">) {
    const existUser = (
      await sequelize.query("SELECT * FROM users WHERE email = :email", {
        replacements: { email },
        type: QueryTypes.SELECT,
      })
    )[0] as User;

    if (existUser) throw ApiError.BadRequest("User already exists");

    const hashPassword = await bcrypt.hash(password, 12);

    const transaction = await sequelize.transaction();
    try {
      const [newUsers] = await sequelize.query(
        'INSERT INTO users ("firstName", "lastName", phone, email, password) VALUES (:firstName, :lastName, :phone, :email, :password) RETURNING *',
        {
          replacements: {
            firstName,
            lastName,
            phone,
            email,
            password: hashPassword,
          },
        },
      );

      if (
        !newUsers ||
        !Array.isArray(newUsers) ||
        typeof newUsers[0] !== "object"
      ) {
        throw new Error("User register failed.");
      }

      const newUser = newUsers[0] as User;

      const accessToken = TokenService.generateAccessToken({
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phone: newUser.phone,
        email: newUser.email,
        role: newUser.role,
      });

      await transaction.commit();
      return {
        user: {
          id: newUser.id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          phone: newUser.phone,
          email: newUser.email,
          role: newUser.role,
        },
        accessToken: accessToken,
      };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  static async loginUser({
    email,
    password,
  }: Pick<User, "email" | "password">) {
    const existUser = (
      await sequelize.query("SELECT * FROM users WHERE email = :email", {
        replacements: { email },
        type: QueryTypes.SELECT,
      })
    )[0] as User;

    if (!existUser) throw ApiError.NotFound("User not found");

    const isValid = await bcrypt.compare(password, existUser.password!);

    if (!isValid) throw ApiError.Unauthorized();

    const accessToken = TokenService.generateAccessToken({
      id: existUser.id,
      firstName: existUser.firstName,
      lastName: existUser.lastName,
      phone: existUser.phone,
      email: existUser.email,
      role: existUser.role,
    });

    return {
      user: {
        id: existUser.id,
        firstName: existUser.firstName,
        lastName: existUser.lastName,
        phone: existUser.phone,
        email: existUser.email,
        role: existUser.role,
      },
      accessToken: accessToken,
    };
  }

  static async getUserCount(): Promise<number> {
    const [res] = (await sequelize.query(`SELECT COUNT(*) FROM users`, {
      type: QueryTypes.SELECT,
    })) as any;

    return parseInt(res.count);
  }
}
