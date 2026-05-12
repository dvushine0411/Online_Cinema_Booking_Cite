import Review from '../models/Review.js';
import Movie from '../models/Movie.js';
import { updateMovieRating } from '../helpers/ratingHelpers.js';


// Các controllers dành cho user //
export const createReview = async (req, res) => {
    try {
        const { movieId, rating, comment } = req.body;

        const userId = req.user.id;

        if (!movieId || !rating) {
            return res.status(400).json({
                message: 'Missing required fields'
            });
        }

        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).json({
                message: 'Movie not found'
            });
        }

        const existReview = await Review.findOne({
            movieId,
            userId
        });

        if (existReview) {
            return res.status(400).json({
                message: 'You have already reviewed this movie!'
            });
        }

        const newReview = await Review.create({
            movieId,
            userId,
            rating,
            comment
        });

        await newReview.populate('userId', 'username fullname');

        await updateMovieRating(movieId);

        return res.status(201).json({
            message: 'Review created successfully',
            data: newReview
        });


    } catch (error) {
        return res.status(500).json({
            message: 'Error happened!',
            error: error.message
        });

    }
}

export const getReviewsByMovieId = async (req, res) => {
    try {
        const movieId = req.params.movieId;

        const reviews = await Review.find({ movieId })
            .populate('userId', 'username fullname')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'Reviews fetched successfully',
            data: reviews
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error happened!',
            error: error.message
        });

    }
}

export const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;

        const userId = req.user._id;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                message: 'Review not found'
            });
        }

        if (review.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                message: 'Forbidden to fix this review'
            });
        }

        if (rating !== undefined) {
            review.rating = rating;
        }

        if (comment !== undefined) {
            review.comment = comment;
        }

        await review.save();

        await updateMovieRating(review.movieId);

        await review.populate('userId', 'username fullname');

        return res.status(200).json({
            message: 'Review updated successfully',
            data: review
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error happened!',
            error: error.message
        });

    }
}

// Controller dành cho admin hoặc ownwer //

export const deleteReviews = async (req, res) => {
    try {
        const { id } = req.params;

        const userId = req.user.id;
        const isAdmin = req.user.role === 'Admin';

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                message: 'Review not found'
            });
        }

        const isOwner = review.userId.toString() === userId.toString();

        if (!isAdmin && !isOwner) {
            return res.status(403).json({
                message: 'Không có quyền xoá đánh giá này'
            });
        }

        const movieId = review.movieId;

        await Review.findByIdAndDelete(id);

        await updateMovieRating(movieId);

        return res.status(200).json({
            message: 'Review deleted successfully'
        });


    } catch (error) {
        return res.status(500).json({
            message: 'Error happened!',
            error: error.message
        });

    }
}
