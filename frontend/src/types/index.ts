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

export type Cursors = Map<string, CursorData>;