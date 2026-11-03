import api from './api';

const recommendationService = {
    search: async (query, type = 'ALL', platform, page = 0, size = 20) => {
        const params = { query, type, page, size };
        if (platform) params.platform = platform;
        const response = await api.get('/recommendations/search', { params });
        return response.data;
    },

    getTrending: async () => {
        const response = await api.get('/recommendations/trending');
        return response.data;
    },

    getSaved: async () => {
        const response = await api.get('/recommendations/saved');
        return response.data;
    },

    saveToList: async (id) => {
        await api.post(`/recommendations/save/${id}`);
    },

    removeFromList: async (id) => {
        await api.delete(`/recommendations/save/${id}`);
    }
};

export default recommendationService;
