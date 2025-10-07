import { Router } from "express";
import UserController from "@/controller/user.controller";
import validationMiddleWare from "@/middleware/validation.middleware";
import authSchema from "@/schema/auth.schema";

const userRouter = Router();

userRouter.post('/login', validationMiddleWare(authSchema.login), UserController.loginUser);
userRouter.post('/register', validationMiddleWare(authSchema.register), UserController.registerUser);

export default userRouter;