export interface Movie {
    _id: string;
    title: string;
    description: string;
    duration: number;
    genres: string[];
    posterURL: string;
    releasedDate: string;
    actors: string[];
    status: "Now Showing" | "Coming Soon";
    avgRating: number;
    reviewCount: number;
    createdAt: string;
    updatedAt: string;
}

// Query params khi filter danh sách phim //

export interface MovieFilter {
    search?: string;
    status?: string;
    page?: string;
    limit?: string;
}

