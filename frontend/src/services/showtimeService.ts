import api from "@/lib/axios";
import type { ApiResponse } from "@/types/apiTypes";
import type { Showtime, ShowtimeFilter, UpdateShowtimePayload, CreateShowtimePayload } from "@/types/showtimeTypes";

export const showtimeService = {
    getAllShowtimes: async (params?: ShowtimeFilter): Promise<ApiResponse<Showtime[]>> => {
        const response = await api.get("showtimes", { params });
        return response.data;

    },

    getShowtimeById: async (id: string): Promise<ApiResponse<Showtime>> => {
        const response = await api.get(`showtimes/${id}`);
        return response.data;

    },

    getShowtimesByMovieId: async (movieID: string, params?: Pick<ShowtimeFilter, "date" | "startDate" | "endDate">): Promise<ApiResponse<Showtime[]>> => {
        const response = await api.get(`showtimes/${movieID}`, { params });
        return response.data;
    },

    createShowtime: async (payload: CreateShowtimePayload): Promise<ApiResponse<Showtime>> => {
        const response = await api.post("showtimes", payload);
        return response.data;
    },

    updateShowtime: async (id: string, payload: UpdateShowtimePayload): Promise<ApiResponse<Showtime>> => {
        const response = await api.patch(`showtimes/${id}`, payload);
        return response.data;

    },

    deleteShowtime: async (id: string): Promise<ApiResponse<Showtime>> => {
        const response = await api.delete(`showtimes/${id}`);
        return response.data;
    },

}
