import Express from "express";
import { prisma } from "@/db";
import { verifyConfig } from "./config/auth.config";
import router from "./routes/api";

import { configDotenv } from "dotenv";
import cors from "cors";
import { setupWebSocket } from "./routes/websockets";
import cookieParser from "cookie-parser";
import setupLogging from "./logging";
import { verifyServerConfig } from "./config/server.config";
import { syncChanges } from "./memory";

configDotenv();

const app = Express();
const port = process.env.PORT || 3001;

setupLogging(app);

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : ["http://localhost:3000"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(Express.json());

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.use("/", router);

async function main() {
  verifyConfig();
  verifyServerConfig();

  await prisma.$connect();

  const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
  setupWebSocket(server);

  setInterval(() => {
    syncChanges();
  }, 5000)
}


main().catch(async (err) => {
  console.error("Error in app", err);
});
