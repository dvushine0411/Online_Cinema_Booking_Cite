import express from 'express';
import { verifyJWT } from '../middlewares/verifyJWT.js';
import uploadNews from '../middlewares/uploadNews.js';
import {
    uploadNewsImage,
    getAllNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews
} from '../controllers/newsController.js';
import {
    createComment,
    updateComment,
    deleteComment
} from '../controllers/newsCommentController.js';

const router = express.Router();

router.post('/upload-image', verifyJWT, uploadNews.single('image'), uploadNewsImage);

// News route //
router.get('/', getAllNews);
router.get('/:id', getNewsById);
router.post('/', verifyJWT, uploadNews.single('thumbnail'), createNews);
router.patch('/:id', verifyJWT, uploadNews.single('thumbnail'), updateNews);
router.delete('/:id', verifyJWT, deleteNews);

// Comments (lồng trong news) //
router.post('/:newsId/comments', verifyJWT, createComment);
router.patch('/:newsId/comments/:id', verifyJWT, updateComment);
router.delete('/:newsId/comments/:id', verifyJWT, deleteComment);

export default router;
