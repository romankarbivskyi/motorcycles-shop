import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { checkSchema, param, query } from "express-validator";
import { validateMiddleware } from "../middlewares/validate.middleware";

const router = Router();

router.get("/", CategoryController.getCategories);
router.get("/count", CategoryController.getCategoryCount);
router.get(
  "/:categoryId",
  [
    param("categoryId").notEmpty().withMessage("ID категорії є обов'язковим"),
    param("categoryId")
      .isInt()
      .withMessage("ID категорії повинен бути цілим числом"),
  ],
  validateMiddleware,
  CategoryController.getCategories,
);
router.post(
  "/",
  checkSchema({
    name: {
      trim: true,
      notEmpty: {
        errorMessage: "Назва категорії є обов'язковою",
      },
    },
  }),
  validateMiddleware,
  authMiddleware(true),
  CategoryController.createCategory,
);
router.put(
  "/:categoryId",
  checkSchema({
    name: {
      trim: true,
      notEmpty: {
        errorMessage: "Назва категорії є обов'язковою",
      },
    },
  }),
  validateMiddleware,
  authMiddleware(true),
  CategoryController.updateCategory,
);
router.delete(
  "/:categoryId",
  authMiddleware(true),
  CategoryController.deleteCategory,
);

export default router;
