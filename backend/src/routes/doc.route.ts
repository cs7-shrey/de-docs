import validationMiddleWare from "@/middleware/validation.middleware";
import docSchema from "@/schema/doc.schema";
import { Router, type Request, type Response } from "express"
import { dbContent, versions } from "@/lib/operational-transform";
import authMiddleware from "@/middleware/auth.middleware";
import DocController from "@/controller/doc.controller";


const docRouter = Router();

docRouter.get('/content-temp', async (req: Request, res: Response) => {
    return res.json({ 
        content: dbContent,
        version: versions[versions.length-1]?.versionId ?? 0
    });
})

docRouter.get('/created', authMiddleware, DocController.getDocumentsCreatedByUser);

docRouter.get('/content/:docId', authMiddleware, DocController.getContentByDocId)
docRouter.post('/create', authMiddleware, validationMiddleWare(docSchema.createDoc), DocController.createDoc);
docRouter.delete('/:docId', authMiddleware, DocController.deleteDocumentById)

export default docRouter;