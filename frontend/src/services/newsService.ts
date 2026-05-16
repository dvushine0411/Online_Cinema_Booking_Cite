import api from "@/lib/axios";
import type { ApiResponse, NewsDetailResponse, PaginatedData } from "@/types/apiTypes";
import type { News, CreateNewsPayload, NewsComment, UploadImageResponse, NewsFilter } from "@/types/newsTypes";


export const newsService = {
    uploadImage: async (file: File): Promise<UploadImageResponse> => {
        const formData = new FormData();
        formData.append("image", file);

        const response = await api.post("news/upload-image", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });

        return response.data;

    },

    getAllNews: async (params?: NewsFilter): Promise<PaginatedData<News>> => {
        const response = await api.get("news", { params });
        return response.data;

    },

    getNewsById: async (id: string): Promise<NewsDetailResponse> => {
        const response = await api.get(`news/${id}`);
        return response.data;

    },

    createNews: async (payload: CreateNewsPayload, thumbnail?: File): Promise<ApiResponse<News>> => {
        const formData = new FormData();
        formData.append("title", payload.title);
        formData.append("content", payload.content);
        formData.append("category", payload.category);
        if (thumbnail) {
            formData.append("thumbnail", thumbnail);
        }
        const response = await api.post("news", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;

    },

    updateNews: async (id: string, payload: CreateNewsPayload, thumbnail?: File): Promise<ApiResponse<News>> => {
        const formData = new FormData();
        formData.append("title", payload.title);
        formData.append("content", payload.content);
        formData.append("category", payload.category);
        if (thumbnail) {
            formData.append("thumbnail", thumbnail);
        }
        const response = await api.patch(`news/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });

        return response.data;
    },

    deleteNews: async (id: string): Promise<{ message: string }> => {
        const response = await api.delete(`news/${id}`);
        return response.data;
    },

    getCommentsByNewsId: async (newsId: string): Promise<ApiResponse<NewsComment[]>> => {
        const response = await api.get(`news/${newsId}/comments`);
        return response.data;
    },

    createComment: async (newsId: string, content: string): Promise<ApiResponse<NewsComment>> => {
        const response = await api.post(`news/${newsId}/comments`, { content });
        return response.data;

    },

    updateComment: async (newsId: string, commentId: string, content: string): Promise<ApiResponse<NewsComment>> => {
        const response = await api.patch(`news/${newsId}/comments/${commentId}`, { content });
        return response.data;
    },

    deleteComment: async (newsId: string, commentId: string): Promise<{ message: string }> => {
        const response = await api.delete(`news/${newsId}/comments/${commentId}`);
        return response.data;
    },


}
