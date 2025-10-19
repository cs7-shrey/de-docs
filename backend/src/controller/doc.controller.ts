import { prisma } from "@/db";
import Aws from "@/lib/aws";
import docSchema from "@/schema/doc.schema";
import type { DocListItem } from "@/types";
import { NoSuchKey } from "@aws-sdk/client-s3";
import type { Request, Response } from "express";
import { z } from "zod";

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

        return res.json({
            id: document.id,
            name,
            createdAt: document.createdAt,
            openedAt: document.openedAt,
            briefContent: document.briefContent
        })
    }

    static async getContentByDocId(req: Request, res: Response) {
        const userId = req.userId;
        const docId = req.params.docId;
        if (!docId || !userId) return res.status(400).json({ message: "Invalid request ", detail: "docId/userId missing" });

        const document = await prisma.document.findFirst({
            where: {
                id: docId,
                OR: [
                    {userId: userId},
                    {visibility: "public"}
                ]
            }
        })

        if (!document) return res.status(404).json({ message: "No such document found" });

        let content = '';

        try {
            content = await Aws.getContent(userId, docId);
        } 
        catch (error) {
            if(error instanceof NoSuchKey) {
                await Aws.uploadDocument(userId, docId, '');
            }

            else {
                const errMsg = "Error getting document content";
                console.error(errMsg, error);

                return res.status(500).json({
                    message: errMsg
                })
            }
        }

        console.log(content);
        return res.json({
            content,
            version: 0,         // TODO: change if the document is in memory
            visibility: document.visibility,
            owner: document.userId
        })
    }

    static async changeVisibility(req: Request, res: Response) {
        const userId = req.userId;
        const docId = req.params.docId;

        if (!docId || !userId) return res.status(400).json({ message: "Invalid request docId/userId missing" });

        const { visibility } = req.body as z.infer<typeof docSchema.visibilityBody>;

        console.log("vis", visibility);

        try {
            await prisma.document.update({
                data: {
                    visibility
                },
                where: {
                    id: docId,
                    userId
                }
            });
            return res.status(200).json({message: "Successful"});

        } catch (error) {
            return res.status(400).json({message: "Couldn't update visibility"});
        }
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