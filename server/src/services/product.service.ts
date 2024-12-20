import { sequelize } from "../config/database";
import { QueryTypes } from "sequelize";
import { ApiError } from "../utils/ApiError";
import {
  CreateProductArgs,
  GetProductArgs,
  UpdateProductArgs,
} from "../types/product.types";
import { Product } from "../types/models.types";
import fs from "fs";
import path from "path";

export class ProductService {
  static async getProducts({
    productId,
    search,
    categoryId,
    offset,
    limit,
  }: GetProductArgs): Promise<Product[]> {
    console.log(search);
    const products = await sequelize.query(
      `
      SELECT 
          p.*, 
          COALESCE(
              json_agg(DISTINCT CASE WHEN a."id" IS NOT NULL THEN jsonb_build_object('id', a."id", 'name', a."name", 'value', a."value") END) 
              FILTER (WHERE a."id" IS NOT NULL), 
              '[]'::json
          ) AS attributes,
          COALESCE(
              json_agg(DISTINCT CASE WHEN i."id" IS NOT NULL THEN jsonb_build_object('id', i."id", 'url', i."url") END) 
              FILTER (WHERE i."id" IS NOT NULL), 
              '[]'::json
          ) AS images
      FROM "products" p
      LEFT JOIN "attributes" a ON a."productId" = p."id"
      LEFT JOIN "images" i ON i."productId" = p."id"
      ${productId ? `WHERE p."id" = :productId` : ""}
      ${search ? `WHERE p.make ILIKE :search OR p.model ILIKE :search` : ""}
      ${categoryId ? `WHERE p."categoryId" = :categoryId` : ""}
      GROUP BY p."id"
      ${limit ? "LIMIT :limit" : ""}
      ${offset ? "OFFSET :offset" : ""}
    `,
      {
        replacements: {
          productId,
          search: `%${search}%`,
          categoryId,
          limit,
          offset,
        },
        type: QueryTypes.SELECT,
      },
    );

    return products as Product[];
  }

  static async getProductCount(categoryId?: number): Promise<number> {
    const [res] = (await sequelize.query(
      `
SELECT COUNT(*) FROM products
${categoryId ? 'WHERE "categoryId" = :categoryId' : ""}
`,
      {
        replacements: { categoryId },
        type: QueryTypes.SELECT,
      },
    )) as any;

    return parseInt(res.count);
  }

  static async createProduct({
    product: {
      make,
      categoryId,
      description,
      stockQuantity,
      price,
      year,
      model,
      attributes,
    },
    images,
  }: CreateProductArgs): Promise<Product> {
    if (images && !Array.isArray(images))
      throw ApiError.BadRequest("Images should be an array");
    if (attributes && !Array.isArray(attributes))
      throw ApiError.BadRequest("Attributes should be an array");

    const transaction = await sequelize.transaction();
    try {
      const [newProducts] = await sequelize.query(
        `INSERT INTO products (make, model, year, price, description, "stockQuantity", "categoryId") 
   VALUES (:make, :model, :year, :price, :description, :stockQuantity, :categoryId) 
   RETURNING * `,
        {
          replacements: {
            make,
            model,
            year,
            price,
            description,
            stockQuantity: stockQuantity ?? 0,
            categoryId,
          },
          type: QueryTypes.INSERT,
          transaction,
        },
      );

      if (
        !newProducts ||
        !Array.isArray(newProducts) ||
        newProducts.length == 0
      ) {
        throw new Error("Product creation failed");
      }

      const newProduct = newProducts[0] as Product;

      if (images) {
        for (const url of images) {
          await sequelize.query(
            'INSERT INTO images (url, "productId") VALUES (:url, :productId)',
            {
              type: QueryTypes.INSERT,
              replacements: {
                url,
                productId: newProduct.id,
              },
              transaction,
            },
          );
        }
      }

      if (attributes) {
        for (const attribute of attributes) {
          const { name, value } =
            typeof attribute === "string" ? JSON.parse(attribute) : attribute;
          await sequelize.query(
            'INSERT INTO attributes (name, value, "productId") VALUES (:name, :value, :productId)',
            {
              replacements: {
                name,
                value,
                productId: newProduct.id,
              },
              type: QueryTypes.INSERT,
              transaction,
            },
          );
        }
      }

      await transaction.commit();
      return (
        await this.getProducts({
          productId: newProduct.id,
        })
      )[0];
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  static async updateProduct({
    product: {
      id,
      attributes,
      model,
      make,
      year,
      price,
      categoryId,
      description,
      stockQuantity,
      deleteImages,
      deleteAttributes,
    },
    images,
  }: UpdateProductArgs): Promise<Product> {
    if (images && !Array.isArray(images))
      throw ApiError.BadRequest("Images should be an array");
    if (deleteImages && !Array.isArray(deleteImages))
      throw ApiError.BadRequest("DeleteImages should be an array");
    if (attributes && !Array.isArray(attributes))
      throw ApiError.BadRequest("Attributes should be an array");
    if (deleteAttributes && !Array.isArray(deleteAttributes))
      throw ApiError.BadRequest("DeleteAttributes should be an array");

    const transaction = await sequelize.transaction();
    try {
      const existProducts = await this.getProducts({ productId: id });

      if (!existProducts.length) {
        throw ApiError.NotFound("Products not found");
      }

      const [updatedProducts] = await sequelize.query(
        `UPDATE products 
       SET make = :make, model = :model, year = :year, price = :price, 
           description = :description, "stockQuantity" = :stockQuantity, 
           "categoryId" = :categoryId
       WHERE id = :id 
       RETURNING *`,
        {
          replacements: {
            make: make ?? null,
            model: model ?? null,
            year: year ?? null,
            price: price ?? null,
            description: description ?? null,
            stockQuantity: stockQuantity ?? 0,
            categoryId: categoryId ?? null,
            id,
          },
          type: QueryTypes.UPDATE,
          transaction,
        },
      );

      if (
        !updatedProducts ||
        !Array.isArray(updatedProducts) ||
        typeof updatedProducts[0] !== "object"
      ) {
        throw new Error("Product update failed");
      }

      const updatedProduct = updatedProducts[0] as Product;

      if (deleteAttributes) {
        for (const attributeId of deleteAttributes) {
          await sequelize.query("DELETE FROM attributes WHERE id = :id", {
            replacements: { id: attributeId },
            type: QueryTypes.DELETE,
            transaction,
          });
        }
      }

      if (attributes) {
        for (const attribute of attributes) {
          const { name, value } =
            typeof attribute === "string" ? JSON.parse(attribute) : attribute;
          await sequelize.query(
            'INSERT INTO attributes (name, value, "productId") VALUES (:name, :value, :productId)',
            {
              replacements: { name, value, productId: updatedProduct.id },
              type: QueryTypes.INSERT,
              transaction,
            },
          );
        }
      }

      if (deleteImages) {
        for (const url of deleteImages) {
          await sequelize.query("DELETE FROM images WHERE url = :url", {
            type: QueryTypes.DELETE,
            replacements: { url },
            transaction,
          });
          try {
            await fs.promises.unlink(
              path.join(__dirname, "../../uploads", url),
            );
          } catch (err) {
            console.error("Failed to delete file:", url, err);
          }
        }
      }

      if (images) {
        for (const url of images) {
          await sequelize.query(
            'INSERT INTO images (url, "productId") VALUES(:url, :productId)',
            {
              replacements: { url, productId: updatedProduct.id },
              type: QueryTypes.INSERT,
              transaction,
            },
          );
        }
      }

      await transaction.commit();
      return (
        await this.getProducts({
          productId: updatedProduct.id,
        })
      )[0];
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async deleteProduct(id: number) {
    const existProducts = await this.getProducts({ productId: id });

    if (!existProducts.length) {
      throw ApiError.NotFound("Products not found");
    }

    const transaction = await sequelize.transaction();
    try {
      await sequelize.query("DELETE FROM products WHERE id = :id", {
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
