import { LogUser, RegUser } from "../types/user.types";
import { sequelize } from "../config/database";
import bcrypt from "bcrypt";
import { QueryTypes } from "sequelize";
import { User } from "../types/models.types";
import { ApiError } from "../utils/ApiError";
import { TokenService } from "./token.service";

export class UserService {
  static async registerUser({
    firstName,
    lastName,
    phone,
    email,
    password,
  }: RegUser) {
    const existUser = (
      await sequelize.query("SELECT * FROM users WHERE email = :email", {
        replacements: { email },
        type: QueryTypes.SELECT,
      })
    )[0] as User;

    if (existUser) throw ApiError.BadRequest("User already exists");

    const hashPassword = await bcrypt.hash(password, 12);

    const newUser = (
      await sequelize.query(
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
      )
    )[0][0] as User;

    const accessToken = TokenService.generateAccessToken({
      id: newUser.id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      phone: newUser.phone,
      email: newUser.email,
      role: newUser.role,
    });

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
  }

  static async loginUser({ email, password }: LogUser) {
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

  static async getUsers(userId?: number) {
    const users = (await sequelize.query(
      `SELECT id, "firstName", "lastName", phone, email, role FROM users ${userId ? `WHERE id = ${userId}` : ""}`,
      {
        type: QueryTypes.SELECT,
      },
    )) as User[];

    if (users.length == 0) throw ApiError.NotFound("Users not found");

    return users;
  }
}
