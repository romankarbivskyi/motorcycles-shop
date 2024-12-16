import { sequelize } from "../config/database";
import { QueryTypes } from "sequelize";
import { ApiError } from "../utils/ApiError";
import { Category } from "../types/models.types";

export class CategoryService {
  static async getCategories(categoryId?: number) {
    const categories = await sequelize.query(
      `SELECT * FROM categories ${categoryId && `WHERE id=${categoryId}`}`,
      {
        type: QueryTypes.SELECT,
      },
    );

    if (categories.length == 0) {
      throw ApiError.NotFound("Categories not found");
    }

    return categories;
  }

  static async createCategory({
    name,
    description,
  }: Category): Promise<Category> {
    const newCategory = (
      (await sequelize.query(
        "INSERT INTO categories (name, description) VALUES (:name, :description) RETURNING *",
        {
          replacements: {
            name,
            description,
          },
          type: QueryTypes.INSERT,
        },
      )) as any
    )[0][0] as Category;

    return newCategory;
  }

  static async updateCategory({ id, name, description }: Category) {
    await this.getCategories(id);

    const updatedCategory = await sequelize.query(
      "UPDATE categories SET name = :name, description = :description WHERE id = :id RETURNING *",
      {
        replacements: {
          id,
          name,
          description,
        },
        type: QueryTypes.UPDATE,
      },
    );

    return (updatedCategory as any)[0][0];
  }

  static async deleteCategory(id: number) {
    await this.getCategories(id);

    await sequelize.query("DELETE FROM categories WHERE id = :id", {
      replacements: { id },
      type: QueryTypes.DELETE,
    });
  }
}
