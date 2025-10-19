import { DocListItem } from "@/types";
import axios from "axios";

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001",
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
})

export async function getContent(docId: string) {
    const response = await axiosInstance.get(`/docs/content/${docId}`);
    return response.data;
}

export async function checkAuth() {
    const response = await axiosInstance.get("/users/check-auth"); 
    return response.data;
}

export async function logoutReq() {
    await axiosInstance.get("/users/logout");
}

export async function getDocsCreated() {
    const response = await axiosInstance.get("/docs/created");
    return response.data.docList as DocListItem[]
}

export async function createDocument(name: string) {
    const response = await axiosInstance.post("/docs/create", {
        name
    })

    return response.data as DocListItem;
}

export default axiosInstance;