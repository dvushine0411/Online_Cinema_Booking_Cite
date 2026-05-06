import express from 'express';
import { verifyAdmin } from '../middlewares/verifyAdmin.js';
import { verifyJWT } from '../middlewares/verifyJWT.js';
import { createShowtime, deleteShowtime, updateShowtime, getAllShowtimes, getShowtimeById, getShowtimesByMovieId } from '../controllers/showtimeController.js';


const router = express.Router();

// Public Routes //

router.get('/', getAllShowtimes);
router.get('/:id', getShowtimeById);
router.get('/:movieID', getShowtimesByMovieId);

// Admin Routes //
router.post('/', verifyJWT, verifyAdmin, createShowtime);
router.put('/:id', verifyJWT, verifyAdmin, updateShowtime);
router.delete('/:id', verifyJWT, verifyAdmin, deleteShowtime);

export default router;


