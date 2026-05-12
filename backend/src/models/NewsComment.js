import mongoose from "mongoose";

const Schema = mongoose.Schema;

const newsCommentSchema = new Schema({
    newsId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'News',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true

    },
    content: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
}
);

const NewsComment = mongoose.model('NewsComment', newsCommentSchema);
export default NewsComment;