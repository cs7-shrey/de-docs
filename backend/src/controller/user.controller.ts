import { z } from 'zod';
import type { Request, Response } from "express";
import authSchema from '@/schema/auth.schema';
import authConfig from '@/config/auth.config';

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from '@/db';
import { createAndSetTokenAsCookies } from '@/utils';

class UserController {
    static loginUser = async (req: Request, res: Response) => {
        const { email, password } = req.body as z.infer<typeof authSchema.login>;

        const user = await prisma.user.findFirst({
            where: {
                email: email,
            }
        })
        if (!user) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid Credentails" });
        }

        await createAndSetTokenAsCookies(user.id, res);
        return res.json({message: "Login Successful"});
    }

    static registerUser = async(req: Request, res: Response) => {
        const { name, email, password } = req.body as z.infer<typeof authSchema.register>;

        const user = await prisma.user.findFirst({
            where: { email }
        })

        if (user) {
            return res.status(400).json({ message: "User already exists"});
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                name, email, passwordHash
            }
        })

        await createAndSetTokenAsCookies(newUser.id, res);
        return res.json({
            id: newUser.id, 
            name, 
            email
        })
    }
}

export default UserController;