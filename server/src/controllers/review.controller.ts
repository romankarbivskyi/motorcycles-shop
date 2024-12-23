import { Request, Response, NextFunction } from "express";
import { ReviewService } from "../services/review.service";
import { ApiError } from "../utils/ApiError";

export class ReviewController {
  static async getReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const reviewId = parseInt(req.params.reviewId);
      const productId = parseInt(req.params.productId);
      const limit = parseInt(req.query.limit as string);
      const offset = parseInt(req.query.offset as string);

      const reviews = await ReviewService.getReviews({
        reviewId,
        productId,
        limit,
        offset,
      });

      if (reviewId) {
        const review = reviews[0];
        res.status(200).json(review);
        return;
      }

      res.status(200).json(reviews);
    } catch (err) {
      next(err);
    }
  }

  static async getReviewCount(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = parseInt(req.params.productId);
      const count = await ReviewService.getReviewCount(productId);

      res.status(200).json(count);
    } catch (err) {
      next(err);
    }
  }

  static async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      if ((req as any).user.id != data.userId) throw ApiError.Forbidden();

      const newReview = await ReviewService.createReview(data);

      res.status(200).json(newReview);
    } catch (err) {
      next(err);
    }
  }

  static async updateReview(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const userId = (req as any).user.id;
      const reviewId = parseInt(req.params.reviewId);
      const updateReview = await ReviewService.updateReview(
        reviewId,
        data,
        userId,
      );

      res.status(200).json(updateReview);
    } catch (err) {
      next(err);
    }
  }

  static async deleteReview(req: Request, res: Response, next: NextFunction) {
    try {
      const reviewId = parseInt(req.params.reviewId);
      const userId = (req as any).user.id;
      await ReviewService.deleteReview(reviewId, userId);

      res.status(200).json({
        message: "Review deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  }
}
