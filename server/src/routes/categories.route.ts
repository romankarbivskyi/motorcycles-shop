import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { checkSchema, query } from "express-validator";
import { validateMiddleware } from "../middlewares/validate.middleware";

const router = Router();

router.get("/", CategoryController.getCategories);
router.get("/:categoryId", CategoryController.getCategories);
router.get("/count", CategoryController.getCategoryCount);
router.post(
  "/create",
  checkSchema({
    name: {
      trim: true,
      notEmpty: true,
    },
  }),
  validateMiddleware,
  authMiddleware(true),
  CategoryController.createCategory,
);
router.put(
  "/update",
  checkSchema({
    id: { notEmpty: true, isInt: true },
    name: {
      trim: true,
      notEmpty: true,
    },
  }),
  validateMiddleware,
  authMiddleware(true),
  CategoryController.updateCategory,
);
router.delete(
  "/delete/:categoryId",
  authMiddleware(true),
  CategoryController.deleteCategory,
);

export default router;
