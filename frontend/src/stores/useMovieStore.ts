import { create } from "zustand";
import { movieService } from "@/services/movieService";
import type { Movie, MovieFilter } from "@/types/movieTypes";
import type { PaginatedData } from "@/types/apiTypes";


interface MovieState {
    movies: PaginatedData<Movie> | null;
    selectedMovie: Movie | null;
    isLoading: boolean;
    error: string | null;

    fetchMovies: (params?: MovieFilter) => Promise<void>;
    fetchMovieById: (id: string) => Promise<void>;
    clearSelectedMovie: () => void;
    clearError: () => void;
}


export const useMovieStore = create<MovieState>((set) => ({
    movies: null,
    selectedMovie: null,
    isLoading: false,
    error: null,

    fetchMovies: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const response = await movieService.getAllMovies(params);
            set({ movies: response.data });
        } catch (err: any) {
            set({ error: err.response?.data?.message ?? "Lỗi tải danh sách phim" });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchMovieById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await movieService.getMovieById(id);
            set({ selectedMovie: response.data });
        } catch (err: any) {
            set({ error: err.response?.data?.message ?? "Lỗi tải thông tin phim" });
        } finally {
            set({ isLoading: false });
        }
    },

    clearSelectedMovie: () => set({ selectedMovie: null }),
    clearError: () => set({ error: null }),
}));
