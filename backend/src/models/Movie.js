import mongoose from "mongoose";

const Schema = mongoose.Schema;

const movieSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    duration: {
        type: Number,
        required: true
    },
    genres: Array,
    posterURL: {
        type: String,
        required: true
    },
    releasedDate: {
        type: Date,
        required: true
    },
    actors: {
        type: Array,
        default: []
    },
    status: {
        type: String,
        enum: ['Now Showing', 'Coming Soon']
    }
  },
  {
    timestamps: true

})

const Movie = mongoose.model('Movie', movieSchema);
export default Movie;
