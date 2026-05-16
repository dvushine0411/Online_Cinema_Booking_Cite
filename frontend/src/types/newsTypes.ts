import type { PopulatedUser } from "./reviewTypes";

export interface News {
    _id: string;
    title: string;
    content: string;
    thumbnailURL: string;
    category: "Khuyến mãi" | "Phim mới" | "Thông báo" | "Sự kiện";
    authorId: PopulatedUser;
    commentCount: number;
    createdAt: string;
    updatedAt: string;
}

// Comment trong bài viết //

export interface NewsComment {
    _id: string;
    newsId: News;
    userId: PopulatedUser;
    content: string;
    createdAt: string;
    updatedAt: string;

}

// Dữ liệu gửi lên khi tạo bài viết //

export interface CreateNewsPayload {
    title: string;
    content: string;
    category: "Khuyến mãi" | "Phim mới" | "Thông báo" | "Sự kiện";
}

// Response từ POST news/upload-image //

export interface UploadImageResponse {
    message: string;
    url: string;
}

export interface NewsFilter {
    search?: string;
    category?: string;
    page?: string;
    limit?: string;
}

