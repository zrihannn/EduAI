import api from './api';

const aiService = {
    sendChatMessage: async (message, sessionId, model) => {
        const response = await api.post('/ai/chat', { message, sessionId, model });
        return response.data;
    },

    getChatHistory: async (sessionId) => {
        const response = await api.get(`/ai/chat/history/${sessionId}`);
        return response.data;
    },

    clearChatHistory: async (sessionId) => {
        await api.delete(`/ai/chat/history/${sessionId}`);
    },

    getAvailableModels: async () => {
        const response = await api.get('/ai/models');
        return response.data;
    }
};

export default aiService;
