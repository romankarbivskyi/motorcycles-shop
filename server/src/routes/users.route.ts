import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { param } from "express-validator";
import { validateMiddleware } from "../middlewares/validate.middleware";

const router = Router();

router.get("/", authMiddleware(true), UserController.getUsers);
router.get("/count", authMiddleware(true), UserController.getUserCount);
router.get(
  "/:userId",
  [
    param("userId").notEmpty().withMessage("ID користувача є обов'язковим"),
    param("userId")
      .isInt()
      .withMessage("ID користувача повинен бути цілим числом"),
  ],
  validateMiddleware,
  authMiddleware(),
  UserController.getUsers,
);
router.put("/:userId", authMiddleware(), UserController.updateUser);
router.delete("/:userId", authMiddleware(true), UserController.deleteUser);

export default router;
