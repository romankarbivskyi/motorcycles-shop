import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { upload } from "../utils/storage";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", ProductController.getProducts);
router.get("/:productId", ProductController.getProducts);
router.post(
  "/create",
  authMiddleware(true),
  upload.array("images", 10),
  ProductController.createProduct,
);
router.put(
  "/update",
  authMiddleware(true),
  upload.array("images", 10),
  ProductController.updateProduct,
);
router.delete(
  "/delete/:productId",
  authMiddleware(true),
  ProductController.deleteProduct,
);

export default router;
