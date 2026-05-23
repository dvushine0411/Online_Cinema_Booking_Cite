import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './protectedRoute';
import AdminRoute from './adminRoute';

// Layouts
import MainLayout from '@/components/layout/MainLayout.tsx'

// Pages — Public
import HomePage from '@/pages/PublicPages/HomePage';
import MovieDetailPage from '@/pages/PublicPages/MovieDetailPage'
import NewsPage from '@/pages/PublicPages/NewsPage'
import NewsDetailPage from '@/pages/PublicPages/NewsDetailPage'

// Pages — Auth
import SignInPage from '@/pages/AuthPages/SignInPage'
import SignUpPage from '@/pages/AuthPages/SignUpPage'

// Pages — User (cần đăng nhập)
import BookingPage from '@/pages/UserPages/BookingPage.tsx'
import PaymentPage from '@/pages/UserPages/PaymentPage.tsx'
import PaymentCallbackPage from '@/pages/UserPages/PaymentCallbackPage.tsx'
import MyBookingsPage from '@/pages/UserPages/MyBookingPage.tsx'

// Pages — Admin
import AdminMoviesPage from '@/pages/AdminPages/AdminMoviesPage.tsx'
import AdminShowtimesPage from '@/pages/AdminPages/AdminShowtimesPage.tsx'
import AdminRoomsPage from '@/pages/AdminPages/AdminRoomsPage.tsx'
import AdminBookingsPage from '@/pages/AdminPages/AdminBookingsPage.tsx'
import AdminNewsPage from '@/pages/AdminPages/AdminNewsPage.tsx'

// 404
import NotFoundPage from '@/pages/PublicPages/NotFoundPage'


export default function AppRouter() {
    return (
        <Routes>
            {/* Public routes — có Navbar + Footer */}
            <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/movies/:id" element={<MovieDetailPage />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/news/:id" element={<NewsDetailPage />} />

                {/* User routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/booking/:showtimeId" element={<BookingPage />} />
                    <Route path="/payment/:bookingId" element={<PaymentPage />} />
                    <Route path="/payment-callback" element={<PaymentCallbackPage />} />
                    <Route path="/my-bookings" element={<MyBookingsPage />} />
                </Route>

                {/* Admin routes */}
                <Route element={<AdminRoute />}>
                    <Route path="/admin/movies" element={<AdminMoviesPage />} />
                    <Route path="/admin/showtimes" element={<AdminShowtimesPage />} />
                    <Route path="/admin/rooms" element={<AdminRoomsPage />} />
                    <Route path="/admin/bookings" element={<AdminBookingsPage />} />
                    <Route path="/admin/news" element={<AdminNewsPage />} />
                </Route>
            </Route>

            {/* Auth routes — không có MainLayout */}
            <Route path="/auth/signin" element={<SignInPage />} />
            <Route path="/auth/signup" element={<SignUpPage />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    )
}
