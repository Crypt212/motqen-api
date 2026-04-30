import axios from "axios";

export function createAxiosInstance(baseURL: string, headers?: any) {
    return axios.create({
        baseURL,
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
    });
}