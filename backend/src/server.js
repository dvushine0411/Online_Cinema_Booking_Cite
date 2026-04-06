import express from 'express';
import ConnectDB from './config/database.js';
import authRoutes from './routes/authRoute.js';
import cookieParser from 'cookie-parser';


const app = express();

app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT;      

app.get('/', (req, res) => {
    res.send('Good luck to you!!!');

})

app.use('/api/auth', authRoutes);



ConnectDB().then(() => {
    console.log('Database connected!');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })
});




