import mongoose from "mongoose";

const Schema = mongoose.Schema;

const roomSchema = new Schema({
    name: {
        type: String, 
        required: true
    },
    seatLayouts: [{
        row: {
            type: String,
            required: true
        },
        number: {
            type: Number,
            required: true
        },
        type: {
            type: String,
            enum: ['Standard', 'VIP'],
            default: 'Standard'
        }
        
    }]
})

const Room = mongoose.model('Room', roomSchema);
export default Room;


