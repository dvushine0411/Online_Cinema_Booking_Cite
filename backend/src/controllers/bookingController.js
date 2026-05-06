import express from 'express';
import Booking from '../models/Booking.js';
import Showtime from '../models/Showtime.js';
import User from '../models/User.js';

// Hàm dành cho user //

export const createBooking = async (req, res) => {
    try {
        const { showtimeID, seats } = req.body;  // Chọn ghế và showtimeId để chọn chỗ ngồi và thời gian chiếu phim // 
        const userId = req.user.id;

        if(!showtimeID || !seats || seats.length == 0)
        {
            return res.status(400).json({
                message: "Mising required fields"
            });
        }

        const showtime = await Showtime.findById(showtimeID);

        if(!showtime)
        {
            return res.status(404).json({
                message: "Showtime not found!"
            });
        }

        const seatIds = seats.map(s => `${s.row}${s.number}`);

        // Cập nhật showtime bằng cách cập nhật các ghế đã được đặt // 
        const updatedShowtime = await Showtime.findOneAndUpdate(
            {
                _id: showtimeID,
                bookedSeat: {$nin: seatIds}
            },
            {
                $push: {bookedSeat: {$each: seats}}
            },
            {
                new: true
            }
        );

        // Nếu trả về showtime = false tức là ghế đã đc đặt thì trả về kết quả json như sau: //
        if(!updatedShowtime)
        {
            return res.status(400).json({
                message: "One of the seats is already booked!"
            });
            
        }

        let totalAmount = 0;
        seats.forEach(seat => {
            const type = seat.seatType.toLowerCase();
            const price = showtime.ticketPrices[type] || showtime.ticketPrices['standard'];
        
            totalAmount += price;

        });


        const newBooking = await Booking.create({
            userID: userId,
            showtimeID,
            seats,
            totalAmount,
            status: "Pending"
        });


        return res.status(201).json({
            message: "Successfully booked",
            data: newBooking
        })
        
    } catch (error) {
        return res.status(500).json({
            message: "Error happened!",
            error: error.message
        });
    }

}

export const getAllBookings = async (req, res) => {
    try {
        const { status, userId } = req.query;

        let queryCondition = {};

        if(status)
        {
            queryCondition.status = status;
        }

        if(userId)
        {
            queryCondition.userID = userId;
        }

        const bookings = await Booking.find(queryCondition)
            .populate('userID', 'name email')
            .populate('showtimeID')
            .sort({createdAt: -1});
        
        return res.status(200).json({
            message: "Successfully fetched user bookings",
            data: bookings,
            total: bookings.length
        });
        
    } catch (error) {
        return res.status(500).json({
            message: 'Error happened!',
            error: error.message
        });
        
    }
}

export const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await Booking.findById(id)
            .populate('userID', 'name email phone')
            .populate('showtimeID');
        
        if(!booking)
        {
            return res.status(404).json({
                message: 'Booking not found!'
            });
        }

        return res.status(200).json({
            message: "Successfully fetched booking",
            data: booking
        });
        
    } catch (error) {
        return res.status(500).json({
            message: 'Error happened!',
            error: error.message
        });        
    }

}

export const cancelBooking = async(req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const booking = Booking.findById(id);

        if(!booking)
        {
            return res.status(404).json({
                message: "Booking not found!"
            });
        }
        
        if(booking.userID.toString() !== userId.toString())
        {
            return res.status(403).json({
                message: "Unauthorized to cancel this booking"
            });
        }

        const showtime = await Showtime.findById(booking.showtimeID);

        const now = new Date();
        const timeUntilShowtime = showtime.startTime - now;

        const thirtyMinutesMs = 30 * 60 * 1000;

        if(timeUntilShowtime < thirtyMinutesMs)
        {
            return res.status(400).json({
                message: "Cannot cancel booking within 30 minutes before showtime"

            });
        }

        const seatIds = booking.seats.map(s => `${s.row}${s.number}`);

        await Showtime.findByIdAndUpdate(
            booking.showtimeID,
            {
                $pull: { bookedSeat: { $in: seatIds } }
            }

        );

        booking.status = 'Cancelled';
        await booking.save();

        return res.status(200).json({
            message: "Successfully cancelled booking",
            data: booking
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error happened!',
            error: error.message
        });
        
    }

}

export const updateBookingStatus = async(req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Refunded'];

        if(!validStatuses.includes(status))
        {
            return res.status(400).json({
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        const booking = await Booking.findByIdAndUpdate(
            id, 
            { status },
            { new: true }
        );

        if(!booking)
        {
            return res.status(404).json({
                message: 'Booking not found!'
            });
        }
        
    } catch (error) {
        return res.status(500).json({
            message: 'Error happened!',
            error: error.message
        });
    }

}

export const getUserBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status } = req.query;

        let queryCondition = { userID: userId };

        if(status)
        {
            queryCondition.status = status;
        }

        const bookings = await Booking.find(queryCondition)
            .populate('showtimeID')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Successfully fetched user bookings",
            data: bookings,
            total: bookings.length
        });
        
    } catch (error) {
        return res.status(500).json({
            message: "Error happened!",
            error: error.message
        });
        
    }
}




