import cron from 'node-cron';
import Booking from '../models/Booking.js';
import Showtime from '../models/Showtime.js';
import { forceReleaseSeats } from '../sockets/socketHandler.js';

export const initBookingScheduler = (io) => {
    cron.schedule('* * * * *', async () => {
        console.log('[Booking scheduler] checking for expired bookings...');

        await checkAndCancelExpiredBookings(io);

    });

}

const checkAndCancelExpiredBookings = async (io) => {
    try {
        const now = new Date();

        const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

        const expiredBookings = await Booking.find({

            status: 'Pending',
            createdAt: { $lt: fifteenMinutesAgo }
        }).select('_id showtimeID seats createdAt');

        if (expiredBookings.length === 0) {
            console.log('[Booking scheduler] no expiredBookings to cancel');
            return;
        }

        for (const booking of expiredBookings) {
            const seatIds = booking.seats.map(s => `${s.row}${s.number}`);

            await Showtime.findByIdAndUpdate(
                booking.showtimeID,
                {
                    $pull: { bookedSeat: { $in: seatIds } }
                }
            );

            await Booking.findByIdAndUpdate(
                booking._id,
                { status: 'Cancelled' }
            );

            // Dọn RAM Map: xóa isPaying và broadcast seat_released cho tất cả client
            // Tránh tình huống socket vẫn kết nối nhưng ghế bị kẹt vĩnh viễn trên Map
            forceReleaseSeats(io, booking.showtimeID.toString(), seatIds);

            console.log(`[Booking Scheduler] Cancelled booking ${booking._id} (created at ${booking.createdAt})`);

        }

    } catch (error) {
        console.error('[Booking Scheduler] Error:', error.message);

    }
};

