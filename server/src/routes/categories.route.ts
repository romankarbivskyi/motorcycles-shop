import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", CategoryController.getCategories);
router.post("/create", authMiddleware(true), CategoryController.createCategory);
router.put("/update", authMiddleware(true), CategoryController.updateCategory);
router.delete(
  "/delete/:categoryId",
  authMiddleware(true),
  CategoryController.deleteCategory,
);

export default router;
