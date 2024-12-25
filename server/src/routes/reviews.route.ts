import { Router } from "express";
import { ReviewController } from "../controllers/review.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { checkSchema, param } from "express-validator";
import { validateMiddleware } from "../middlewares/validate.middleware";

const router = Router();

router.get("/", authMiddleware(true), ReviewController.getReviews);
router.get("/count", authMiddleware(true), ReviewController.getReviewCount);
router.get(
  "/count/product/:productId",
  [
    param("productId").notEmpty().withMessage("ID продукту є обов'язковим"),
    param("productId")
      .isInt()
      .withMessage("ID продукту повинен бути цілим числом"),
  ],
  validateMiddleware,
  ReviewController.getReviewCount,
);
router.get("/count/user/:userId", ReviewController.getReviewCount);
router.get(
  "/:reviewId",
  [
    param("reviewId").notEmpty().withMessage("ID відгуку є обов'язковим"),
    param("reviewId")
      .isInt()
      .withMessage("ID відгуку повинен бути цілим числом"),
  ],
  validateMiddleware,
  ReviewController.getReviews,
);
router.get(
  "/product/:productId",
  [
    param("productId").notEmpty().withMessage("ID продукту є обов'язковим"),
    param("productId")
      .isInt()
      .withMessage("ID продукту повинен бути цілим числом"),
  ],
  validateMiddleware,
  ReviewController.getReviews,
);
router.post(
  "/",
  checkSchema({
    userId: {
      notEmpty: { errorMessage: "ID користувача є обов'язковим" },
      isInt: { errorMessage: "ID користувача повинен бути цілим числом" },
    },
    productId: {
      notEmpty: { errorMessage: "ID продукту є обов'язковим" },
      isInt: { errorMessage: "ID продукту повинен бути цілим числом" },
    },
    rating: {
      isInt: {
        options: {
          min: 1,
          max: 5,
        },
        errorMessage: "Рейтинг повинен бути від 1 до 5",
      },
    },
  }),
  validateMiddleware,
  authMiddleware(),
  ReviewController.createReview,
);
router.put(
  "/:reviewId",
  checkSchema({
    reviewId: {
      in: ["params"],
      notEmpty: { errorMessage: "ID відгуку є обов'язковим" },
      isInt: { errorMessage: "ID відгуку повинен бути цілим числом" },
    },
    userId: {
      in: ["body"],
      notEmpty: { errorMessage: "ID користувача є обов'язковим" },
      isInt: { errorMessage: "ID користувача повинен бути цілим числом" },
    },
    productId: {
      in: ["body"],
      notEmpty: { errorMessage: "ID продукту є обов'язковим" },
      isInt: { errorMessage: "ID продукту повинен бути цілим числом" },
    },
    rating: {
      in: ["body"],
      isInt: {
        options: { min: 1, max: 5 },
        errorMessage: "Рейтинг повинен бути від 1 до 5",
      },
    },
  }),
  validateMiddleware,
  authMiddleware(),
  ReviewController.updateReview,
);

router.delete(
  "/:reviewId",
  [
    param("reviewId").notEmpty().withMessage("ID відгуку є обов'язковим"),
    param("reviewId")
      .isInt()
      .withMessage("ID відгуку повинен бути цілим числом"),
  ],
  validateMiddleware,
  authMiddleware(),
  ReviewController.deleteReview,
);

export default router;
