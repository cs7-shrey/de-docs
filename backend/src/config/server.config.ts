
const serverConfig = {
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME as string,
    AWS_REGION: process.env.AWS_REGION as string,

    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID as string,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY as string,
}

export const verifyServerConfig = () => {
    const keys = Object.keys(serverConfig);
    for (let key of keys) {
        if (!serverConfig[key as keyof typeof serverConfig]) {
            throw new Error(`${key} absent from env`);
        }
    }
}

export default serverConfig;