import { Router, type Request, type Response } from "express";
import UserController from "@/controller/user.controller";
import validationMiddleWare from "@/middleware/validation.middleware";
import authSchema from "@/schema/auth.schema";
import authMiddleware from "@/middleware/auth.middleware";
import { prisma } from "@/db";
import { email } from "zod";

const userRouter = Router();

userRouter.post('/login', validationMiddleWare(authSchema.login), UserController.loginUser);
userRouter.post('/register', validationMiddleWare(authSchema.register), UserController.registerUser);
userRouter.post('/auth/google/callback', UserController.googleAuth)
userRouter.post('/auth/google/client-callback', UserController.handleGoogleAuth);
userRouter.get('/check-auth', authMiddleware, UserController.checkAuth);
userRouter.get('/logout', authMiddleware, UserController.logout);

export default userRouter;