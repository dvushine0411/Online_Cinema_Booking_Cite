import mongoose from "mongoose";

const showtimeSchema = new mongoose.Schema({
    movieID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie'
    },
    roomID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    },  
    bookedSeat: {   
        type: Array,
        default: []   // Mặc định ban đầu là 1 mảng rỗng //
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    ticketPrices: {
        standard: {
            type: Number,
            required: true,
            default: 80000
        },

        vip: {
            type: Number,
            required: true,
            default: 100000
        },

        sweetbox: {
            type: Number,
            required: true,
            default: 120000
        }

    }
})

showtimeSchema.index({startTime: 1});  // Sắp xếp các xuất chiếu theo thứ tự giờ chiếu tăng dần // 

const Showtime = mongoose.model('Showtime', showtimeSchema);
export default Showtime;
