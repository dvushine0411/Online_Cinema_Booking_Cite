import { VNPay } from 'vnpay';
import Booking from '../models/Booking.js';

const vnpay = new VNPay({
    tmnCode: process.env.VNPAY_TMN_CODE,
    secretKey: process.env.VNPAY_SECRET_KEY,
    vnpayHost: 'https://sandbox.vnpayment.vn',
    testMode: process.env.NODE_ENV !== 'production'

});

// Tạo payment url vnpay //

export const createPayment = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const userId = req.user.id;

        if(!bookingId)
        {
            return res.status(400).json({
                message: "Missing bookingId"
            });
        }

        const booking = await Booking.findById(bookingId);

        if(!booking)
        {
            return res.status(404).json({
                message: "Booking not found!"
            });
        }

        if(booking.userID.toString() !== userId.toString())
        {
            return res.status(403).json({
                message: "Unauthorized to pay for this booking!"
            });
        }

        if(booking.payment.status === 'Completed')
        {
            return res.status(400).json({
                message: "Booking already paid!"
            });
        }

        if(booking.status == 'Cancelled')
        {
            return res.status(400).json({
                message: 'Booking already cancelled'
            });
        }


        const amount = booking.totalAmount;
        const returnUrl = `${process.env.FRONTEND_URL}/payment-callback`;

        const paymentUrl = vnpay.buildPaymentUrl({
            vnp_Amount: amount,
            vnp_IpAddr: req.ip,
            vnp_Locale: 'vn',
            vnp_OrderInfo: `Thanh toán vé xem phim ${bookingId}`,
            vnp_OrderType: 'other',
            vnp_ReturnUrl: returnUrl,
            vnp_TxnRef: `${bookingId}_${Date.now()}`,
            vnp_CreateDate: new Date()

        });

        return res.status(200).json({
            message: 'Payment URL created',
            paymentUrl: paymentUrl,
            bookingId: bookingId,
            amount: amount
        });
        
    } catch (error) {
        console.error('Create payment error', error);
        return res.status(500).json({
            message: 'Error creating payment',
            error: error.message
        });
        
    }

}

export const vnpayCallback = async(req, res) => {
    try {
        const { vnp_Amount, vnp_BankCode, vnp_OrderInfo, vnp_ResponseCode, vnp_TransactionNo, vnp_TxnRef} = req.query;

        const isValid = vnpay.verifyReturnUrl(req.query);

        if(!isValid)
        {
            return res.status(400).json({
                message: 'Invalid callback signature'
            });
        }

        const bookingId = vnp_TxnRef.split('_')[0];
        const transactionId = vnp_TransactionNo;
        const responseCode = vnp_ResponseCode;

        const booking = await Booking.findById(bookingId);

        if(!booking)
        {
            return res.status(404).json({
                message: 'Booking not found!'
            });
        }

        if(responseCode == '00')
        {
            booking.status = 'Confirmed';
            booking.payment = {
                transactionId: transactionId,
                status: 'Completed',
                method: 'VNPay',
                bankCode: vnp_BankCode,
                amount: parseInt(vnp_Amount) / 100,
                paidAt: new Date()

            };

            await booking.save();

            return res.status(200).json({
                message: 'Payment successful',
                bookingId: bookingId,
                transactionId: transactionId,
                status: 'success'
            });
        }

        else 
        {
            booking.payment = {
                status: 'Failed',
                method: 'VNPay',
                responseCode: responseCode

            };

            await booking.save();

            return res.status(200).json({
                message: 'Payment failed',
                bookingId: bookingId,
                responseCode: responseCode,
                status: 'failed'
            });

        }
        
    } catch (error) {
        return res.status(500).json({
            message: 'Error happened payment',
            error: error.message
        });
        
    }
}

export const checkPaymentStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user.id;

        if(!bookingId)
        {
            return res.status(400).json({
                message: 'Mising bookingId'
            });
        }
        
        const booking = await Booking.findById(bookingId);

        if(!booking)
        {
            return res.status(404).json({
                message: 'Booking not found!'
            });
        }

        if(booking.userID.toString() !== userId.toString())
        {
            return res.status(403).json({
                message: 'Unauthorized to check this booking'
            });
        }

        return res.status(200).json({
            message: 'Payment status',
            bookingId: bookingId,
            bookingStatus: booking.status,
            paymentStatus: booking.payment?.status || 'Not initiated',
            paymentMethod: booking.payment?.method,
            amount: booking.totalAmount,
            paidAt: booking.payment?.paidAt,
            transactionId: booking.payment?.transactionId
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error happened!',
            error: error.message
        });   
    }

};

