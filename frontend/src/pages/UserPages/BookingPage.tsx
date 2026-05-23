import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useShowtimeStore } from '@/stores/useShowtimeStore'
import { useBookingStore } from '@/stores/useBookingStore'
import type { Seat } from '@/types/bookingTypes'
import type { SeatLayout } from '@/types/roomTypes'
import { formatCurrency, formatDateTime, formatSeatLabel } from '@/lib/utils'
import { MAX_SEAT_SELECTION } from '@/lib/constants'
import toast from 'react-hot-toast'
import './BookingPage.css'

// Backend trả về bookedSeat dù type chưa khai báo
type ShowtimeWithBooked = {
    bookedSeat: string[]
}

export default function BookingPage() {
    const { showtimeId } = useParams<{ showtimeId: string }>()
    const navigate = useNavigate()

    const { selectedShowtime, isLoading, fetchShowtimeById } = useShowtimeStore()
    const { createBooking, isLoading: booking } = useBookingStore()

    const [selectedSeats, setSelectedSeats] = useState<SeatLayout[]>([])

    useEffect(() => {
        if (showtimeId) fetchShowtimeById(showtimeId)
        // Reset khi rời trang
        return () => setSelectedSeats([])
    }, [showtimeId])

    if (isLoading || !selectedShowtime) {
        return (
            <div className="booking-loading">
                <div className="spinner" />
                <p>Đang tải sơ đồ ghế...</p>
            </div>
        )
    }

    const bookedSeat = ((selectedShowtime as unknown) as ShowtimeWithBooked).bookedSeat ?? []
    const seatLayouts = selectedShowtime.roomID?.seatLayouts ?? []

    // Nhóm ghế theo hàng để render
    const rows = seatLayouts.reduce<Record<string, SeatLayout[]>>((acc, seat) => {
        if (!acc[seat.row]) acc[seat.row] = []
        acc[seat.row].push(seat)
        return acc
    }, {})

    const getPrice = (seatType: SeatLayout['type']): number => {
        const prices = selectedShowtime.ticketPrices
        switch (seatType) {
            case 'VIP': return prices.vip
            case 'Sweetbox': return prices.sweetbox
            default: return prices.standard
        }
    }

    const totalAmount = selectedSeats.reduce((sum, s) => sum + getPrice(s.type), 0)

    const isSeatBooked = (seat: SeatLayout) =>
        bookedSeat.includes(formatSeatLabel(seat.row, seat.number))

    const isSeatSelected = (seat: SeatLayout) =>
        selectedSeats.some(s => s.row === seat.row && s.number === seat.number)

    const handleSeatClick = (seat: SeatLayout) => {
        if (isSeatBooked(seat)) return

        if (isSeatSelected(seat)) {
            setSelectedSeats(prev => prev.filter(s => !(s.row === seat.row && s.number === seat.number)))
        } else {
            if (selectedSeats.length >= MAX_SEAT_SELECTION) {
                toast.error(`Tối đa ${MAX_SEAT_SELECTION} ghế mỗi lần đặt`)
                return
            }
            setSelectedSeats(prev => [...prev, seat])
        }
    }

    const getSeatClass = (seat: SeatLayout): string => {
        if (isSeatBooked(seat)) return `seat seat--${seat.type.toLowerCase()} seat--booked`
        if (isSeatSelected(seat)) return `seat seat--${seat.type.toLowerCase()} seat--selected`
        return `seat seat--${seat.type.toLowerCase()}`
    }

    const handleConfirm = async () => {
        if (selectedSeats.length === 0) {
            toast.error('Vui lòng chọn ít nhất 1 ghế')
            return
        }
        if (!showtimeId) return

        const payload = {
            showtimeID: showtimeId,
            seats: selectedSeats.map(s => ({
                row: s.row,
                number: s.number,
                seatType: s.type as Seat['seatType'],
            }))
        }

        try {
            const newBooking = await createBooking(payload)
            toast.success('Đặt ghế thành công!')
            navigate(`/payment/${newBooking._id}`)
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? 'Không thể đặt ghế')
        }
    }

    return (
        <div className="booking-page fade-in">
            <div className="container">

                {/* Header info */}
                <div className="booking-header">
                    <h1 className="booking-header__movie">
                        {selectedShowtime.movieID?.title}
                    </h1>
                    <p className="booking-header__time">
                        📅 {formatDateTime(selectedShowtime.startTime)} &nbsp;·&nbsp;
                        🎭 {selectedShowtime.roomID?.name}
                    </p>
                </div>

                <div className="booking-main">
                    {/* Seat Map */}
                    <div className="seatmap">
                        {/* Screen */}
                        <div className="seatmap__screen">
                            <span>Màn hình</span>
                        </div>

                        {/* Rows */}
                        <div className="seatmap__grid">
                            {Object.entries(rows)
                                .sort(([a], [b]) => a.localeCompare(b))
                                .map(([row, seats]) => (
                                    <div key={row} className="seatmap__row">
                                        <span className="seatmap__row-label">{row}</span>
                                        <div className="seatmap__seats">
                                            {seats
                                                .sort((a, b) => a.number - b.number)
                                                .map(seat => (
                                                    <button
                                                        key={`${seat.row}${seat.number}`}
                                                        className={getSeatClass(seat)}
                                                        onClick={() => handleSeatClick(seat)}
                                                        disabled={isSeatBooked(seat)}
                                                        title={`${seat.row}${seat.number} - ${seat.type}`}
                                                    >
                                                        {seat.number}
                                                    </button>
                                                ))}
                                        </div>
                                    </div>
                                ))}
                        </div>

                        {/* Legend */}
                        <div className="seatmap__legend">
                            <div className="legend-item">
                                <span className="seat seat--standard" />
                                <span>Standard ({formatCurrency(selectedShowtime.ticketPrices.standard)})</span>
                            </div>
                            <div className="legend-item">
                                <span className="seat seat--vip" />
                                <span>VIP ({formatCurrency(selectedShowtime.ticketPrices.vip)})</span>
                            </div>
                            <div className="legend-item">
                                <span className="seat seat--sweetbox" />
                                <span>Sweetbox ({formatCurrency(selectedShowtime.ticketPrices.sweetbox)})</span>
                            </div>
                            <div className="legend-item">
                                <span className="seat seat--selected" />
                                <span>Đang chọn</span>
                            </div>
                            <div className="legend-item">
                                <span className="seat seat--booked" />
                                <span>Đã đặt</span>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="booking-sidebar">
                        <div className="booking-summary">
                            <h3 className="booking-summary__title">Tóm tắt đơn</h3>

                            {selectedSeats.length === 0 ? (
                                <p className="booking-summary__empty">Chưa chọn ghế nào</p>
                            ) : (
                                <div className="booking-summary__seats">
                                    {selectedSeats.map(s => (
                                        <div key={`${s.row}${s.number}`} className="booking-summary__seat-row">
                                            <span>
                                                Ghế {s.row}{s.number}
                                                <em className="booking-summary__seat-type"> ({s.type})</em>
                                            </span>
                                            <span>{formatCurrency(getPrice(s.type))}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="booking-summary__total">
                                <span>Tổng cộng</span>
                                <span className="booking-summary__amount">
                                    {formatCurrency(totalAmount)}
                                </span>
                            </div>

                            <button
                                className="btn-primary booking-summary__btn"
                                onClick={handleConfirm}
                                disabled={selectedSeats.length === 0 || booking}
                            >
                                {booking ? 'Đang xử lý...' : '💳 Tiến hành thanh toán'}
                            </button>
                        </div>
                    </aside>
                </div>

            </div>
        </div>
    )
}
