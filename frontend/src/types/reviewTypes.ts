export interface PopulatedUser {
    _id: string;
    username: string;
    fullname: string;
}

export interface Review {
    _id: string;
    movieId: string;
    userId: PopulatedUser;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateReviewPayload {
    movieId: string;
    rating: number;
    comment?: string;
}

export interface UpdateReviewPayload {
    rating?: number;
    comment?: string;
}



