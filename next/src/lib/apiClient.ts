import axios from "axios";

// const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASEURL;
const apiClient = axios.create({
    baseURL: "http://localhost:3001/api",
    // baseURL: apiBaseUrl,


    headers: {
        "Content-Type": "application/json",
    },
});

export const fetchData = async (endpoint: string) => {
    const response = await apiClient.get(`/api/${endpoint}`);
    return response.data;
};

// baseURL: process.env.NODE_ENV === 'development'
//     ? 'http://localhost:3001/api'
//     : `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,


export default apiClient;