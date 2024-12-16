import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware(true), OrderController.getOrders);
router.get("/user/:userId", authMiddleware(true), OrderController.getOrders);
router.get("/:oderId", authMiddleware(), OrderController.getOrders);
router.post("/create", authMiddleware(), OrderController.createOrder);
router.delete(
  "/delete/:orderId",
  authMiddleware(),
  OrderController.deleteOrder,
);

export default router;
