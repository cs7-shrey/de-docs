import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import type { CursorData, Cursors, Operation } from "@/types";
import { performOperations } from "@/lib/operations";

interface Options {
    sessionId: string;
    docId: string;
    setOtherCursors: Dispatch<SetStateAction<Cursors>>;
    setVersionId: (versionId: number) => void;
    setTextContent: Dispatch<SetStateAction<string>>;
}

interface OperationsData {
    operations: Operation[];
    versionId: number;
    senderSessionId: string;
}

const useDocSocket = ({ sessionId, setOtherCursors, docId, setVersionId, setTextContent }: Options) => {
    const socketRef = useRef<WebSocket | undefined>(undefined);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // TODO: move to another hook
    const handleCursorData = (data: CursorData) => {
        setOtherCursors((prev) => {
            const next = new Map(prev);
            next.set(data.sessionId, {
                sessionId: data.sessionId,
                position: data.position,
                color: data.color,
            });
            return next;
        });
    }

    const handleOperationsData = (data: OperationsData) => {
        console.log(data.senderSessionId)
        if(data.senderSessionId !== sessionId) {
            // apply operations 
            const operations = data.operations;
            setTextContent((content) => performOperations(operations, content));
        }
        setVersionId(data.versionId);
    }

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
    }, [])

    return {
        error, socketRef, isConnecting
    };
};

export default useDocSocket;
