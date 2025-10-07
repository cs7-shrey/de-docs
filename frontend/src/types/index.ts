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