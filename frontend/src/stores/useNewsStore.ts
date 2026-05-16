import { create } from "zustand";
import { newsService } from "@/services/newsService";
import type { News, NewsComment, NewsFilter } from "@/types/newsTypes";
import type { PaginatedData } from "@/types/apiTypes";


interface NewsState {
    newsList: PaginatedData<News> | null;
    selectedNews: News | null;
    comments: NewsComment[];
    isLoading: boolean;
    error: string | null;

    fetchNews: (params?: NewsFilter) => Promise<void>;
    fetchNewsById: (id: string) => Promise<void>;
    createComment: (newsId: string, content: string) => Promise<void>;
    deleteComment: (newsId: string, commentId: string) => Promise<void>;
    clearSelectedNews: () => void;
    clearError: () => void;
}


export const useNewsStore = create<NewsState>((set) => ({
    newsList: null,
    selectedNews: null,
    comments: [],
    isLoading: false,
    error: null,

    fetchNews: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const response = await newsService.getAllNews(params);
            set({ newsList: response });
        } catch (err: any) {
            set({ error: err.response?.data?.message ?? "Lỗi tải tin tức" });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchNewsById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await newsService.getNewsById(id);
            set({
                selectedNews: response.data.news,
                comments: response.data.comments,
            });
        } catch (err: any) {
            set({ error: err.response?.data?.message ?? "Lỗi tải bài viết" });
        } finally {
            set({ isLoading: false });
        }
    },

    createComment: async (newsId, content) => {
        try {
            const response = await newsService.createComment(newsId, content);
            set((state) => ({
                comments: [response.data, ...state.comments],
            }));
        } catch (err: any) {
            set({ error: err.response?.data?.message ?? "Lỗi đăng comment" });
            throw err;
        }
    },

    deleteComment: async (newsId, commentId) => {
        try {
            await newsService.deleteComment(newsId, commentId);
            set((state) => ({
                comments: state.comments.filter((c) => c._id !== commentId),
            }));
        } catch (err: any) {
            set({ error: err.response?.data?.message ?? "Lỗi xoá comment" });
            throw err;
        }
    },

    clearSelectedNews: () => set({ selectedNews: null, comments: [] }),
    clearError: () => set({ error: null }),
}));
