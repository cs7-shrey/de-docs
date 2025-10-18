import morgan from "morgan";

import type { Express } from "express";

export default function setupLogging(app: Express) {
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
}