import News from '../models/News.js';
import NewsComment from '../models/NewsComment.js';
import cloudinary from '../config/cloudinary.js';
import { getPagination, formatPaginatedData } from '../helpers/pagination.js';

// Controllers dành cho User //
// Upload 1 ảnh, trả về url để frontend chèn vào textarea //

export const uploadNewsImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: 'Không có file được upload'
            });
        }

        return res.status(200).json({
            message: 'Upload image successfully',
            url: req.file.path
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error happened!',
            error: error.message
        });

    }
}

// Controller dành cho public //
export const getAllNews = async (req, res) => {
    try {
        const { search, category } = req.query;

        const { page, limit, skip } = getPagination(req.query);

        let queryCondition = {};

        if (search) {
            queryCondition.title = { $regex: search, $options: 'i' };
        }

        if (category) {
            queryCondition.category = category;
        }

        const [newsList, totalNews] = await Promise.all([

            News.find(queryCondition)
                .populate('authorId', 'username fullname')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            News.countDocuments(queryCondition)
        ]);

        const result = formatPaginatedData(newsList, page, limit, totalNews);

        return res.status(200).json({
            message: 'List news',
            data: result
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error happened!',
            error: error.message
        });

    }
}

export const getNewsById = async (req, res) => {
    try {
        const { id } = req.params;
        const news = await News.findById(id).populate('authorId', 'username fullname');

        if (!news) {
            return res.status(404).json({
                message: 'News not found'
            });
        }

        const comments = await NewsComment.find({ newsId: id })
            .populate('userId', 'username fullname')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'News found!',
            data: {
                news,
                comments
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error happened!',
            error: error.message
        });

    }
}

// Controllers dành cho Admin or User //

export const createNews = async (req, res) => {
    try {
        const { title, content, category } = req.body;

        const authorId = req.user._id;

        const thumbnailURL = req.file ? req.file.path : '';

        if (!title || !content) {
            return res.status(400).json({
                message: 'Title and content are required'
            });
        }

        const newNews = await News.create({
            title,
            content,
            category,
            thumbnailURL,
            authorId
        });

        await newNews.populate('authorId', 'username fullname');

        return res.status(201).json({
            message: 'News created successfully',
            data: newNews
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error happened!',
            error: error.message
        });

    }
}

export const updateNews = async (req, res) => {
    try {
        const { id } = req.params;

        const { title, content, category } = req.body;

        const userId = req.user._id;

        const news = await News.findById(id);

        if (!news) {
            return res.status(404).json({
                message: 'News not found'
            });
        }

        if (news.authorId.toString() !== userId.toString()) {
            return res.status(403).json({
                message: 'Unauthorized to update this news'
            });
        }

        if (title !== undefined) {
            news.title = title;
        }

        if (content !== undefined) {
            news.content = content;
        }

        if (category !== undefined) {
            news.category = category;
        }

        if (req.file) {
            news.thumbnailURL = req.file.path;
        }

        await news.save();

        await news.populate('authorId', 'username fullname');

        return res.status(200).json({
            message: 'News updated successfully',
            data: news
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error happened!',
            error: error.message
        });
    }
}

export const deleteNews = async (req, res) => {
    try {
        const { id } = req.params;

        const userId = req.user._id;

        const isAdmin = req.user.role === 'Admin';

        const news = await News.findById(id);

        if (!news) {
            return res.status(404).json({
                message: 'News not found'
            });
        }

        if (news.authorId.toString() !== userId.toString() && !isAdmin) {
            return res.status(403).json({
                message: 'Unauthorized to delete this news'
            });
        }

        await NewsComment.deleteMany({ newsId: id });

        await News.findByIdAndDelete(id);

        return res.status(200).json({
            message: 'News deleted successfully'
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error happened!',
            error: error.message
        });

    }
}




