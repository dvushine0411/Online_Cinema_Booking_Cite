import express from 'express';
import { verifyJWT } from '../middlewares/verifyJWT.js';
import {
    createReview,
    getReviewsByMovieId,
    updateReview,
    deleteReviews
} from '../controllers/reviewController.js';

const router = express.Router();

router.post('/', verifyJWT, createReview)

router.get('/:movieId', getReviewsByMovieId);

router.put('/:id', verifyJWT, updateReview);

router.delete('/:id', verifyJWT, deleteReviews);

export default router;


