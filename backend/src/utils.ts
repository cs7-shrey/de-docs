import type { Response } from "express";
import authConfig from '@/config/auth.config';

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from '@/db';

export const createAndSetTokenAsCookies = async (userId: string, res: Response) => {
    const accessToken = jwt.sign(
        {
            userId: userId,
        }, 
        authConfig.secret,
        {
            expiresIn: authConfig.secret_expires_in as any
        }
    );

    // generate a refresh token
    const refreshToken = jwt.sign(
        {
            userId: userId, 
        },
        authConfig.refresh_secret,
        { 
            expiresIn: authConfig.refresh_secret_expires_in as any 
        }
    );

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await prisma.user.update({
        where: { id: userId },
        data: {
            refreshTokenHash
        }
    });

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60 * 1000,         // 15 minutes
        sameSite: "strict"
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,    // 24 hours
        sameSite: "strict"
    });
}
