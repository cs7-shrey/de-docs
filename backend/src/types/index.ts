import { z } from "zod";
import docSchema from "@/schema/doc.schema";
import { WebSocket } from "ws";

export type Operation = z.infer<typeof docSchema.operation>;

export interface Version {
    operations: Operation[];
    versionId: number;
    sessionId?: string;
};

// (docId, Map(sessionId, WebSocket))
interface SessionDetails {
    client: WebSocket;
    cursorColor: string;
}
export type SessionMap = Map<string, SessionDetails>
export type DocumentsOpened = Record<string, SessionMap>;

export interface DocListItem {
    id: string;
    name: string;
    createdAt: Date;
    openedAt: Date;
    briefContent?: string
}