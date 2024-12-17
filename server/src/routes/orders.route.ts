import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { checkSchema } from "express-validator";
import { validateMiddleware } from "../middlewares/validate.middleware";

const router = Router();

router.get("/", authMiddleware(true), OrderController.getOrders);
router.get(
  "/user/:userId",
  authMiddleware(true),
  OrderController.getUserOrders,
);
router.get("/:oderId", authMiddleware(), OrderController.getOrders);
router.post(
  "/create",
  checkSchema({
    firstName: {
      isString: {
        errorMessage: "First name must be a string",
      },
      notEmpty: {
        errorMessage: "First name is required",
      },
    },
    lastName: {
      isString: {
        errorMessage: "Last name must be a string",
      },
      notEmpty: {
        errorMessage: "Last name is required",
      },
    },
    phone: {
      isString: {
        errorMessage: "Phone must be a string",
      },
      matches: {
        options: [/^\+?[0-9]{10,15}$/],
        errorMessage: "Phone must be a valid phone number",
      },
      notEmpty: {
        errorMessage: "Phone number is required",
      },
    },
    email: {
      in: ["body"],
      isEmail: {
        errorMessage: "Invalid email address",
      },
      notEmpty: {
        errorMessage: "Email is required",
      },
    },
    shipAddress: {
      isString: {
        errorMessage: "Shipping address must be a string",
      },
      notEmpty: {
        errorMessage: "Shipping address is required",
      },
    },
    userId: {
      isInt: {
        errorMessage: "User ID must be an integer",
      },
      notEmpty: {
        errorMessage: "User ID is required",
      },
    },
    "orderItems.*.productId": {
      custom: {
        options: (value) => {
          if (value === null || value === undefined)
            throw new Error("Product ID is required in order items");
          if (!Number.isInteger(value))
            throw new Error("Product ID must be an integer");
          return true;
        },
      },
    },
    "orderItems.*.quantity": {
      custom: {
        options: (value) => {
          if (value === null || value === undefined)
            throw new Error("Quantity is required in order items");
          if (!Number.isInteger(value) || value <= 0)
            throw new Error("Quantity must be an integer greater than 0");
          return true;
        },
      },
    },
  }),
  validateMiddleware,
  authMiddleware(),
  OrderController.createOrder,
);
router.delete(
  "/delete/:orderId",
  authMiddleware(),
  OrderController.deleteOrder,
);

export default router;
