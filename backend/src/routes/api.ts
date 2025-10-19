import { Router } from "express";
import docRouter from "./doc.route";
import userRouter from "./user.route";


const router = Router();

router.use("/users", userRouter);
router.use("/docs", docRouter);

export default router;