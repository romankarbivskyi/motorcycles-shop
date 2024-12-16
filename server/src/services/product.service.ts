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
      ${
        search
          ? `WHERE p.make ILIKE :search OR p.model ILIKE :search`
          : search && productId
            ? `AND (p.make ILIKE :search OR p.model ILIKE :search)`
            : ""
      }
      GROUP BY p."id"
    `,
      {
        replacements: {
          productId,
          search: `%${search}%`,
        },
        type: QueryTypes.SELECT,
      },
    );

    if (!products.length) {
      throw ApiError.NotFound("Products not found");
    }

    return products as Product[];
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
      const newProduct = (
        (await sequelize.query(
          `INSERT INTO products (make, model, year, price, description, "stockQuantity", "categoryId") 
   VALUES (:make, :model, :year, :price, :description, :stockQuantity, :categoryId) 
   RETURNING *`,
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
        )) as any
      )[0][0] as Product;

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
      return newProduct;
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
      await this.getProducts({ productId: id });

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

      const updatedProduct = (
        await sequelize.query(
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
        )
      )?.[0]?.[0] as unknown as Product;

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
      return updatedProduct;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async deleteProduct(id: number) {
    await this.getProducts({ productId: id });

    await sequelize.query("DELETE FROM products WHERE id = :id", {
      replacements: { id },
      type: QueryTypes.DELETE,
    });
  }
}
