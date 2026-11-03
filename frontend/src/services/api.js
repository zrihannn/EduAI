import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1'
});

api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken;
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return api(originalRequest);
                }).catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = useAuthStore.getState().refreshToken;

            if (!refreshToken) {
                useAuthStore.getState().logout();
                return Promise.reject(error);
            }

            try {
                // Cannot use standard api instance here to avoid loop
                const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/auth/refresh-token?refreshToken=${refreshToken}`);

                const { accessToken, refreshToken: newRefresh } = response.data;
                useAuthStore.getState().setTokens(accessToken, newRefresh);

                processQueue(null, accessToken);
                originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;

                return api(originalRequest);
            } catch (err) {
                processQueue(err, null);
                useAuthStore.getState().logout();
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
