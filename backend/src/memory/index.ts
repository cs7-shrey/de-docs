import { prisma } from "@/db";
import Aws from "@/lib/aws";
import type { DocRecord, DocumentsOpened, Version } from "@/types";
import { blake3StringHash } from "@/utils";

export const documentsOpened: DocumentsOpened = {};

export const coloursUsed: Record<string, string[]> = {};

export const versionMap: Record<string, Version[]> = {};

function isDifferentFromPrev(docRecord: DocRecord) {
	return blake3StringHash(docRecord.content) !== docRecord.lastHash;
}
export async function syncChanges() {
	for(let docId of Object.keys(documentsOpened)) {
		const doc = documentsOpened[docId];
		if (!doc) continue;

		if(!isDifferentFromPrev(doc)) {
			continue;;
		}

		const dbDocument = await prisma.document.findFirst({
			where: {
				id: docId
			}
		})

		if(!dbDocument) continue;

		await prisma.document.update({
			where: {
				id: docId
			},
			data: {
				briefContent: doc.content.slice(0, 200)
			}
		})

		await Aws.uploadDocument(dbDocument.userId, dbDocument.id, doc.content);
		doc.lastHash = blake3StringHash(doc.content);
	}
}

export async function syncSpecficDoc(docId: string) {
	const doc = documentsOpened[docId];
	if(!doc) {
		console.error("No such document to sync changes with ID", docId);
		return;
	}

	if(!isDifferentFromPrev(doc)) {
		return;;
	}

	const dbDocument = await prisma.document.findFirst({
		where: {
			id: docId
		}
	})

	if(!dbDocument) return;

	await prisma.document.update({
		where: {
			id: docId
		},
		data: {
			briefContent: doc.content.slice(0, 200)
		}
	})

	await Aws.uploadDocument(dbDocument.userId, dbDocument.id, doc.content);
	doc.lastHash = blake3StringHash(doc.content);
}