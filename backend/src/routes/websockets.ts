import { WebSocketServer } from "ws";
import { Server as httpServer } from "http";
import { socketHandler } from "@/controller/socket.controller";


export function setupWebSocket(server: httpServer) {
    const wss = new WebSocketServer({ server });
    wss.on('connection', (ws, req) => {
        socketHandler(ws, req);
    })
}