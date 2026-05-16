import api from "@/lib/axios";
import type { ApiResponse } from "@/types/apiTypes";
import type { Review, CreateReviewPayload, UpdateReviewPayload } from "@/types/reviewTypes";


export const reviewService = {

    getReviewsByMovieId: async (movieId: string): Promise<ApiResponse<Review[]>> => {
        const response = await api.get(`reviews/${movieId}`);
        return response.data;
    },

    createReview: async (payload: CreateReviewPayload): Promise<ApiResponse<Review>> => {
        const response = await api.post("reviews", payload);
        return response.data;
    },

    updateReview: async (
        id: string,
        payload: UpdateReviewPayload
    ): Promise<ApiResponse<Review>> => {
        const response = await api.put(`reviews/${id}`, payload);
        return response.data;
    },

    deleteReview: async (id: string): Promise<{ message: string }> => {
        const response = await api.delete(`reviews/${id}`);
        return response.data;
    },
};
