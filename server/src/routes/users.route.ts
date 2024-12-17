import express, { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { checkSchema } from "express-validator";
import { validateMiddleware } from "../middlewares/validate.middleware";

const router = Router();

router.get("/", authMiddleware(true), UserController.getUsers);
router.get("/:userId", authMiddleware(), UserController.getUsers);

export default router;
