import Showtime from "../models/Showtime.js";

const BUFFER_TIME = 15 * 60 * 1000;

/**
@param {string} roomID
@param {Date} startTime
@param {Date} endTime
@param {string} excludeShowtimeId
@returns {Object}
*/

export const checkConflict = async(roomID, startTime, endTime, excludeShowtimeId = null) => {
    try {
        const newStart = new Date(startTime);
        const newEnd = new Date(endTime);

        const bufferStart = new Date(newStart.getTime() - BUFFER_TIME);
        const bufferEnd = new Date(newEnd.getTime() + BUFFER_TIME);

        let query = {
            roomID,
            $or: [
                { startTime: { $lt: bufferEnd }, endTime: { $gt: bufferStart } }
            ]
        };

        if(excludeShowtimeId)
        {
            query._id = { $ne: excludeShowtimeId };
        }

        const conflicts = await Showtime.find(query)
            .select('_id startTime endTime')
            .sort({startTime: 1});

        return {
            hasConflict: conflicts.length > 0,
            conflicts: conflicts.map((c) => ({
                id: c._id,
                startTime: c.startTime,
                endTime: c.endTime

            }))
        }
        
    } catch (error) {
        throw new Error(`Error checking conflict: ${error.message}`);
    }

}

export const getAvailableTimeSlots = async(roomID, date, movieDuration) => {
    try {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);

        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        const showtimes = await Showtime.find({
            roomID,
            startTime: { $gte: dayStart, $lte: dayEnd}
        })
        .select('startTime endTime')
        .sort({ startTime: 1 });

        // Khai báo thời gian mở cửa của rạp từ 0h đến 24h //

        const operatingStart = new Date(date);
        operatingStart.setHours(0, 0, 0, 0);

        const operatingEnd = new Date(date);
        operatingEnd.setHours(23, 59, 59, 999);

        const slots = [];

        let currentTime = new Date(operatingStart);

        for(const showtime of showtimes)
        {
            const bufferStart = new Date(showtime.startTime.getTime() - BUFFER_TIME);

            if(currentTime < bufferStart)
            {
                slots.push({
                    startTime: new Date(currentTime),
                    endTime: new Date(bufferStart)
                });
            }

            currentTime = new Date(showtime.endTime.getTime() + BUFFER_TIME);

        }

        if(currentTime < operatingEnd)
        {
            slots.push({
                startTime: new Date(currentTime),
                endTime: new Date(operatingEnd)
            });

        }

        return slots.filter(slot => {
            const durationMs = movieDuration * 60 * 1000;
            return (slot.endTime - slot.startTime) >= durationMs;

        });
        
    } catch (error) {
        throw new Error(`Error getting available slots: ${error.message}`);
        
    }


}

/**
@param {Array} conflicts
@returns {string}
 */

export const formatConflictMessage = (conflicts) => {
    if(conflicts.length == 0)
    {
        return '';
    }

    const conflictList = conflicts.map(c => {
        const start = new Date(c.startTime).toLocaleDateString('vi-VN');
        const end = new Date(c.endTime).toLocaleDateString('vi-VN');
        return `${start} - ${end}`;
    })
    .join(', ');

    return `Time slot conflicts with existing showtimes: ${conflictList}. Please choose a different time with at least 15 minutes buffer.`;

}




