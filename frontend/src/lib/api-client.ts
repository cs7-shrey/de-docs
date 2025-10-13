import axios from "axios";

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001",
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
})

export async function getContent(docId: string) {
    const response = await axiosInstance.get("/content")
    return response.data;
}

export async function checkAuth() {
    const response = await axiosInstance.get("/users/check-auth"); 
    return response.data;
}

export async function logoutReq() {
    await axiosInstance.get("/users/logout");
}

export default axiosInstance;