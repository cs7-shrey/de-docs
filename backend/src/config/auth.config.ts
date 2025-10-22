
const authConfig = {
    secret: process.env.AUTH_SECRET as string, 
    secret_expires_in: process.env.JWT_EXPIRES_IN as string, 
    refresh_secret: process.env.AUTH_REFRESH_SECRET as string, 
    refresh_secret_expires_in: process.env.REFRESH_TOKEN_EXPIRES_IN as string,

    base_domain: process.env.NODE_ENV === "production" ? process.env.BASE_DOMAIN as string : "localhost"
}

export const verifyConfig = () => {
    const keys = Object.keys(authConfig);
    for (let key of keys) {
        if (!authConfig[key as keyof typeof authConfig]) {
            throw Error(`${key} absent from env`);
        }
    }
}

export default authConfig;