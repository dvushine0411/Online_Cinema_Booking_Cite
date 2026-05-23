import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useBookingStore } from '@/stores/useBookingStore'
import { formatDateTime, formatCurrency } from '@/lib/utils'
import { BOOKING_STATUS_COLOR } from '@/lib/constants'
import './MyBookingPage.css'

export default function MyBookingsPage() {
    const { myBookings, isLoading, fetchMyBookings } = useBookingStore()

    useEffect(() => {
        fetchMyBookings()
    }, [])

    return (
        <div className="my-bookings fade-in">
            <div className="container">
                <h1 className="section-title">Vé của tôi <span>🎟️</span></h1>

                {isLoading ? (
                    <div className="my-bookings__loading">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="booking-skeleton" />
                        ))}
                    </div>
                ) : myBookings.length === 0 ? (
                    <div className="my-bookings__empty">
                        <p>🎬 Bạn chưa có vé nào.</p>
                        <Link to="/" className="btn-primary">Khám phá phim ngay</Link>
                    </div>
                ) : (
                    <div className="booking-list">
                        {myBookings.map((b) => (
                            <div key={b._id} className="booking-card">
                                <div className="booking-card__poster">
                                    <img
                                        src={b.showtimeID.movieID.posterURL}
                                        alt={b.showtimeID.movieID.title}
                                    />
                                </div>
                                <div className="booking-card__info">
                                    <h3 className="booking-card__title">
                                        {b.showtimeID.movieID.title}
                                    </h3>
                                    <p className="booking-card__time">
                                        📅 {formatDateTime(b.showtimeID.startTime)}
                                    </p>
                                    <p className="booking-card__room">
                                        🎭 {b.showtimeID.roomID.name}
                                    </p>
                                    <p className="booking-card__seats">
                                        💺 {b.seats.map(s => `${s.row}${s.number}`).join(', ')}
                                    </p>
                                </div>
                                <div className="booking-card__right">
                                    <span
                                        className="booking-card__status"
                                        style={{ color: BOOKING_STATUS_COLOR[b.status] }}
                                    >
                                        ● {b.status}
                                    </span>
                                    <span className="booking-card__total">
                                        {formatCurrency(b.totalAmount)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
