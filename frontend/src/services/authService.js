import api from './api';

const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    register: async (data) => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    logout: async (refreshToken) => {
        // use query param via params obj
        await api.post('/auth/logout', null, { params: { refreshToken } });
    }
};

export default authService;
