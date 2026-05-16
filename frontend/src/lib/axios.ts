import axios from "axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { isTokenExpired } from "./utils";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
});

// Request interceptor //

axiosInstance.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken;

        if (token) {
            if (isTokenExpired(token)) {
                useAuthStore.getState().clearAuth();
                window.location.href = '/auth/signin';
                return Promise.reject(new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại"));
            }
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },

    (error) => {
        return Promise.reject(error);
    }

);

// Response interceptors //

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 || error.response?.status === 403 && !originalRequest.retry) {
            originalRequest.retry = true;
        }

        try {
            const response = await axiosInstance.post('/auth/refresh');
            const { accessToken } = response.data;

            if (accessToken) {
                localStorage.setItem("accessToken", accessToken);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return axiosInstance(originalRequest);

            }


        } catch (refreshError) {
            localStorage.removeItem("accessToken");
            window.location.href = '/auth/signin';
            return Promise.reject(refreshError);
        }
        return Promise.reject(error);

    }
);


export default axiosInstance;



