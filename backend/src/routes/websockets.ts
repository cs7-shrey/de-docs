import { WebSocketServer } from "ws";
import { Server as httpServer } from "http";
import { socketAuth } from "@/middleware/auth.middleware";
import { socketHandler } from "@/controller/socket.controller";


export function setupWebSocket(server: httpServer) {
    const wss = new WebSocketServer({ server });
    wss.on('connection', async (ws, req) => {
        const userId = await socketAuth(ws, req);
        req.userId = userId;

        if(!req.userId) return;
        socketHandler(ws, req);
    })
}