import express from 'express';
import {getAllMovies, getMovieById, createMovie, deleteMovie, updateMovie} from '../controllers/movieController.js';
import { verifyJWT } from '../middlewares/verifyJWT.js';
import { verifyAdmin } from '../middlewares/verifyAdmin.js';


const router = express.Router();

router.get('/', getAllMovies);
router.get('/:id', getMovieById);


// router dành riêng cho admin //
router.post('/create', verifyJWT, verifyAdmin, createMovie);
router.delete('/delete/:id', verifyJWT, verifyAdmin, deleteMovie);
router.patch('/update/:id', verifyJWT, verifyAdmin, updateMovie);



export default router;