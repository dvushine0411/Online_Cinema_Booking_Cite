import express from 'express';
import ConnectDB from './config/database.js';
import authRoutes from './routes/authRoute.js';
import movieRoute from './routes/movieRoute.js';
import roomRoute from './routes/roomRoute.js';
import showtimeRoute from './routes/showtimeRoute.js';
import bookingRoute from './routes/bookingRoute.js';
import paymentRoute from './routes/paymentRoute.js';
import cookieParser from 'cookie-parser';
import { initBookingScheduler } from './services/bookingScheduler.js';



const app = express();

app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT;    

app.get('/', (req, res) => {
    res.send('Good luck to you!!!');

})

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoute);
app.use('/api/rooms', roomRoute);
app.use('/api/showtimes', showtimeRoute);
app.use('/api/booking/', bookingRoute);
app.use('/api/payments', paymentRoute);



ConnectDB().then(() => {
    console.log('Database connected!');
    initBookingScheduler();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })
});




