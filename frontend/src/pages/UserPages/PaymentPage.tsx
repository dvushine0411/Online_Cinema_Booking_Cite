import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBookingStore } from '@/stores/useBookingStore'
import { paymentService } from '@/services/paymentService'
import { formatCurrency, formatDateTime, formatSeatLabel } from '@/lib/utils'
import toast from 'react-hot-toast'
import './PaymentPage.css'

export default function PaymentPage() {
    const { bookingId } = useParams<{ bookingId: string }>()
    const navigate = useNavigate()
    const { selectedBooking, isLoading, fetchBookingById } = useBookingStore()
    const [paying, setPaying] = useState(false)

    useEffect(() => {
        if (bookingId) fetchBookingById(bookingId)
    }, [bookingId])

    const handlePayment = async () => {
        if (!bookingId) return
        setPaying(true)
        try {
            const data = await paymentService.createPayment(bookingId)
            // Redirect sang VNPay
            window.location.href = data.paymentUrl
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? 'Không thể tạo liên kết thanh toán')
            setPaying(false)
        }
    }

    const handleCancel = () => {
        navigate(-1)
    }

    if (isLoading || !selectedBooking) {
        return (
            <div className="payment-loading">
                <div className="spinner" />
                <p>Đang tải thông tin đơn hàng...</p>
            </div>
        )
    }

    const { showtimeID, seats, totalAmount, status } = selectedBooking

    // Nếu đã thanh toán hoặc huỷ thì redirect
    if (status === 'Confirmed' || status === 'Cancelled') {
        navigate('/my-bookings')
        return null
    }

    return (
        <div className="payment-page fade-in">
            <div className="container payment-page__inner">

                {/* Order Summary */}
                <div className="payment-order">
                    <h1 className="payment-order__title">Xác nhận đơn hàng</h1>

                    {/* Movie info */}
                    <div className="payment-movie">
                        <img
                            src={showtimeID.movieID?.posterURL}
                            alt={showtimeID.movieID?.title}
                            className="payment-movie__poster"
                        />
                        <div className="payment-movie__info">
                            <h2 className="payment-movie__title">{showtimeID.movieID?.title}</h2>
                            <p>📅 {formatDateTime(showtimeID.startTime)}</p>
                            <p>🎭 {showtimeID.roomID?.name}</p>
                        </div>
                    </div>

                    {/* Seats */}
                    <div className="payment-seats">
                        <h3>Ghế đã chọn</h3>
                        <div className="payment-seats__list">
                            {seats.map((seat) => (
                                <div key={`${seat.row}${seat.number}`} className="payment-seat-item">
                                    <span className={`payment-seat-badge payment-seat-badge--${seat.seatType.toLowerCase()}`}>
                                        {formatSeatLabel(seat.row, seat.number)}
                                    </span>
                                    <span className="payment-seat-type">{seat.seatType}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total */}
                    <div className="payment-total">
                        <span>Tổng thanh toán</span>
                        <span className="payment-total__amount">
                            {formatCurrency(totalAmount)}
                        </span>
                    </div>
                </div>

                {/* Payment Panel */}
                <div className="payment-panel">
                    <h2 className="payment-panel__title">Phương thức thanh toán</h2>

                    <div className="payment-method">
                        <div className="payment-method__card payment-method__card--active">
                            <span className="payment-method__logo">🏦</span>
                            <div>
                                <p className="payment-method__name">VNPay</p>
                                <p className="payment-method__desc">Internet Banking / ATM / QR Code</p>
                            </div>
                            <span className="payment-method__check">✓</span>
                        </div>
                    </div>

                    <div className="payment-panel__notice">
                        <p>🔒 Thanh toán bảo mật qua cổng VNPay. Bạn sẽ được chuyển đến trang thanh toán của VNPay.</p>
                    </div>

                    <div className="payment-panel__actions">
                        <button
                            className="btn-primary payment-panel__pay-btn"
                            onClick={handlePayment}
                            disabled={paying}
                        >
                            {paying ? '⏳ Đang chuyển hướng...' : `💳 Thanh toán ${formatCurrency(totalAmount)}`}
                        </button>
                        <button
                            className="btn-ghost payment-panel__cancel-btn"
                            onClick={handleCancel}
                            disabled={paying}
                        >
                            ← Quay lại
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}
