const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME


class Aws {
    static bucketPath(userId: string, docId: string) {
        return `${AWS_BUCKET_NAME}/${userId}/${docId}.txt`
    }

    static async uploadDocument(userId: string, docId: string, content: string) {
        const path = this.bucketPath(userId, docId);
        // TODO
    }

    static async getContent(userId: string, docId: string): Promise<string> {
        const path = this.bucketPath(userId, docId);
    
        // TODO
        return ''
    }

    static async deleteDocument(userId: string, docId: string) {

    }
}

export default Aws;