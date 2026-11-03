import api from './api';

const platformService = {
    getAllPlatforms: async () => {
        const response = await api.get('/platforms');
        return response.data;
    },

    getPlatformsByTopic: async (topic) => {
        const response = await api.get('/platforms/by-topic', { params: { topic } });
        return response.data;
    }
};

export default platformService;
