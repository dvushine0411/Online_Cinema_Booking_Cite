import api from "@/lib/axios";
import type { MovieFilter } from "@/types/movieTypes";
import type { Movie } from "@/types/movieTypes";
import type { ApiResponse, PaginatedResponse } from "@/types/apiTypes";


export const movieService = {
    getAllMovies: async (params?: MovieFilter): Promise<PaginatedResponse<Movie>> => {
        const response = await api.get("movies", { params });
        return response.data;
    },

    getMovieById: async (id: string): Promise<ApiResponse<Movie>> => {
        const response = await api.get(`movies/${id}`);
        return response.data;

    },

    createMovie: async (formData: FormData): Promise<ApiResponse<Movie>> => {
        const response = await api.post("movies/create", formData);
        return response.data;

    },

    deleteMovie: async (id: string): Promise<string> => {
        const response = await api.delete(`movies/delete/${id}`);
        return response.data;
    },

    updateMovie: async (id: string, payload: Partial<Omit<Movie, "_id" | "createdAt" | "updatedAt" | "avgRating" | "reviewCount" | "posterURL">>): Promise<ApiResponse<Movie>> => {
        const response = await api.patch(`movies/update/${id}`, payload);
        return response.data;
    }
}



