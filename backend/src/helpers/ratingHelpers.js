import Review from '../models/Review.js';
import Movie from '../models/Movie.js';

export const updateMovieRating = async (movieId) => {
    try {
        const reviews = await Review.find({ movieId });
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
        const totalReviews = reviews.length;

        await Movie.findByIdAndUpdate(movieId, {
            avgRating: Math.round(averageRating * 10) / 10,
            reviewCount: totalReviews
        });
    } catch (error) {
        throw new Error(`Error updating movie rating: ${error.message}`);
    }
}   