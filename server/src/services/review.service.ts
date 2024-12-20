import { sequelize } from "../config/database";
import { QueryTypes } from "sequelize";
import { Review } from "../types/models.types";
import { ApiError } from "../utils/ApiError";

export class ReviewService {
  static async getReviews({
    reviewId,
    productId,
    offset,
    limit,
  }: {
    reviewId?: number;
    productId?: number;
    offset?: number;
    limit?: number;
  }): Promise<Review[]> {
    const reviews = await sequelize.query(
      `
    SELECT * FROM reviews
    ${reviewId ? "WHERE id = :reviewId" : ""}
    ${productId ? 'WHERE "productId" = :productId' : ""}
    ${limit ? "LIMIT :limit" : ""}
    ${offset ? "OFFSET :offset" : ""}
    `,
      {
        replacements: { reviewId, productId, limit, offset },
        type: QueryTypes.SELECT,
      },
    );

    return reviews as Review[];
  }

  static async getReviewCount(productId?: number, userId?: number) {
    const [res] = (await sequelize.query(
      `
        SELECT COUNT(*) FROM reviews
        ${productId ? 'WHERE "productId" = :productId' : ""}
        ${userId ? 'WHERE "userId" = :userId' : ""}
        `,
      {
        replacements: {
          productId,
          userId,
        },
        type: QueryTypes.SELECT,
      },
    )) as any;

    return parseInt(res.count);
  }

  static async createReview({
    userId,
    productId,
    rating,
    comment,
  }: Omit<Review, "id" | "createAt" | "updateAt">): Promise<Review> {
    const transaction = await sequelize.transaction();
    try {
      const [newReviews] = await sequelize.query(
        `
    INSERT INTO reviews ("userId", "productId", rating, comment)
    VALUES(:userId, :productId, :rating, :comment) RETURNING *
    `,
        {
          replacements: {
            userId,
            productId,
            rating,
            comment,
          },
          type: QueryTypes.INSERT,
          transaction,
        },
      );

      if (
        !newReviews ||
        !Array.isArray(newReviews) ||
        typeof newReviews[0] !== "object"
      ) {
        throw new Error("Review creation failed.");
      }

      await transaction.commit();
      return newReviews[0] as Review;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  static async updateReview(
    { id, rating, comment }: Pick<Review, "id" | "rating" | "comment">,
    userId: number,
  ): Promise<Review> {
    const reviews = await this.getReviews({ reviewId: id });
    if (!reviews.length) throw ApiError.NotFound("Reviews not found");

    const existReview = reviews?.[0] as Review;
    if (existReview.userId != userId) throw ApiError.Forbidden();

    const transaction = await sequelize.transaction();
    try {
      const [updateReviews] = await sequelize.query(
        `
    UPDATE reviews SET rating = :rating, comment = :comment, "updateAt" = :updateAt WHERE id = :id RETURNING *
    `,
        {
          replacements: {
            rating,
            comment,
            updateAt: Date.now(),
            id,
          },
          type: QueryTypes.UPDATE,
          transaction,
        },
      );

      if (
        !updateReviews ||
        !Array.isArray(updateReviews) ||
        typeof updateReviews[0] !== "object"
      ) {
        throw new Error("Review update failed.");
      }

      await transaction.commit();
      return updateReviews[0] as Review;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  static async deleteReview(id: number, userId: number) {
    const reviews = await this.getReviews({ reviewId: id });
    if (!reviews.length) throw ApiError.NotFound("Reviews not found");

    const existReview = reviews?.[0] as Review;
    if (existReview.userId != userId) throw ApiError.Forbidden();

    const transaction = await sequelize.transaction();
    try {
      await sequelize.query("DELETE FROM reviews WHERE id = :id", {
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
