import validationMiddleWare from "@/middleware/validation.middleware";
import docSchema from "@/schema/doc.schema";
import { Router, type Request, type Response } from "express"
import { z } from "zod";
import { operationalTransform, performOperations, dbContent, versions } from "@/lib/operational-transform";


const docRouter = Router();

docRouter.get('/content', async (req: Request, res: Response) => {
    return res.json({ 
        content: dbContent,
        version: versions[versions.length-1]?.versionId ?? 0
    });
})

docRouter.post('/changes', validationMiddleWare(docSchema.postOperations), async(req: Request, res: Response) => {
    try {
        const { operations, sessionId, docVersionId } = req.body as z.infer<typeof docSchema.postOperations>;

        console.log(sessionId, docVersionId, JSON.stringify(versions));

        operationalTransform(operations, docVersionId); 
        performOperations(operations, sessionId);

        return res.status(200).json({ 
            success: true,
            versionId: versions[versions.length-1]!.versionId
        });
    } catch (error) {
        console.error("Error processing operations:", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
})



export default docRouter;