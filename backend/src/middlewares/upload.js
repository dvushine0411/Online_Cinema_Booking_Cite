import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

// Cấu hình kho lưu trữ (Storage) //
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'movie_posters',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
    }
});

const upload = multer({ storage: storage });

export default upload;



