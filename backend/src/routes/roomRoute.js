import express from 'express';
import { verifyAdmin } from '../middlewares/verifyAdmin.js';
import { verifyJWT } from '../middlewares/verifyJWT.js';
import { createRoom, deleteRoom, getAllRooms, getRoomById, updateRoom } from '../controllers/roomController.js';


const router = express.Router();


router.get('/', verifyJWT, verifyAdmin, getAllRooms);
router.post('/create', verifyJWT, verifyAdmin, createRoom);
router.delete('/delete/:id', verifyJWT, verifyAdmin, deleteRoom);
router.patch('/update/:id', verifyJWT, verifyAdmin, updateRoom);
router.get('/:id', verifyJWT, verifyAdmin, getRoomById);


export default router;