import { create } from 'zustand';
import recommendationService from '../services/recommendationService';

export const useSearchStore = create((set) => ({
    query: '',
    results: [],
    filters: {
        type: 'ALL',
        platform: ''
    },
    pagination: {
        page: 0,
        size: 20,
        totalElements: 0
    },
    isLoading: false,

    setQuery: (q) => set({ query: q }),
    setFilter: (key, val) => set((state) => ({ filters: { ...state.filters, [key]: val } })),

    search: async () => {
        set({ isLoading: true });
        try {
            const state = useSearchStore.getState();
            if (!state.query) {
                set({ results: [], isLoading: false });
                return;
            }
            const data = await recommendationService.search(
                state.query,
                state.filters.type,
                state.filters.platform,
                state.pagination.page,
                state.pagination.size
            );
            set({
                results: data.content || [],
                pagination: { ...state.pagination, totalElements: data.totalElements || 0 },
                isLoading: false
            });
        } catch (error) {
            console.error("Search failed", error);
            set({ isLoading: false, results: [] });
        }
    }
}));
