import authConfig from "@/config/auth.config";
import { prisma } from "@/db";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import bcrypt from 'bcrypt';
import { createAndSetTokenAsCookies } from "@/utils";

export interface DecodedToken {
    userId: string;
}

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if(!accessToken) {
        return res.status(401).json({message: "No access token provided"})
    }

    try {
        const decodedToken = jwt.verify(accessToken, authConfig.secret) as DecodedToken;
        (req as any).userId = decodedToken.userId;
        return next();
    }
    catch (err) {
        console.log("Access token invalid, proceeding to refresh token.");
    }

    if(!refreshToken) {
        return res.status(401).json({message: "No refresh token provided"})
    }

    try {
        const decodedRefreshToken = jwt.verify(refreshToken, authConfig.refresh_secret) as DecodedToken;
        const user = await prisma.user.findUnique({
            where: {
                id: decodedRefreshToken.userId
            }
        })

        if(!user || !user.refreshTokenHash) throw new Error("User/refresh token not found");


        const refreshTokenHashFromDb = user.refreshTokenHash;
        const verified = await bcrypt.compare(refreshToken, refreshTokenHashFromDb);
        if(!verified) throw new Error("Failed to verify refresh token hash");

        await createAndSetTokenAsCookies(user.id, res);
        (req as any).userId = user.id;
        next();
    } catch (error) {
        console.error(`Error while verifying refresh token: ${error}`)
        return res.status(401).json({ message: "Unauthorized"});
    }
}

export default authMiddleware;
