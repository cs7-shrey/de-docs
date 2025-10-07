import { z } from "zod";
import docSchema from "@/schema/doc.schema";

export type Operation = z.infer<typeof docSchema.operation>;

export interface Version {
    operations: Operation[];
    versionId: number;
    sessionId?: string;
}