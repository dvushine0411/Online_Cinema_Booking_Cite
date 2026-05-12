import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

const newsStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'news_images',                              // Folder riêng cho news
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif']
    }
});

const uploadNews = multer({ storage: newsStorage });

export default uploadNews;
