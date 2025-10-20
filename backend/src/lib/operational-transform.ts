import type { Operation, Version } from "@/types";


export const versions: Version[] = [{
    operations: [], versionId: 0
}];

export function operationalTransform(operations: Operation[], versionId: number) {
    console.log(">>>>>> got here");

    if (operations.length === 0 || versions.length === 0) return;

    let offset = 0;

    let i = versions.length - 1;
    while(i >= 0 && versions[i]?.versionId !== versionId) {
        i--;
    }

    console.log("------------------------>>>>>>> got here", i);

    if(i < 0) return;

    i++;

    console.log(JSON.stringify(operations));


    while(i < versions.length) {
        for(let prevOp of versions[i]?.operations ?? []) {
            const start = prevOp.start;

            if(prevOp.type === 'insert') offset=prevOp.inserted?.length ?? 0;
            else if (prevOp.type === 'delete') offset = prevOp.deleted?.length? -1 * prevOp.deleted.length : 0;

            for(let op of operations) {
                if(op.start >= start) {
                    op.start += offset;
                }
            }
        }
        i++;
    }
}

export function performOperations(operations: Operation[], sessionId: string, content: string) {
    console.log('--------------- AFTER TRANSFORM ---------------------')
    console.log(content);
    console.log(operations);

    for(let op of operations) {
        if (!op) continue;
        
        const inserted = op.inserted ? op.inserted : '';
        if(op.type === 'insert') {
            content = content.slice(0, op.start) + inserted + content.slice(op.start);
            console.log(content);
        }
        else if (op.type === 'delete' && op.deleted) {
            content = content.slice(0, op.start-op.deleted?.length) + content.slice(op.start);
            console.log(content);
        }
        else if (op.type === 'replace') {
            const deletedLength = op.deleted ? op.deleted.length : 0
            content = content.slice(0, op.start) + inserted + content.slice(op.start+deletedLength);
            console.log(content);
        }
    }

    const versionId = versions[versions.length-1]!.versionId + 1;
    versions.push({
        operations,
        versionId,
        sessionId
    })

    return {versionId, content};
}