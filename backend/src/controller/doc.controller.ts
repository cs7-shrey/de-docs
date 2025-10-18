import { prisma } from "@/db";
import Aws from "@/lib/aws";
import type docSchema from "@/schema/doc.schema";
import type { DocListItem } from "@/types";
import type { Request, Response } from "express";
import { string, z } from "zod";

class DocController {
    static async getDocumentsCreatedByUser(req: Request, res: Response) {
        const userId = req.userId;

        if (!userId) return;

        const doucments = await prisma.document.findMany({
            where: {
                userId: userId
            }
        })

        let docList: DocListItem[] = [];

        for (let doc of doucments) {
            docList.push({
                id: doc.id,
                name: doc.name,
                openedAt: doc.openedAt,
                createdAt: doc.createdAt,
                briefContent: doc.briefContent
            })
        }

        return res.json({
            docList
        })
    }

    static async createDoc(req: Request, res: Response) {
        const userId = req.userId;
        if (!userId) return;

        const { name } = req.body as z.infer<typeof docSchema.createDoc>;

        const document = await prisma.document.create({
            data: {
                name,
                briefContent: '',
                openedAt: new Date(),
                userId
            }
        })

        await Aws.uploadDocument(userId, document.id, '');
    }

    static async getContentByDocId(req: Request, res: Response) {
        const userId = req.userId;
        const docId = req.params.docId;
        if (!docId || !userId) return res.status(400).json({ message: "Invalid request ", detail: "docId/userId missing" });

        const document = await prisma.document.findFirst({
            where: {
                id: docId,
                userId
            }
        })

        if (!document) return res.status(404).json({ message: "No such document found" });

        const content = await Aws.getContent(userId, docId);
        return res.json({
            content
        })
    }

    static async deleteDocumentById(req: Request, res: Response) {
        const userId = req.userId;
        const docId = req.params.docId;

        if (!docId || !userId) return res.status(400).json({ message: "Invalid request docId/userId missing" });

        await prisma.document.delete({
            where: {
                id: docId,
                userId
            }
        })

        await Aws.deleteDocument(userId, docId);

        return res.status(200);
    }
}

export default DocController;