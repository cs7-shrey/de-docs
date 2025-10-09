import axios from "axios";

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001"
})

export async function getContent(docId: string) {
    const response = await axiosInstance.get("/content")
    return response.data;
}

export default axiosInstance;