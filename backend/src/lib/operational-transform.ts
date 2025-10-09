import type { Operation, Version } from "@/types";

export let dbContent = 
`Born into a wealthy family in Pretoria, South Africa, Musk emigrated in 1989 to Canada; 

he had obtained Canadian citizenship at birth through his Canadian-born mother. 


In 2002, Musk founded the space technology company SpaceX, becoming its CEO and chief engineer; the company has since led innovations in reusable rockets and commercial spaceflight. Musk joined the automaker Tesla as an early investor in 2004 and became its CEO and product architect in 2008; it has since become a leader in electric vehicles. In 2015, he co-founded OpenAI to advance artificial intelligence (AI) research, but later left, growing discontent with the organization's direction and their leadership in the AI boom in the 2020s led him to establish xAI. 

In 2022, he acquired the social network Twitter, implementing significant changes, and rebranding it as X in 2023. His other businesses include the neurotechnology company Neuralink, which he co-founded in 2016, and the tunneling company the Boring Company, which he founded in 2017.

Musk's political activities, views, and statements have made him a polarizing figure, especially following the COVID-19 pandemic. He has been criticized for making unscientific and misleading statements, including COVID-19 misinformation and promoting conspiracy theories, and affirming antisemitic, racist, and transphobic comments. His acquisition of Twitter was controversial due to a subsequent increase in hate speech and the spread of misinformation on the service. His role in the second Trump administration attracted public backlash, particularly in response to DOGE.
`

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

export function performOperations(operations: Operation[], sessionId: string) {
    console.log('--------------- AFTER TRANSFORM ---------------------')
    console.log(dbContent);
    console.log(operations);

    for(let op of operations) {
        if (!op) continue;
        
        const inserted = op.inserted ? op.inserted : '';
        if(op.type === 'insert') {
            dbContent = dbContent.slice(0, op.start) + inserted + dbContent.slice(op.start);
            console.log(dbContent);
        }
        else if (op.type === 'delete' && op.deleted) {
            dbContent = dbContent.slice(0, op.start-op.deleted?.length) + dbContent.slice(op.start);
            console.log(dbContent);
        }
        else if (op.type === 'replace') {
            const deletedLength = op.deleted ? op.deleted.length : 0
            dbContent = dbContent.slice(0, op.start) + inserted + dbContent.slice(op.start+deletedLength);
            console.log(dbContent);
        }
    }

    const versionId = versions[versions.length-1]!.versionId + 1;
    versions.push({
        operations,
        versionId,
        sessionId
    })

    return versionId;
}