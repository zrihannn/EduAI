import { create } from 'zustand';
import aiService from '../services/aiService';
import { v4 as uuidv4 } from 'uuid'; // need to add uuid dependency or manually generate

export const useChatStore = create((set, get) => ({
    sessions: [],
    currentSessionId: null,
    messages: [],
    isStreaming: false,

    initSession: () => {
        if (!get().currentSessionId) {
            set({ currentSessionId: crypto.randomUUID(), messages: [] });
        }
    },

    sendMessage: async (messageText, model = 'gpt-4o') => {
        const sessionId = get().currentSessionId;

        // Optimistic UI update
        const userMsg = { role: 'user', message: messageText, isLocal: true };
        set((state) => ({
            messages: [...state.messages, userMsg],
            isStreaming: true
        }));

        try {
            const response = await aiService.sendChatMessage(messageText, sessionId, model);

            const aiMsg = {
                role: 'assistant',
                message: response.response,
                modelUsed: response.model,
                tokensUsed: response.tokensUsed,
                isLocal: true
            };

            set((state) => ({
                messages: [...state.messages, aiMsg],
                isStreaming: false
            }));
        } catch (error) {
            console.error("Chat failed", error);
            set({ isStreaming: false });
        }
    },

    fetchHistory: async (sessionId) => {
        set({ isStreaming: true });
        try {
            const history = await aiService.getChatHistory(sessionId);
            set({ messages: history, currentSessionId: sessionId, isStreaming: false });
        } catch (error) {
            console.error(error);
            set({ isStreaming: false });
        }
    },

    clearSession: async () => {
        const sessionId = get().currentSessionId;
        if (sessionId) {
            await aiService.clearChatHistory(sessionId);
        }
        set({ messages: [], currentSessionId: crypto.randomUUID() });
    }
}));
