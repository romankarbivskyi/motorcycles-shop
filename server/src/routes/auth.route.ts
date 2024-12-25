import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { checkSchema } from "express-validator";
import { validateMiddleware } from "../middlewares/validate.middleware";

const router = Router();

router.post(
  "/register",
  checkSchema({
    firstName: {
      notEmpty: { errorMessage: "Ім'я не може бути порожнім" },
      trim: true,
      isLength: {
        options: { min: 2, max: 25 },
        errorMessage: "Ім'я повинно бути від 2 до 25 символів",
      },
    },
    lastName: {
      notEmpty: { errorMessage: "Прізвище не може бути порожнім" },
      trim: true,
      isLength: {
        options: { min: 2, max: 35 },
        errorMessage: "Прізвище повинно бути від 2 до 35 символів",
      },
    },
    phone: {
      notEmpty: { errorMessage: "Телефон не може бути порожнім" },
      trim: true,
      isLength: {
        options: { min: 8, max: 12 },
        errorMessage: "Номер телефону введено некоректно",
      },
    },
    email: {
      notEmpty: { errorMessage: "Email не може бути порожнім" },
      trim: true,
      isEmail: { errorMessage: "Невірний формат email" },
    },
    password: {
      notEmpty: { errorMessage: "Пароль не може бути порожнім" },
      trim: true,
      errorMessage: "Пароль повинен містити щонайменше 8 символів",
      isLength: { options: { min: 8 } },
    },
  }),
  validateMiddleware,
  UserController.registerUser,
);

router.post(
  "/login",
  checkSchema({
    email: {
      notEmpty: { errorMessage: "Email не може бути порожнім" },
      trim: true,
      isEmail: { errorMessage: "Невірний формат email" },
    },
    password: {
      notEmpty: { errorMessage: "Пароль не може бути порожнім" },
      trim: true,
      errorMessage: "Пароль повинен містити щонайменше 8 символів",
      isLength: { options: { min: 8 } },
    },
  }),
  validateMiddleware,
  UserController.loginUser,
);

export default router;
