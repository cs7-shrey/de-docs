import serverConfig from "@/config/server.config";
import crypto from "crypto";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const AWS_BUCKET_NAME = serverConfig.AWS_BUCKET_NAME;


const s3Client = new S3Client({
    region: serverConfig.AWS_REGION,
    credentials: {
        accessKeyId: serverConfig.AWS_ACCESS_KEY_ID,
        secretAccessKey: serverConfig.AWS_SECRET_ACCESS_KEY,
    }
});

const contentMd5 = (s: string) => crypto.createHash("md5").update(s, "utf8").digest("base64");

class Aws {
    static bucketPath(userId: string, docId: string) {
        return `${AWS_BUCKET_NAME}/${userId}/${docId}.txt`;
    }

    static fileKey(userId: string, docId: string) {
        return `${userId}/${docId}.txt`;
    }

    static async uploadDocument(userId: string, docId: string, content: string) {
        const key = this.fileKey(userId, docId);
        await s3Client.send(
            new PutObjectCommand({
                Bucket: AWS_BUCKET_NAME,
                Key: key,
                Body: content,
                ContentMD5: contentMd5(content)
            })
        )
    }

    static async getContent(userId: string, docId: string): Promise<string> {
        const key = this.fileKey(userId, docId);
    
        const { Body } = await s3Client.send(
            new GetObjectCommand({
            Bucket: AWS_BUCKET_NAME,
            Key: key,
            }),
        );

        return (await Body?.transformToString()) || '';
    }

    static async deleteDocument(userId: string, docId: string) {

    }
}

export default Aws;