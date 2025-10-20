import { prisma } from "@/db";
import Aws from "@/lib/aws";
import type { DocumentsOpened, Version } from "@/types";

export const documentsOpened: DocumentsOpened = {
};

export const coloursUsed: Record<string, string[]> = {};

export const versionMap: Record<string, Version[]> = {};

export async function syncChanges() {
	for(let docId of Object.keys(documentsOpened)) {
		const doc = documentsOpened[docId];
		if (!doc) continue;

		const dbDocument = await prisma.document.findFirst({
			where: {
				id: docId
			}
		})

		if(!dbDocument) continue;

		console.log(doc.content);

		await prisma.document.update({
			where: {
				id: docId
			},
			data: {
				briefContent: doc.content.slice(0, 200)
			}
		})
		await Aws.uploadDocument(dbDocument.userId, dbDocument.id, doc.content);
	}
}