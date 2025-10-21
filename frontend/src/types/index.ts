export interface State {
    content: string;
    start: number;
    end: number;
}

export interface Operation {
    type: 'insert' | 'delete' | 'replace';
    start: number;
    end: number;
    deleted?: string;
    inserted?: string;
    undo?: boolean;
}

export interface CursorData {
    color: string;
    position: number;
    sessionId: string;
}

export interface CursorDelete {
    sessionId: string;
}

export type Cursors = Map<string, CursorData>;

export interface OperationsData {
    operations: Operation[];
    versionId: number;
    senderSessionId: string;
}

export interface DocListItem {
    id: string;
    name: string;
    createdAt: Date;
    openedAt: Date;
    briefContent: string;
}

export type Visibility = "public" | "private";

export interface DocMetaData {
    visibility: Visibility,
    ownerId: string,
    name: string
}