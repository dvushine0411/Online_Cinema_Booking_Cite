import mongoose from "mongoose";
import 'dotenv/config';

const ConnectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI);       
    } catch (error) {
        console.error('Đã có lỗi xảy ra');
        
    }
}

export default ConnectDB;