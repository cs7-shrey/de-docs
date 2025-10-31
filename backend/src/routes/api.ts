import { Router } from "express";
import docRouter from "./doc.route";
import userRouter from "./user.route";

type Status = "start" | "stop" | "exit" | "ping";

const router = Router();
let status: Status = "start";

router.use("/users", userRouter);
router.use("/docs", docRouter);

router.get("/status", (req, res) => {
  return res.json({ status });
});

router.post("/status", (req, res) => {
  const newStatus = req.body.status as Status;
  if (newStatus && ["start", "stop", "exit", "ping"].includes(newStatus)) {
    status = newStatus;
    res.json({ message: `Status updated to ${status}` });
  } else {
    res.status(400).json({ error: "Invalid status value" });
  }
});

router.post("/message", (req, res) => {
  const message = req.body.message;
  console.log("Received message:", message);
  res.json({ message: "Message received" });
});

export default router;