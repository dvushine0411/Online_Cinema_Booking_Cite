import mongoose from "mongoose";

const Schema = mongoose.Schema;

const newsSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    thumbnailURL: {
        type: String,
        default: ''
    },

    category: {
        type: String,
        enum: ['Khuyến mãi', 'Phim mới', 'Thông báo', 'Sự kiện']
    },
    authorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    commentCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
}
);

const News = mongoose.model('News', newsSchema);
export default News;
