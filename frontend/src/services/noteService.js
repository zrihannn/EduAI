import api from './api';

const noteService = {
    uploadNote: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/notes/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    getMyNotes: async () => {
        const response = await api.get('/notes');
        return response.data;
    },

    getNoteStatus: async (id) => {
        const response = await api.get(`/notes/${id}/status`);
        return response.data;
    },

    getNoteRecommendations: async (noteId) => {
        const response = await api.get(`/recommendations/by-note/${noteId}`);
        return response.data;
    },

    deleteNote: async (id) => {
        await api.delete(`/notes/${id}`);
    }
};

export default noteService;
