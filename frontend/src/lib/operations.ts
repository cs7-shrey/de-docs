import { Operation } from "@/types";

export function performOperations(operations: Operation[], content: string): string {
    for(const op of operations) {
        if (!op) continue;
        
        const inserted = op.inserted ? op.inserted : '';
        if(op.type === 'insert') {
            content = content.slice(0, op.start) + inserted + content.slice(op.start);
        }
        else if (op.type === 'delete' && op.deleted) {
            content = content.slice(0, op.start-op.deleted?.length) + content.slice(op.start);
        }
        else if (op.type === 'replace') {
            const deletedLength = op.deleted ? op.deleted.length : 0
            content = content.slice(0, op.start) + inserted + content.slice(op.start+deletedLength);
        }
    }

    return content;
}