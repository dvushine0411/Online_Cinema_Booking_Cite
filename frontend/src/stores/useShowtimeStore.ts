import { create } from "zustand";
import { showtimeService } from "@/services/showtimeService";
import type { Showtime, ShowtimeFilter } from "@/types/showtimeTypes";


interface ShowtimeState {
    showtimes: Showtime[];
    selectedShowtime: Showtime | null;
    isLoading: boolean;
    error: string | null;

    fetchShowtimes: (params?: ShowtimeFilter) => Promise<void>;
    fetchShowtimeById: (id: string) => Promise<void>;
    fetchShowtimesByMovieId: (
        movieID: string,
        params?: Pick<ShowtimeFilter, "date" | "startDate" | "endDate">
    ) => Promise<void>;
    clearSelectedShowtime: () => void;
    clearError: () => void;
}


export const useShowtimeStore = create<ShowtimeState>((set) => ({
    showtimes: [],
    selectedShowtime: null,
    isLoading: false,
    error: null,

    fetchShowtimes: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const response = await showtimeService.getAllShowtimes(params);
            set({ showtimes: response.data });
        } catch (err: any) {
            set({ error: err.response?.data?.message ?? "Lỗi tải suất chiếu" });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchShowtimeById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await showtimeService.getShowtimeById(id);
            set({ selectedShowtime: response.data });
        } catch (err: any) {
            set({ error: err.response?.data?.message ?? "Lỗi tải suất chiếu" });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchShowtimesByMovieId: async (movieID, params) => {
        set({ isLoading: true, error: null });
        try {
            const response = await showtimeService.getShowtimesByMovieId(movieID, params);
            set({ showtimes: response.data });
        } catch (err: any) {
            set({ error: err.response?.data?.message ?? "Lỗi tải suất chiếu" });
        } finally {
            set({ isLoading: false });
        }
    },

    clearSelectedShowtime: () => set({ selectedShowtime: null }),
    clearError: () => set({ error: null }),
}));
