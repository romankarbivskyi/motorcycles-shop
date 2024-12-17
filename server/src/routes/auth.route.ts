import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { checkSchema } from "express-validator";
import { validateMiddleware } from "../middlewares/validate.middleware";

const router = Router();

router.post(
  "/register",
  checkSchema({
    firstName: {
      notEmpty: true,
      trim: true,
      isLength: {
        options: { min: 2, max: 25 },
      },
    },
    lastName: {
      notEmpty: true,
      trim: true,
      isLength: {
        options: { min: 2, max: 35 },
      },
    },
    phone: {
      notEmpty: true,
      trim: true,
      isLength: {
        options: { min: 8, max: 12 },
        errorMessage: "Phone number is incorrect",
      },
    },
    email: {
      notEmpty: true,
      trim: true,
      isEmail: true,
    },
    password: {
      notEmpty: true,
      trim: true,
      errorMessage: "The password must be at least 8 characters",
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
      notEmpty: true,
      trim: true,
      isEmail: true,
    },
    password: {
      notEmpty: true,
      trim: true,
      errorMessage: "The password must be at least 8 characters",
      isLength: { options: { min: 8 } },
    },
  }),
  validateMiddleware,
  UserController.loginUser,
);

export default router;
