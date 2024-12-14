import { sequelize } from "../config/database";
import { QueryTypes } from "sequelize";
import { ApiError } from "../utils/ApiError";
import { CreateProductArgs, UpdateProductArgs } from "../types/product.types";
import { Product } from "../types/models.types";
import fs from "fs";

export class ProductService {
  static async getProducts(productId?: number) {
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
        GROUP BY p."id"
        `,
      {
        replacements: productId ? { productId } : undefined,
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
  }: CreateProductArgs) {
    const [newProduct] = await sequelize.query(
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
      },
    );

    if (images && images.length > 0) {
      for (const url of images) {
        await sequelize.query(
          'INSERT INTO images (url, "productId") VALUES (:url, :productId)',
          {
            type: QueryTypes.INSERT,
            replacements: {
              url,
              productId: (newProduct as any)[0].id,
            },
          },
        );
      }
    }

    if (attributes && attributes.length > 0) {
      for (const attribute of attributes) {
        const { name, value } = JSON.parse(attribute);
        await sequelize.query(
          'INSERT INTO attributes (name, value, "productId") VALUES (:name, :value, :productId)',
          {
            replacements: {
              name,
              value,
              productId: (newProduct as any)[0].id,
            },
            type: QueryTypes.INSERT,
          },
        );
      }
    }

    return (newProduct as any)[0];
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
  }: UpdateProductArgs) {
    const products = (await this.getProducts(id)) as Product[];

    const existProduct = products[0];

    if (deleteImages) {
      console.log(deleteImages);
      for (const url of deleteImages) {
        console.log("Deleting", url);
        await sequelize.query("DELETE FROM images WHERE url = :url", {
          type: QueryTypes.DELETE,
          replacements: {
            url: url,
          },
        });
        fs.unlinkSync(__dirname + "./../../uploads/" + url);
      }
    }

    const [updateProduct] = await sequelize.query(
      `UPDATE products 
   SET make = :make, model = :model, year = :year, price = :price, description = :description, "stockQuantity" = :stockQuantity, "categoryId" = :categoryId
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
          id: id ?? null,
        },
        type: QueryTypes.UPDATE,
      },
    );

    if (deleteAttributes) {
      for (const id of deleteAttributes) {
        await sequelize.query("DELETE FROM attributes WHERE id = :id", {
          replacements: { id },
          type: QueryTypes.DELETE,
        });
      }
    }

    if (attributes && attributes.length > 0) {
      for (const attribute of attributes) {
        const { name, value } = JSON.parse(attribute);
        await sequelize.query(
          'INSERT INTO attributes (name, value, "productId") VALUES (:name, :value, :productId)',
          {
            replacements: { name, value, productId: existProduct.id },
            type: QueryTypes.INSERT,
          },
        );
      }
    }

    if (images && images.length > 0) {
      for (const url of images) {
        await sequelize.query(
          'INSERT INTO images (url, "productId") VALUES(:url, :productId)',
          {
            type: QueryTypes.INSERT,
            replacements: {
              url,
              productId: (updateProduct as any)[0].id,
            },
          },
        );
      }
    }

    return (updateProduct as any)[0];
  }

  static async deleteProduct(id: number) {
    await this.getProducts(id);

    await sequelize.query("DELETE FROM products WHERE id = :id", {
      replacements: { id },
      type: QueryTypes.DELETE,
    });
  }
}
