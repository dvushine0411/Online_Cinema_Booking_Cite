import express from 'express';
import { createBooking, getAllBookings, getUserBookings, getBookingById, updateBookingStatus, cancelBooking, updateBookingStatus } from '../controllers/bookingController';
import { verifyJWT } from '../middlewares/verifyJWT';
import { verifyAdmin } from '../middlewares/verifyAdmin';


const router = express.Router();


// User only //

router.post('/', verifyJWT, createBooking);
router.get('/my-bookings', verifyJWT, getUserBookings);
router.delete('/:id', verifyJWT, cancelBooking);

// Admin only //

router.get('/', verifyJWT, verifyAdmin, getAllBookings);
router.get('/:id', verifyJWT, verifyAdmin, getBookingById);
router.patch('/:id', verifyJWT, verifyAdmin, updateBookingStatus);


export default router;



