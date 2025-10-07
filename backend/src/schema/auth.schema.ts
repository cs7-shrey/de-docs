import { z } from "zod";

const passwordSchema = z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must include at least one uppercase letter")
    .regex(/[a-z]/, "Password must include at least one lowercase letter")
    .regex(/[0-9]/, "Password must include at least one number")
    .regex(/[@$!%*?&]/, "Password must include at least one special character");


const register = z.object({
    name: z.string(),
    email: z.email(), 
    password: passwordSchema,
})

const login = z.object({
    email: z.email(),
    password: passwordSchema
})

const authSchema = {
    register,
    login
}

export default authSchema;