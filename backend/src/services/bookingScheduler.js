import cron from 'node-cron';
import Booking from '../models/Booking.js';
import Showtime from '../models/Showtime.js';

export const initBookingScheduler = () => {
    cron.schedule('* * * * *', async () => {
        console.log('[Booking scheduler] checking for expired bookings...');

        await checkAndCancelExpiredBookings();

    });

}

const checkAndCancelExpiredBookings = async () => {
    try {
        const now = new Date();

        const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

        const expiredBookings = await Booking.find({

            status: 'Pending',
            createdAt: { $lt: tenMinutesAgo }
        }).select('_id showtimeID seats createdAt');

        if(expiredBookings.length === 0)
        {
            console.log('[Booking scheduler] no expiredBookings to cancel');
            return;
        }

        for(const booking of expiredBookings)
        {
            const seatIds = booking.seats.map(s => `${s.row}${s.number}`);

            await Showtime.findByIdAndUpdate(
                booking.showtimeID,
                {
                    $pull: {bookedSeat: { $in: seatIds}}
                }
            );

            await Booking.findByIdAndUpdate(
                booking._id,
                { status: 'Cancelled'}
            );

            console.log(`[Booking Scheduler] Cancelled booking ${booking._id} (created at ${booking.createdAt})`);

        }
        
    } catch (error) {
        console.error('[Booking Scheduler] Error:', error.message);
        
    }
};

