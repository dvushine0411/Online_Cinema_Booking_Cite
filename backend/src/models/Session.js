import mongoose from "mongoose";

const Schema = mongoose.Schema;

const sessionSchema = new Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    refreshToken: {
        type: String,
        required: true
    },
    expiryDate: Date
})

const Session = mongoose.model('Session', sessionSchema);
export default Session;

