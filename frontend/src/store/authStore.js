import { create } from 'zustand';
import authService from '../services/authService';

export const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,

    login: async (email, password) => {
        const response = await authService.login(email, password);
        const { user, accessToken, refreshToken } = response;

        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        set({ user, accessToken, refreshToken });
    },

    register: async (data) => {
        const response = await authService.register(data);
        const { user, accessToken, refreshToken } = response;

        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        set({ user, accessToken, refreshToken });
    },

    logout: async () => {
        const token = localStorage.getItem('refreshToken');
        if (token) {
            try {
                await authService.logout(token);
            } catch (e) {
                console.error("Logout failed on server, cleaning local state anyway");
            }
        }
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, accessToken: null, refreshToken: null });
    },

    setTokens: (accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({ accessToken, refreshToken });
    }
}));
