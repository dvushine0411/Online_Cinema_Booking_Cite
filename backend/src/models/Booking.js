import mongoose from "mongoose";

const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    showtimeID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Showtime',
        required: true
    },
    seats: [{
        row: {
            type: String,
            required: true
        },  
        number: {
            type: Number,
            required: true
        },
        seatType: {
            type: String,
            enum: ['Standard', 'VIP', 'Sweetbox']
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Cancelled', 'Refunded'],
        default: 'Pending'
    },
    payment: {
        transactionId: String,
        status: {
            type: String,
            enum: ['Pending', 'Completed', 'Failed'],
            default: 'Pending'
        },
        method: String,
        amount: Number,
        bankCode: String,
        paidAt: Date
    }
  },
  {
    timestamps: true
  }
)


bookingSchema.index({userID: 1});
bookingSchema.index({showtimeID: 1});
bookingSchema.index({createdAt: -1});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
