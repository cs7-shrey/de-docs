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

const visibilityBody = z.object({
    visibility: z.enum(['private', 'public']),
})

const docSchema = {
    postOperations,
    operation,
    createDoc,
    visibilityBody
}

export default docSchema;