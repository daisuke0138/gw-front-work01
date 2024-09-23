import axios from "axios";

const apiClient = axios.create({
    baseURL: '/api',
    // baseURL: "http://localhost:3001/api",
    // baseURL: process.env.NEXT_PUBLIC_API_BASEURL,
    // baseURL: process.env.NEXT_PUBLIC_API_URL,
    // baseURL: process.env.NODE_ENV === 'development'
    //     ? 'http://localhost:3001/api'
    //     : `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
    headers: {
        "Content-Type": "application/json",
    },
});
export default apiClient;