import NewsComment from "../models/NewsComment.js";
import News from "../models/News.js";



export const createComment = async (req, res) => {
    try {
        const { newsId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!newsId || !content) {
            return res.status(400).json({
                message: 'Missing newsId or content'
            })
        }

        const news = await News.findById(newsId);

        if (!news) {
            return res.status(404).json({
                message: 'News not found'
            })
        }

        const newComment = await NewsComment.create({
            newsId,
            userId,
            content
        });

        await newComment.populate('userId', 'username fullname');

        await News.findByIdAndUpdate(newsId, {
            $inc: { commentCount: 1 }
        });

        return res.status(201).json({
            message: 'Comment created successfully',
            data: newComment
        });


    } catch (error) {
        return res.status(500).json({
            message: 'Error happened',
            error: error.message
        });
    }
}

export const updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        const userId = req.user._id;

        if (!content) {
            return res.status(400).json({
                message: 'Content is required'
            });
        }

        const comment = await NewsComment.findById(id);

        if (!comment) {
            return res.status(404).json({
                message: 'Comment not found'
            });
        }

        if (comment.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                message: 'You are not authorized to update this comment'
            });
        }

        comment.content = content;
        await comment.save();

        await comment.populate('userId', 'username fullname');

        return res.status(200).json({
            message: 'Comment updated successfully',
            data: comment
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error happened',
            error: error.message
        });

    }
}

export const deleteComment = async (req, res) => {
    try {
        const { newsId, id } = req.params;
        const userId = req.user._id;
        const isAdmin = req.user.role === 'admin';

        const comment = await NewsComment.findById(id);
        if (!comment) {
            return res.status(404).json({
                message: 'Comment not found'
            })
        }

        const isOwner = comment.userId.toString() === userId.toString();

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                message: 'You are not authorized to delete this comment'
            });
        }

        await NewsComment.findByIdAndDelete(id);

        await News.findByIdAndUpdate(newsId, {
            $inc: { commentCount: -1 }
        });

        return res.status(200).json({
            message: 'Comment deleted successfully!'
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error happened',
            error: error.message
        })
    }
}





