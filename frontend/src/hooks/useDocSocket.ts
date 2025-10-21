import { useCallback, useEffect, useRef, useState } from "react";
import type { CursorData, CursorDelete, Operation, OperationsData } from "@/types";

interface Options {
    sessionId: string;
    docId: string;
    handleCursorData: (data: CursorData) => void;
    handleOperationsData: (data: OperationsData) => void;
    handleCursorDelete: (data: CursorDelete) => void;
}


const useDocSocket = ({ sessionId, docId, handleCursorData, handleCursorDelete, handleOperationsData}: Options) => {
    const socketRef = useRef<WebSocket | undefined>(undefined);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendChanges = (operations: Operation[], versionId: number) => {
        if (!socketRef.current) return;

        socketRef.current.send(
            JSON.stringify({
                type: "operations",
                operations,
                sessionId,
                docVersionId: versionId,
            })
        );
    };

    const connectSocket = async () => {
        try {
            setIsConnecting(true);

            const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL ?? "ws://localhost:3001";
            const ws = new WebSocket(
                `${socketUrl}/?sessionId=${sessionId}&docId=${docId}`
            );
            await new Promise((resolve, reject) => {
                ws.onopen = () => {
                    resolve(null);
                };
                ws.onerror = () => {
                    reject(null);
                };
            });
            socketRef.current = ws;

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (data.type === "cursorData") {
                    handleCursorData(JSON.parse(event.data));
                }
                else if (data.type === "operations") {
                    handleOperationsData(JSON.parse(event.data));
                }
                else if (data.type === "cursorDelete") {
                    handleCursorDelete(JSON.parse(event.data));
                }
            };
        } catch (error) {
            console.error("Failed to connect to web socket: ", error);
            setError("Error connecting");
        } finally {
            setIsConnecting(false);
        }
    };

    useEffect(() => {
        connectSocket();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return {
        error, socketRef, isConnecting, sendChanges
    };
};

export default useDocSocket;
