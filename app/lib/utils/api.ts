import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@/app/lib/constants';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        // Add auth token if available
        // Token will be handled via httpOnly cookies
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        // Handle token refresh logic here if needed
        return Promise.reject(error);
    }
);

// API utility functions
export const api = {
    get: <T>(url: string, config?: AxiosRequestConfig) =>
        apiClient.get<T>(url, config),

    post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
        apiClient.post<T>(url, data, config),

    put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
        apiClient.put<T>(url, data, config),

    patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
        apiClient.patch<T>(url, data, config),

    delete: <T>(url: string, config?: AxiosRequestConfig) =>
        apiClient.delete<T>(url, config),
};

export default apiClient;
