import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { checkSchema, param } from "express-validator";
import { validateMiddleware } from "../middlewares/validate.middleware";

const router = Router();

router.get("/", authMiddleware(true), OrderController.getOrders);
router.get("/count", authMiddleware(), OrderController.getOrderCount);
router.get(
  "/user/:userId",
  [
    param("userId")
      .notEmpty()
      .withMessage("Ідентифікатор користувача обов'язковий"),
    param("userId")
      .isInt()
      .withMessage("Ідентифікатор користувача повинен бути цілим числом"),
  ],
  validateMiddleware,
  authMiddleware(),
  OrderController.getOrders,
);
router.get(
  "/:orderId",
  [
    param("orderId")
      .notEmpty()
      .withMessage("Ідентифікатор замовлення обов'язковий"),
    param("orderId")
      .isInt()
      .withMessage("Ідентифікатор замовлення повинен бути цілим числом"),
  ],
  validateMiddleware,
  authMiddleware(),
  OrderController.getOrders,
);
router.post(
  "/",
  checkSchema({
    firstName: {
      isString: {
        errorMessage: "Ім'я повинно бути рядком",
      },
      notEmpty: {
        errorMessage: "Ім'я обов'язкове для заповнення",
      },
    },
    lastName: {
      isString: {
        errorMessage: "Прізвище повинно бути рядком",
      },
      notEmpty: {
        errorMessage: "Прізвище обов'язкове для заповнення",
      },
    },
    phone: {
      isString: {
        errorMessage: "Телефон повинен бути рядком",
      },
      matches: {
        options: [/^\+?[0-9]{10,15}$/],
        errorMessage: "Телефон повинен бути коректним номером",
      },
      notEmpty: {
        errorMessage: "Номер телефону обов'язковий для заповнення",
      },
    },
    email: {
      in: ["body"],
      isEmail: {
        errorMessage: "Невірна електронна адреса",
      },
      notEmpty: {
        errorMessage: "Електронна адреса обов'язкова для заповнення",
      },
    },
    shipAddress: {
      isString: {
        errorMessage: "Адреса доставки повинна бути рядком",
      },
      notEmpty: {
        errorMessage: "Адреса доставки обов'язкова для заповнення",
      },
    },
    userId: {
      isInt: {
        errorMessage: "Ідентифікатор користувача повинен бути цілим числом",
      },
      notEmpty: {
        errorMessage: "Ідентифікатор користувача обов'язковий для заповнення",
      },
    },
    "orderItems.*.productId": {
      custom: {
        options: (value) => {
          if (value === null || value === undefined)
            throw new Error("Ідентифікатор продукту обов'язковий у замовленні");
          if (!Number.isInteger(value))
            throw new Error("Ідентифікатор продукту повинен бути цілим числом");
          return true;
        },
      },
    },
    "orderItems.*.quantity": {
      custom: {
        options: (value) => {
          if (value === null || value === undefined)
            throw new Error("Кількість обов'язкова у замовленні");
          if (!Number.isInteger(value) || value <= 0)
            throw new Error("Кількість повинна бути цілим числом більше 0");
          return true;
        },
      },
    },
  }),
  validateMiddleware,
  authMiddleware(),
  OrderController.createOrder,
);
router.post(
  "/:orderId/status",
  authMiddleware(true),
  OrderController.changeStatus,
);
router.delete("/:orderId", authMiddleware(), OrderController.deleteOrder);

export default router;
