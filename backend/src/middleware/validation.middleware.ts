import type { NextFunction, Request, Response } from 'express';
import { type ZodType, ZodError } from 'zod';

const validationMiddleWare = (schema: ZodType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const body = req.body;
            schema.parse(body); 
            next()
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors: Record<string, string[]> = {};

                error.issues.forEach((err) => {
                    const field = err.path.join('.');
                    if(!formattedErrors[field]) {
                        formattedErrors[field] = [];
                    }

                    formattedErrors[field].push(err.message);
                })

                // unprocessable entity
                return res.status(422).json(formattedErrors);
            }

            return res.status(500).json({message: "Internal server Error"})
        }
    }
}

export default validationMiddleWare;