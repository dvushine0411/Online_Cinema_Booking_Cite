import express from 'express';
import { createPayment, vnpayCallback, checkPaymentStatus } from '../controllers/paymentController.js';
import { verifyJWT } from '../middlewares/verifyJWT.js';

const router = express.Router();

router.post('/create', verifyJWT, createPayment);
router.get('/:bookingId', verifyJWT, checkPaymentStatus);

router.get('/vnpay-callback', vnpayCallback);


export default router;
