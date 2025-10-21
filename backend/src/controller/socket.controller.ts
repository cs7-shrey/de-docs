import type WebSocket from "ws";
import { WebSocket as Socket } from "ws";
import type { IncomingMessage } from "http";
import { parse } from "url";
import { operationalTransform, performOperations, versions } from "@/lib/operational-transform";
import { z } from "zod";
import docSchema from "@/schema/doc.schema";
import { prisma } from "@/db";
import Aws from "@/lib/aws";

import { documentsOpened } from "@/memory"


const CURSOR_COLORS = [
	"#3B82F6", // Blue
	"#10B981", // Emerald
	"#F59E0B", // Amber
	"#EF4444", // Red
	"#8B5CF6", // Violet
	"#EC4899", // Pink
	"#14B8A6", // Teal
	"#F97316", // Orange
	"#6366F1", // Indigo
	"#84CC16", // Lime
	"#06B6D4", // Cyan
	"#F43F5E", // Rose
	"#8B5A3C", // Brown
	"#A855F7", // Purple
	"#22C55E", // Green
	"#EAB308", // Yellow
	"#0EA5E9", // Sky Blue
	"#D946EF", // Fuchsia
	"#059669", // Dark Green
	"#DC2626", // Dark Red
];

const coloursUsed: Record<string, string[]> = {};

export async function socketHandler(ws: WebSocket, req: IncomingMessage) {
	const { query } = parse(req.url!, true);
	const sessionId = query.sessionId as string | undefined;
	const docId = query.docId as string | undefined;
	const userId = req.userId;

	if (!docId || !sessionId || !userId) {
		ws.close();
		return;
	}

	// TODO: add auth checks for more
	const dbDocument = await prisma.document.findFirst({
		where: {
			id: docId,
			OR: [
				{userId},
				{visibility: "public"}
			]
		}
	})

	if(!dbDocument) {
		ws.close();
		return;
	}

	// If document not in memory
	if (!documentsOpened[docId]) {
		documentsOpened[docId] = {sessions: new Map(), content: await Aws.getContent(dbDocument.userId, dbDocument.id)};
	}

	documentsOpened[docId].sessions.set(sessionId, {
		cursorColor: generateRandomColor(docId),
		client: ws,
	});

	console.log(documentsOpened[docId].sessions);

	ws.onmessage = (event: WebSocket.MessageEvent) => {
		// receiver cursor position in the doc
		try {
			const data = JSON.parse(event.data.toString());
            
            if(data.type === "cursorPosition") {
                const position = data.position as number;
                emitCursorData(position, sessionId, docId, ws);
            }
            else if(data.type === "operations") {
                documentsOpened[docId]!.content = handleOperations(data, docId, sessionId, ws, documentsOpened[docId]!.content);
            }
		} catch (error) {
			console.error("Error parsing message", error);
		}
	};

	ws.onclose = () => {
		if(!documentsOpened[docId]) return;
		documentsOpened[docId].sessions.delete(sessionId);

		if(documentsOpened[docId].sessions.size === 0) {
			delete documentsOpened[docId];
		}
		emitCursorDelete(sessionId, docId, ws);
		// TODO: send a syncing call to aws
		// to delete cursor
	};
}

function handleOperations(data: any, docId: string, senderSessionId: string, ws: WebSocket, content: string) {
    const { operations, sessionId, docVersionId } = data as z.infer<typeof docSchema.postOperations>;
	
	console.log("Operations Received ————————————>\n")
	console.log(operations);
	console.log("Operations Received End ————————————>\n")

    console.log(sessionId, docVersionId, JSON.stringify(versions));

    operationalTransform(operations, docVersionId); 
    const { versionId, content: resultantContent } = performOperations(operations, sessionId, content);

    for (let session of documentsOpened[docId]?.sessions!) {
        const client = session[1].client;
        const operationsData = {
            type: "operations",
            operations,
            versionId,
			senderSessionId
        }

		// send to all including the original sender
        if (client.readyState === Socket.OPEN) {
            client.send(JSON.stringify(operationsData));
        }
    }

	return resultantContent;
}

function emitCursorData(
	position: number,
	sessionId: string,
	docId: string,
	ws: WebSocket,
) {
    for (let session of documentsOpened[docId]?.sessions || []) {
        const client = session[1].client;
        const cursorData = {
            type: "cursorData",
            sessionId,
            position,
            color: session[1].cursorColor,
        };
        if (client !== ws && client.readyState === Socket.OPEN) {
            client.send(JSON.stringify(cursorData));
        }
    }
}

function emitCursorDelete(deletedSessionId: string, docId: string, ws: WebSocket) {
	for(let session of documentsOpened[docId]?.sessions || []) {
		const client = session[1].client;
		const data = {
			type: "cursorDelete",
			sessionId: deletedSessionId
		}
        if (client !== ws && client.readyState === Socket.OPEN) {
            client.send(JSON.stringify(data));
        }
	}
}

function generateRandomColor(docId: string): string {
	if (!coloursUsed[docId]) coloursUsed[docId] = [];

	const colors = CURSOR_COLORS.filter(
		(color) => !coloursUsed[docId]!.includes(color)
	);

	if (colors.length === 0) {
		return (
			CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)] ??
			"1e1e1e"
		);
	}

	const randomColor = colors[Math.floor(Math.random() * colors.length)];
	if (randomColor) coloursUsed[docId].push(randomColor);

	return randomColor ?? "1e1e1e";
}
