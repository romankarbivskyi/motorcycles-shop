import { Router } from "express";
import { ReviewController } from "../controllers/review.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { checkSchema } from "express-validator";
import { validateMiddleware } from "../middlewares/validate.middleware";

const router = Router();

router.get("/", authMiddleware(true), ReviewController.getReviews);
router.get("/:reviewId", ReviewController.getReviews);
router.get("/product/:productId", ReviewController.getReviews);
router.post(
  "/create",
  checkSchema({
    userId: { notEmpty: true, isInt: true },
    productId: { notEmpty: true, isInt: true },
    rating: {
      isInt: {
        options: {
          min: 1,
          max: 5,
        },
        errorMessage: "Rating should be between 1 and 5",
      },
    },
  }),
  validateMiddleware,
  authMiddleware(),
  ReviewController.createReview,
);
router.put(
  "/update",
  checkSchema({
    id: { isInt: true },
    rating: {
      isInt: {
        options: {
          min: 1,
          max: 5,
        },
        errorMessage: "Rating should be between 1 and 5",
      },
    },
  }),
  validateMiddleware,
  authMiddleware(),
  ReviewController.updateReview,
);
router.delete(
  "/delete/:reviewId",
  authMiddleware(),
  ReviewController.deleteReview,
);

export default router;
