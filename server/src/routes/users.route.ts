import express, { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware(true), UserController.getUsers);
router.get("/:userId", authMiddleware(), UserController.getUsers);

export default router;
