import { sequelize } from "../config/database";
import { QueryTypes } from "sequelize";
import { ApiError } from "../utils/ApiError";
import { Category } from "../types/models.types";

export class CategoryService {
  static async getCategories({
    categoryId,
    limit,
    offset,
  }: {
    categoryId?: number;
    limit?: number;
    offset?: number;
  }) {
    const categories = (await sequelize.query(
      `
          SELECT * FROM categories 
          ${categoryId ? `WHERE id = :categoryId` : ""}
          ${limit ? "LIMIT :limit" : ""}
          ${offset ? "OFFSET :offset" : ""}
      `,
      {
        replacements: { categoryId, limit, offset },
        type: QueryTypes.SELECT,
      },
    )) as Category[];

    return categories;
  }

  static async getCategoryCount(): Promise<number> {
    const [res] = (await sequelize.query(`SELECT COUNT(*) FROM categories`, {
      type: QueryTypes.SELECT,
    })) as any;

    return parseInt(res.count);
  }

  static async createCategory({
    name,
    description,
  }: Omit<Category, "id">): Promise<Category> {
    const transaction = await sequelize.transaction();
    try {
      const [newCategories] = await sequelize.query(
        "INSERT INTO categories (name, description) VALUES (:name, :description) RETURNING *",
        {
          replacements: {
            name,
            description,
          },
          type: QueryTypes.INSERT,
          transaction,
        },
      );

      if (
        !newCategories ||
        !Array.isArray(newCategories) ||
        typeof newCategories[0] !== "object"
      ) {
        throw new Error("Category creation failed");
      }

      await transaction.commit();
      return newCategories[0] as Category;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  static async updateCategory({ id, name, description }: Category) {
    const existCategories = await this.getCategories({ categoryId: id });

    if (!existCategories.length) {
      throw ApiError.NotFound("Categories not found");
    }

    const transaction = await sequelize.transaction();
    try {
      const [updatedCategories] = await sequelize.query(
        "UPDATE categories SET name = :name, description = :description WHERE id = :id RETURNING *",
        {
          replacements: {
            id,
            name,
            description,
          },
          type: QueryTypes.UPDATE,
          transaction,
        },
      );

      if (
        !updatedCategories ||
        !Array.isArray(updatedCategories) ||
        typeof updatedCategories[0] !== "object"
      ) {
        throw new Error("Category update failed");
      }

      await transaction.commit();
      return updatedCategories[0] as Category;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  static async deleteCategory(id: number) {
    const existCategories = await this.getCategories({ categoryId: id });

    if (!existCategories.length) {
      throw ApiError.NotFound("Categories not found");
    }

    const transaction = await sequelize.transaction();
    try {
      await sequelize.query("DELETE FROM categories WHERE id = :id", {
        replacements: { id },
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
