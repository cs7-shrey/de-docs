import Express from "express";
import { prisma } from "@/db";
import { verifyConfig } from "./config/auth.config";
import userRouter from "@/routes/user.route";
import docRouter from "./routes/doc.route";

import { configDotenv } from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { setupWebSocket } from "./routes/websockets";
import cookieParser from "cookie-parser";

configDotenv();

const app = Express();
const port = process.env.PORT || 3001;

// Logging
morgan.token("remote-port", req => String(req.socket.remotePort || ""));
morgan.token("http-version", req => req.httpVersion);
morgan.token("level", (req, res) => {
  const s = res.statusCode || 0;
  if (s >= 500) return "ERROR";
  if (s >= 400) return "WARNING";
  return "INFO";
});

// Uvicorn-ish: INFO: 127.0.0.1:54321 - "GET / HTTP/1.1" 200
const uvicornFormat =
  ':level: :remote-addr::remote-port - ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms';
app.use(morgan(uvicornFormat));

app.use(cors({
  origin: process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : ['http://localhost:3000'],
  credentials: true
}));

app.use(cookieParser());
app.use(Express.json());

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.use('/', docRouter);
app.use('/users', userRouter);


async function main() {
  verifyConfig();
  await prisma.$connect();

  const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
  setupWebSocket(server);
}

main();

// main().catch(async (err) => {
//   console.error("Error starting app", err);
//   await prisma.$disconnect();
//   process.exit(1);
// });
