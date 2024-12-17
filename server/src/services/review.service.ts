import { CreateReview, UpdateReview } from "../types/review.types";
import { sequelize } from "../config/database";
import { QueryTypes } from "sequelize";
import { Review } from "../types/models.types";
import { ApiError } from "../utils/ApiError";

export class ReviewService {
  static async getReviews(
    reviewId?: number,
    productId?: number,
  ): Promise<Review[]> {
    const reviews = await sequelize.query(
      `
    SELECT * FROM reviews
    ${reviewId ? "WHERE id = :reviewId" : ""}
    ${productId ? 'WHERE "productId" = :productId' : ""}
    `,
      {
        replacements: { reviewId, productId },
        type: QueryTypes.SELECT,
      },
    );

    if (reviews.length == 0) throw ApiError.NotFound("Reviews not found");

    return reviews as Review[];
  }

  static async createReview({
    userId,
    productId,
    rating,
    comment,
  }: CreateReview) {
    const transaction = await sequelize.transaction();
    try {
      const newReview = (
        (await sequelize.query(
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
        )) as any
      )[0][0] as Review;

      await transaction.commit();
      return newReview;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  static async updateReview(
    { id, rating, comment }: UpdateReview,
    userId: number,
  ) {
    const reviews = await this.getReviews(id);
    const existReview = reviews?.[0] as Review;
    if (existReview.userId != userId) throw ApiError.Forbidden();

    const transaction = await sequelize.transaction();
    try {
      const updateReview = (
        (await sequelize.query(
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
        )) as any
      )[0][0] as Review;

      await transaction.commit();
      return updateReview;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  static async deleteReview(id: number, userId: number) {
    const reviews = await this.getReviews(id);
    const existReview = reviews?.[0] as Review;
    if (existReview.userId != userId) throw ApiError.Forbidden();

    await sequelize.query("DELETE FROM reviews WHERE id = :id", {
      replacements: { id },
      type: QueryTypes.DELETE,
    });
  }
}
