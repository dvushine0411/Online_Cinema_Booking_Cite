import type { News, NewsComment } from "./newsTypes";

// Response có phân trang //

export interface PaginatedData<T> {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    data: T[];
}

// Response thông thường (không phân trang) //

export interface ApiResponse<T> {
    message: string;
    data: T;
}

// Response có phân trang //

export interface PaginatedResponse<T> {
    message: string;
    data: PaginatedData<T>;
}

// Response khi getNewsById //

export interface NewsDetailResponse {
    message: string;
    data: {
        news: News;
        comments: NewsComment[];
    }
}





