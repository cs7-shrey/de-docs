import { z } from 'zod';
import { type Request, type Response } from "express";
import authSchema from '@/schema/auth.schema';
import { OAuth2Client } from 'google-auth-library';

import bcrypt from "bcrypt";
import { prisma } from '@/db';
import { createAndSetTokenAsCookies } from '@/utils';

const oauthClient = new OAuth2Client();

class UserController {
    static loginUser = async (req: Request, res: Response) => {
        const { email, password } = req.body as z.infer<typeof authSchema.login>;

        const user = await prisma.user.findFirst({
            where: {
                email: email,
            }
        })
        if (!user || !user.passwordHash) {
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

    static googleAuth = async (req: Request, res: Response) => {
        this.handleGoogleAuth(req, res);
    };

    static handleGoogleAuth = async (req: Request, res: Response) => {
        const { credential, client_id } = req.body;    
        try {
            const ticket = await oauthClient.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID,
            }) 
            const payload = ticket.getPayload();
            
            if(!payload) {
                return res.status(400).json({message: "Failed to login with google"})
            }

            const googleId = payload['sub'];
            const email = payload['email']!;
            const name = payload['given_name'] || payload['family_name'] || "User";
            
            let user = await prisma.user.findFirst({
                where: {
                    OR: [
                        {googleId: googleId},
                        {email: email}
                    ]
                }
            })

            if(!user) {
                user = await prisma.user.create({
                    data: {
                        name,
                        email,
                        googleId
                    }
                })
            }

            else if(!user.googleId) {
                user = await prisma.user.update({
                    where: {id: user.id},
                    data: {
                        googleId: googleId,
                        email: email,
                    }
                })
            }
            
            await createAndSetTokenAsCookies(user.id, res);

            return res.json({
                userId: user.id,
                email: user.email,
                name: user.name
            })

        } catch (error) {
            console.error(error);    
            return res.status(500).json({message: "An error occured while authenticating"});
        }
    }

    static checkAuth = async (req: Request, res: Response) => {
        const id = req.userId;
        const user = await prisma.user.findUnique({
            where: {
                id
            }
        })
        return res.json({
            userId: id,
            email: user?.email,
            name: user?.name
        })
    }

    static logout = async(req: Request, res: Response) => {
        const id = req.userId;

        res.cookie("accessToken", undefined);
        res.cookie("refreshToken", undefined);

        await prisma.user.update({
            where: {
                id: id
            },
            data: {
                refreshTokenHash: undefined
            }
        })

        return res.json({message: "Logout successful"});
    }
}

export default UserController;