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
import { CategoryService } from "./category.service";

export class ProductService {
  static async getProducts({
    productId,
    search,
    categoryId,
    offset,
    limit,
    sortByPrice,
    priceMin,
    priceMax,
    yearMin,
    yearMax,
  }: GetProductArgs): Promise<Product[]> {
    const whereConditions: string[] = [];
    const replacements: Record<string, any> = {};

    if (productId) {
      whereConditions.push(`p."id" = :productId`);
      replacements.productId = productId;
    }

    if (categoryId) {
      whereConditions.push(`p."categoryId" = :categoryId`);
      replacements.categoryId = categoryId;
    }

    if (search) {
      whereConditions.push(
        `(p."make" ILIKE :search OR p."model" ILIKE :search)`,
      );
      replacements.search = `%${search}%`;
    }

    if (priceMin !== undefined && Number.isFinite(priceMin)) {
      whereConditions.push(`p."price" >= :priceMin`);
      replacements.priceMin = priceMin;
    }

    if (priceMax !== undefined && Number.isFinite(priceMax)) {
      whereConditions.push(`p."price" <= :priceMax`);
      replacements.priceMax = priceMax;
    }

    if (yearMin !== undefined && Number.isFinite(yearMin)) {
      whereConditions.push(`p."year" >= :yearMin`);
      replacements.yearMin = yearMin;
    }

    if (yearMax !== undefined && Number.isFinite(yearMax)) {
      whereConditions.push(`p."year" <= :yearMax`);
      replacements.yearMax = yearMax;
    }

    if (limit !== undefined) {
      replacements.limit = limit;
    }

    if (offset !== undefined) {
      replacements.offset = offset;
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    const products = await sequelize.query(
      `
      SELECT 
          p.*, 
          c.name AS "categoryName",
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
      LEFT JOIN "categories" c ON p."categoryId" = c.id
      ${whereClause}
      GROUP BY p."id", c."name"
      ${sortByPrice ? `ORDER BY p."price" ${sortByPrice === "expensive" ? "DESC" : "ASC"}` : ""}
      ${limit ? "LIMIT :limit" : ""}
      ${offset ? "OFFSET :offset" : ""}
    `,
      {
        replacements,
        type: QueryTypes.SELECT,
      },
    );

    return products as Product[];
  }

  static async getProductCount(
    categoryId?: number,
    search?: string,
  ): Promise<number> {
    const [res] = (await sequelize.query(
      `
      SELECT COUNT(*) FROM products p
      ${categoryId ? 'WHERE "categoryId" = :categoryId' : ""}
      ${search ? `${categoryId ? "AND" : "WHERE"} (p.make ILIKE :search OR p.model ILIKE :search)` : ""}
    `,
      {
        replacements: { categoryId, search: `%${search}%` },
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
      throw ApiError.BadRequest("Зображення повинні бути масивом");
    if (attributes && !Array.isArray(attributes))
      throw ApiError.BadRequest("Атрибути повинні бути масивом");

    const existCategory = await CategoryService.getCategories({ categoryId });
    if (!existCategory.length) {
      throw ApiError.NotFound("Категорію не знайдено");
    }

    const transaction = await sequelize.transaction();
    try {
      const [newProducts] = await sequelize.query(
        `INSERT INTO products (make, model, year, price, description, "stockQuantity", "categoryId", "createAt") 
   VALUES (:make, :model, :year, :price, :description, :stockQuantity, :categoryId, :createAt) 
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
            createAt: new Date(Date.now()).toUTCString(),
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
        throw new Error("Не вдалося створити продукт");
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
    productId,
    product: {
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
      throw ApiError.BadRequest("Зображення повинні бути масивом");
    if (deleteImages && !Array.isArray(deleteImages))
      throw ApiError.BadRequest("DeleteImages повинні бути масивом");
    if (attributes && !Array.isArray(attributes))
      throw ApiError.BadRequest("Атрибути повинні бути масивом");
    if (deleteAttributes && !Array.isArray(deleteAttributes))
      throw ApiError.BadRequest("DeleteAttributes повинні бути масивом");

    const existCategory = await CategoryService.getCategories({ categoryId });
    if (!existCategory.length) {
      throw ApiError.NotFound("Категорію не знайдено");
    }

    const transaction = await sequelize.transaction();
    try {
      const existProducts = await this.getProducts({ productId });

      if (!existProducts.length) {
        throw ApiError.NotFound("Продукти не знайдені");
      }

      const [updatedProducts] = await sequelize.query(
        `UPDATE products 
       SET make = :make, model = :model, year = :year, price = :price, 
           description = :description, "stockQuantity" = :stockQuantity, 
           "categoryId" = :categoryId
       WHERE id = :productId 
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
            productId,
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
        throw new Error("Не вдалося оновити продукт");
      }

      const updatedProduct = updatedProducts[0] as Product;

      if (deleteAttributes) {
        for (const attributeName of deleteAttributes) {
          await sequelize.query(
            'DELETE FROM attributes WHERE name = :name AND "productId" = :productId',
            {
              replacements: { name: attributeName, productId },
              type: QueryTypes.DELETE,
              transaction,
            },
          );
        }
      }

      if (attributes) {
        for (const attribute of attributes) {
          const { name, value } =
            typeof attribute === "string" ? JSON.parse(attribute) : attribute;

          const existingAttribute = await sequelize.query(
            'SELECT id FROM attributes WHERE name = :name AND "productId" = :productId',
            {
              replacements: { name, productId },
              type: QueryTypes.SELECT,
              transaction,
            },
          );

          if (existingAttribute.length > 0) {
            await sequelize.query(
              'UPDATE attributes SET value = :value WHERE name = :name AND "productId" = :productId',
              {
                replacements: { name, value, productId },
                type: QueryTypes.UPDATE,
                transaction,
              },
            );
          } else {
            await sequelize.query(
              'INSERT INTO attributes (name, value, "productId") VALUES (:name, :value, :productId)',
              {
                replacements: { name, value, productId },
                type: QueryTypes.INSERT,
                transaction,
              },
            );
          }
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
            console.error("Не вдалося видалити файл:", url, err);
          }
        }
      }

      if (images) {
        for (const url of images) {
          await sequelize.query(
            'INSERT INTO images (url, "productId") VALUES (:url, :productId)',
            {
              type: QueryTypes.INSERT,
              replacements: {
                url,
                productId,
              },
              transaction,
            },
          );
        }
      }

      await transaction.commit();
      return (
        await this.getProducts({
          productId,
        })
      )[0];
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  static async deleteProduct(productId: number): Promise<void> {
    const existingProduct = await this.getProducts({ productId });

    if (!existingProduct.length) {
      throw ApiError.NotFound("Продукти не знайдені");
    }

    const orderExists = await sequelize.query(
      'SELECT * FROM "orderItems" WHERE "productId" = :productId LIMIT 1',
      {
        replacements: { productId },
        type: QueryTypes.SELECT,
      },
    );

    if (orderExists.length) {
      throw ApiError.BadRequest("З таким продуктом існує замовлення");
    }

    const transaction = await sequelize.transaction();
    try {
      await sequelize.query(
        'DELETE FROM images WHERE "productId" = :productId',
        {
          replacements: { productId },
          type: QueryTypes.DELETE,
          transaction,
        },
      );

      await sequelize.query(
        'DELETE FROM attributes WHERE "productId" = :productId',
        {
          replacements: { productId },
          type: QueryTypes.DELETE,
          transaction,
        },
      );

      await sequelize.query("DELETE FROM products WHERE id = :productId", {
        replacements: { productId },
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
