import { z } from "zod";

const operation = z.object({
    type: z.enum(['insert', 'delete', 'replace']),
    start: z.number(),
    end: z.number(),
    deleted: z.string().optional(),
    inserted: z.string().optional(),
    undo: z.boolean().optional()
})

const postOperations = z.object({
    operations: z.array(operation),
    sessionId: z.string(),
    docVersionId: z.number()
})

const createDoc = z.object({
    name: z.string(),
})

const docSchema = {
    postOperations,
    operation,
    createDoc
}

export default docSchema;