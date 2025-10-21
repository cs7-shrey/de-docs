import { Operation } from "@/types";

interface PerformOperationsResult {
    content: string;
    operationalStart: number;
    operationalOffset: number;
}

export function performOperations(operations: Operation[], content: string): PerformOperationsResult {
    const operationalStart = operations[0]?.start || 0;
    let operationalOffset = 0;
    for(const op of operations) {
        if (!op) continue;
        
        const inserted = op.inserted ? op.inserted : '';
        if(op.type === 'insert') {
            content = content.slice(0, op.start) + inserted + content.slice(op.start);
            operationalOffset += inserted.length;
        }
        else if (op.type === 'delete' && op.deleted) {
            content = content.slice(0, op.start-op.deleted?.length) + content.slice(op.start);
            operationalOffset -= op.deleted.length;
        }
        else if (op.type === 'replace') {
            const deletedLength = op.deleted ? op.deleted.length : 0
            content = content.slice(0, op.start) + inserted + content.slice(op.start+deletedLength);
            operationalOffset += inserted.length - deletedLength;
        }
    }

    return { content, operationalStart, operationalOffset };
}