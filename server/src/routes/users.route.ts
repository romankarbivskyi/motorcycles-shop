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
  [param("userId").notEmpty(), param("userId").isInt()],
  validateMiddleware,
  authMiddleware(),
  UserController.getUsers,
);

export default router;
