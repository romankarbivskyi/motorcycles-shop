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
      await sequelize.query(
        "SELECT * FROM users WHERE email = :email OR phone = :phone",
        {
          replacements: { email, phone },
          type: QueryTypes.SELECT,
        },
      )
    )[0] as User;

    if (existUser)
      throw ApiError.BadRequest(
        "Користувач з таким email або номером телефону вже існує",
      );

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
        throw ApiError.Unauthorized("Реєстрація користувача не вдалася.");
      }

      const newUser = newUsers[0] as User;

      const token = TokenService.generateAccessToken({
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
        token,
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

    console.log(existUser);

    if (!existUser) throw ApiError.NotFound("Користувача не знайдено");

    const isValid = await bcrypt.compare(password, existUser.password!);

    if (!isValid) throw ApiError.Unauthorized("Невірний пароль");

    const token = TokenService.generateAccessToken({
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
      token,
    };
  }

  static async getUserCount(): Promise<number> {
    const [res] = (await sequelize.query(`SELECT COUNT(*) FROM users`, {
      type: QueryTypes.SELECT,
    })) as any;

    return parseInt(res.count);
  }

  static async updateUser(userId: number, data: Partial<Omit<User, "id">>) {
    const { firstName, lastName, phone, email, password } = data;

    const existUser = (await this.getUsers({ userId }))[0];
    if (!existUser) throw ApiError.NotFound("Користувача не знайдено");

    const existUserEmailPhone = (
      await sequelize.query(
        "SELECT * FROM users WHERE id != :userId AND (phone = :phone OR email = :email)",
        {
          replacements: { phone, email, userId },
          type: QueryTypes.SELECT,
        },
      )
    )[0] as User;

    if (existUserEmailPhone) {
      throw ApiError.BadRequest(
        "Користувач з таким номером телефону або email вже існує",
      );
    }

    const hashPassword = password ? await bcrypt.hash(password, 12) : undefined;

    const updates: string[] = [];
    const replacements: Record<string, any> = { userId };

    if (firstName) {
      updates.push('"firstName" = :firstName');
      replacements.firstName = firstName;
    }
    if (lastName) {
      updates.push('"lastName" = :lastName');
      replacements.lastName = lastName;
    }
    if (phone) {
      updates.push("phone = :phone");
      replacements.phone = phone;
    }
    if (email) {
      updates.push("email = :email");
      replacements.email = email;
    }
    if (hashPassword) {
      updates.push("password = :password");
      replacements.password = hashPassword;
    }

    const query = `
    UPDATE users 
    SET ${updates.join(", ")} 
    WHERE id = :userId 
    RETURNING id, "firstName", "lastName", phone, email
  `;

    const transaction = await sequelize.transaction();
    try {
      const [updateUsers] = (await sequelize.query(query, {
        type: QueryTypes.UPDATE,
        replacements,
      })) as any;

      if (
        !updateUsers ||
        !Array.isArray(updateUsers) ||
        typeof updateUsers[0] !== "object"
      ) {
        throw new Error("Оновлення користувача не вдалося.");
      }

      await transaction.commit();
      const updateUser = updateUsers[0] as Omit<User, "password">;
      const token = TokenService.generateAccessToken(updateUser);
      return { user: updateUser, token };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  static async deleteUser(userId: number) {
    const existUser = await UserService.getUsers({ userId });
    if (!existUser.length) throw ApiError.NotFound("Користувача не знайдено");

    const transaction = await sequelize.transaction();
    try {
      await sequelize.query('DELETE FROM reviews WHERE "userId" = :userId', {
        replacements: { userId },
        type: QueryTypes.DELETE,
        transaction,
      });

      await sequelize.query('DELETE FROM orders WHERE "userId" = :userId', {
        replacements: { userId },
        type: QueryTypes.DELETE,
        transaction,
      });

      await sequelize.query("DELETE FROM users WHERE id = :userId", {
        replacements: { userId },
        type: QueryTypes.DELETE,
        transaction,
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
}
