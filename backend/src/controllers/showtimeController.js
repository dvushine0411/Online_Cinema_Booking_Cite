import Showtime from "../models/Showtime.js";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";
import Room from "../models/Room.js";
import { checkConflict, getAvailableTimeSlots, formatConflictMessage } from "../helpers/showtimeHelpers.js";


export const getAllShowtimes = async (req, res) => {
    try {
        const { movieID, roomID, date, startDate, endDate } = req.query;

        let queryCondition = {};

        if (movieID) {
            queryCondition.movieID = movieID;
        }

        if (roomID) {
            queryCondition.roomID = roomID;
        }

        if (date) {
            const start = new Date(date);
            const end = new Date(date);

            end.setHours(23, 59, 59, 999);
            queryCondition.startTime =
            {
                $gte: start,
                $lte: end
            }
        }

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            queryCondition.startTime =
            {
                $gte: start,
                $lte: end
            };
        }

        const showtimes = await Showtime.find(queryCondition)
            .populate('movieID')
            .populate('roomID')
            .sort({ startTime: 1 });

        return res.status(200).json({
            message: 'Successfully fetched showtimes',
            data: showtimes

        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error happened!',
            error: error.message
        });

    }

}

export const getShowtimeById = async () => {
    try {
        const { id } = req.params;

        const showtime = await Showtime.findById(id)
            .populate('movieID')
            .populate('roomID')

        if (!showtime) {
            return res.status(404).json({
                message: 'Showtime not found!',
            })
        }

        return res.status(200).json({
            message: 'Successfully fetched showtime',
            data: showtime
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error happened!',
            error: error.message
        });

    }
}

export const getShowtimesByMovieId = async (req, res) => {
    try {
        const { movieID } = req.params;
        const { date, startDate, endDate } = req.query;

        let queryCondition = { movieID };

        if (date) {
            const start = new Date(date);
            const end = new Date(date);

            end.setHours(23, 59, 59, 999);

            queryCondition.startTime = {
                $gte: start,
                $lte: end
            };

        }

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            queryCondition.startTime = {
                $gte: start,
                $lte: end
            };
        }

        const showtimes = await Showtime.find(queryCondition)
            .populate('movieID')
            .populate('roomID')
            .sort({ startTime: 1 });

        if (showtimes.length == 0) {
            return res.status(404).json({
                message: 'No showtimes found for this movie'
            });
        }

        return res.status(200).json({
            message: 'Successfully fetched showtimes',
            data: showtimes
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error happened!',
            error: error.message
        });

    }

}

export const createShowtime = async (req, res) => {
    try {
        const { movieID, roomID, startTime, endTime, ticketPrices } = req.body;

        if (!movieID || !roomID || !startTime || !endTime) {
            return res.status(400).json({
                message: 'Missing required fields: movieID, roomID, startTime, endTime'
            });

        }

        const movie = await Movie.findById(movieID);

        if (!movie) {
            return res.status(404).json({
                message: 'Movie not found!'
            });
        }

        const start = new Date(startTime);
        const end = new Date(start.getTime() + movie.duration * 60 * 1000);

        const { hasConflicts, conflicts } = await checkConflict(roomID, start, end);

        if (hasConflicts) {
            const availableSlots = await getAvailableTimeSlots(roomID, start, movie.duration);

            return res.status(400).json({
                message: 'Time slot conflict',
                conflictingShowtimes: conflicts,
                suggestedTimeSlots: availableSlots

            });
        }

        const newShowtime = await Showtime.create({
            movieID,
            roomID,
            startTime: start,
            endTime: end,
            ticketPrices: ticketPrices,
            bookedSeat: []

        });

        return res.status(201).json({
            message: 'Successfully created showtime',
            data: newShowtime
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error happened!',
            error: error.message
        });
    }
}


export const updateShowtime = async (req, res) => {
    try {
        const { id } = req.params;
        const { startTime, endTime, ticketPrices } = req.body;

        const showtime = await Showtime.findById(id);

        if (!showtime) {
            return res.status(404).json({
                message: 'Showtime not found'
            });
        }

        if (startTime || endTime) {
            const start = startTime ? new Date(startTime) : showtime.startTime;
            const end = endTime ? new Date(endTime) : showtime.endTime;

            if (start >= end) {
                return res.status(400).json({
                    message: 'startTime must be before endTime'
                });
            }
        }

        const updateData = {};
        if (startTime) updateData.startTime = new Date(startTime);
        if (endTime) updateData.endTime = new Date(endTime);
        if (ticketPrices) updateData.ticketPrices = ticketPrices;

        const updatedShowtime = await Showtime.findByIdAndUpdate(
            id,
            updateData,
            { new: true }

        );

        return res.status(200).json({
            message: 'Successfully updated showtime',
            data: updatedShowtime
        });



    } catch (error) {

        return res.status(500).json({
            message: 'Error happened!',
            error: error.message
        });

    }

}

export const deleteShowtime = async (req, res) => {
    try {
        const { id } = req.params;

        const showtime = await Showtime.findById(id);

        if (!showtime) {
            return res.status(404).json({
                message: 'Showtime not found'
            });
        }

        const bookingCount = await Booking.countDocuments({
            showtimeID: id
        });

        if (bookingCount > 0) {
            return res.status(400).json({
                message: "Cannot delete showtime with exsisting bookings"
            })
        }

        await Showtime.findByIdAndDelete(id);

        return res.status(200).json({
            message: 'Successfully deleted showtime'
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error happened!',
            error: error.message
        });

    }


}