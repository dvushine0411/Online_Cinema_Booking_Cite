import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useShowtimeStore } from '@/stores/useShowtimeStore'
import { useBookingStore } from '@/stores/useBookingStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useSocketSeat, type SeatStatus } from '@/hooks/useSocketSeat'
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

// ── Countdown hook: đếm ngược số giây còn lại kể từ expiresAt ──
function useCountdown(expiresAt: number | null) {
    const [secondsLeft, setSecondsLeft] = useState<number>(0)

    useEffect(() => {
        if (!expiresAt) {
            setSecondsLeft(0)
            return
        }

        const tick = () => {
            const diff = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
            setSecondsLeft(diff)
        }

        tick()
        const id = setInterval(tick, 1000)
        return () => clearInterval(id)
    }, [expiresAt])

    return secondsLeft
}

export default function BookingPage() {
    const { showtimeId } = useParams<{ showtimeId: string }>()
    const navigate = useNavigate()
    const token = useAuthStore((state) => state.accessToken)

    console.log("=== KIỂM TRA TRƯỚC KHI GỌI SOCKET ===");
    console.log("1. showtimeId:", showtimeId);
    console.log("2. token:", token);

    const { selectedShowtime, isLoading, fetchShowtimeById } = useShowtimeStore()
    const { createBooking, isLoading: bookingLoading } = useBookingStore()

    // Ghế user đang chọn (local state)
    const [selectedSeats, setSelectedSeats] = useState<SeatLayout[]>([])

    // Map<seatId, SeatStatus> — trạng thái real-time từ socket
    const [seatStatusMap, setSeatStatusMap] = useState<Map<string, SeatStatus>>(new Map())

    // Thời điểm hết hạn hold (để hiển thị countdown)
    const [holdExpiresAt, setHoldExpiresAt] = useState<number | null>(null)

    const secondsLeft = useCountdown(holdExpiresAt)

    // ── Socket callbacks ──────────────────────────────────────
    const handleSeatHeld = useCallback((seatId: string) => {
        setSeatStatusMap(prev => new Map(prev).set(seatId, 'held_by_other'))
    }, [])

    const handleSeatReleased = useCallback((seatId: string) => {
        setSeatStatusMap(prev => {
            const next = new Map(prev)
            next.delete(seatId)
            return next
        })
    }, [])

    const handleSeatBooked = useCallback((seatIds: string[]) => {
        setSeatStatusMap(prev => {
            const next = new Map(prev)
            seatIds.forEach(id => next.set(id, 'booked'))
            return next
        })
        // Nếu ghế của mình vừa được confirmed → không cần làm gì thêm,
        // paymentController đã navigate sang trang kết quả thanh toán
    }, [])

    const handleHoldExpired = useCallback((seatId: string) => {
        toast.error(`⏰ Ghế ${seatId} đã hết thời gian giữ! Vui lòng chọn lại.`, { duration: 4000 })

        // Tách seatId "A1" → row = "A", number = 1
        const row = seatId.replace(/\d+/g, '')
        const number = parseInt(seatId.replace(/\D+/g, ''), 10)

        setSelectedSeats(prev => prev.filter(s => !(s.row === row && s.number === number)))
        setSeatStatusMap(prev => {
            const next = new Map(prev)
            next.delete(seatId)
            return next
        })

        // Reset countdown nếu không còn ghế nào đang hold
        setHoldExpiresAt(prev => {
            // Nếu vẫn còn ghế khác đang giữ, giữ nguyên timer (timer đồng hồ chung)
            return prev
        })
    }, [])

    const handleCurrentHeldSeats = useCallback(
        (seats: Array<{ seatId: string; heldByMe: boolean }>) => {
            setSeatStatusMap(prev => {
                const next = new Map(prev)
                seats.forEach(({ seatId, heldByMe }) => {
                    next.set(seatId, heldByMe ? 'held_by_me' : 'held_by_other')
                })
                return next
            })
        },
        []
    )

    // ── Khởi tạo socket ───────────────────────────────────────
    const { holdSeat, releaseSeat } = useSocketSeat({
        showtimeId: showtimeId ?? '',
        token,
        onSeatHeld: handleSeatHeld,
        onSeatReleased: handleSeatReleased,
        onSeatBooked: handleSeatBooked,
        onHoldExpired: handleHoldExpired,
        onCurrentHeldSeats: handleCurrentHeldSeats,
    })

    // ── Fetch dữ liệu suất chiếu ──────────────────────────────
    useEffect(() => {
        if (showtimeId) fetchShowtimeById(showtimeId)
        return () => {
            setSelectedSeats([])
            setSeatStatusMap(new Map())
            setHoldExpiresAt(null)
        }
    }, [showtimeId])

    // ── Loading state ─────────────────────────────────────────
    if (isLoading || !selectedShowtime) {
        return (
            <div className="booking-loading">
                <div className="spinner" />
                <p>Đang tải sơ đồ ghế...</p>
            </div>
        )
    }

    // Danh sách ghế đã booked cứng trong DB
    const bookedSeat = ((selectedShowtime as unknown) as ShowtimeWithBooked).bookedSeat ?? []
    const seatLayouts = selectedShowtime.roomID?.seatLayouts ?? []

    // Nhóm ghế theo hàng
    const rows = seatLayouts.reduce<Record<string, SeatLayout[]>>((acc, seat) => {
        if (!acc[seat.row]) acc[seat.row] = []
        acc[seat.row].push(seat)
        return acc
    }, {})

    // ── Helpers ───────────────────────────────────────────────
    const getPrice = (seatType: SeatLayout['type']): number => {
        const prices = selectedShowtime.ticketPrices
        switch (seatType) {
            case 'VIP': return prices.vip
            case 'Sweetbox': return prices.sweetbox
            default: return prices.standard
        }
    }

    const totalAmount = selectedSeats.reduce((sum, s) => sum + getPrice(s.type), 0)

    // Xác định trạng thái thực tế của ghế:
    // Ưu tiên: DB booked (cứng nhất) > socket map (real-time) > available
    const getSeatEffectiveStatus = (seat: SeatLayout): SeatStatus => {
        const seatId = formatSeatLabel(seat.row, seat.number)
        if (bookedSeat.includes(seatId)) return 'booked'
        return seatStatusMap.get(seatId) ?? 'available'
    }

    const getSeatClass = (seat: SeatLayout): string => {
        const status = getSeatEffectiveStatus(seat)
        const typeClass = `seat--${seat.type.toLowerCase()}`
        const statusClass: Record<SeatStatus, string> = {
            available: '',
            held_by_me: 'seat--selected',      // Đỏ: ghế mình đang giữ
            held_by_other: 'seat--held',        // Vàng: người khác đang giữ
            booked: 'seat--booked',             // Xám: đã đặt xong
        }
        return `seat ${typeClass} ${statusClass[status]}`.trim()
    }

    // ── Xử lý click ghế ──────────────────────────────────────
    const handleSeatClick = (seat: SeatLayout) => {
        const status = getSeatEffectiveStatus(seat)
        const seatId = formatSeatLabel(seat.row, seat.number)

        // Không cho bấm ghế đã booked hoặc người khác đang giữ
        if (status === 'booked' || status === 'held_by_other') return

        if (status === 'held_by_me') {
            // Bỏ chọn → nhả ghế về Map
            releaseSeat(seatId)
            setSelectedSeats(prev => prev.filter(s => !(s.row === seat.row && s.number === seat.number)))
            setSeatStatusMap(prev => {
                const next = new Map(prev)
                next.delete(seatId)
                return next
            })

            // Reset countdown nếu không còn ghế nào
            setSelectedSeats(prev => {
                if (prev.filter(s => !(s.row === seat.row && s.number === seat.number)).length === 0) {
                    setHoldExpiresAt(null)
                }
                return prev.filter(s => !(s.row === seat.row && s.number === seat.number))
            })
            return
        }

        // Chọn thêm ghế mới
        if (selectedSeats.length >= MAX_SEAT_SELECTION) {
            toast.error(`Tối đa ${MAX_SEAT_SELECTION} ghế mỗi lần đặt`)
            return
        }

        holdSeat(seatId)
        setSelectedSeats(prev => [...prev, seat])
        setSeatStatusMap(prev => new Map(prev).set(seatId, 'held_by_me'))

        // Bắt đầu đếm ngược 5 phút từ lúc hold ghế đầu tiên
        setHoldExpiresAt(prev => prev ?? Date.now() + 5 * 60 * 1000)
    }

    // ── Xác nhận đặt chỗ → navigate sang thanh toán ──────────
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

    // ── Format countdown mm:ss ────────────────────────────────
    const formatCountdown = (s: number) => {
        const m = Math.floor(s / 60)
        const sec = s % 60
        return `${m}:${sec.toString().padStart(2, '0')}`
    }

    // ── Render ────────────────────────────────────────────────
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
                                                .map(seat => {
                                                    const status = getSeatEffectiveStatus(seat)
                                                    const isDisabled = status === 'booked' || status === 'held_by_other'
                                                    return (
                                                        <button
                                                            key={`${seat.row}${seat.number}`}
                                                            className={getSeatClass(seat)}
                                                            onClick={() => handleSeatClick(seat)}
                                                            disabled={isDisabled}
                                                            title={
                                                                status === 'held_by_other'
                                                                    ? `${seat.row}${seat.number} - Đang được giữ`
                                                                    : status === 'booked'
                                                                        ? `${seat.row}${seat.number} - Đã đặt`
                                                                        : `${seat.row}${seat.number} - ${seat.type}`
                                                            }
                                                        >
                                                            {seat.number}
                                                        </button>
                                                    )
                                                })}
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
                                <span className="seat seat--held" />
                                <span>Đang được giữ</span>
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

                            {/* Countdown timer — chỉ hiện khi đang giữ ghế */}
                            {holdExpiresAt && selectedSeats.length > 0 && (
                                <div className={`booking-countdown ${secondsLeft <= 60 ? 'booking-countdown--urgent' : ''}`}>
                                    ⏱ Thời gian giữ ghế: <strong>{formatCountdown(secondsLeft)}</strong>
                                </div>
                            )}

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
                                disabled={selectedSeats.length === 0 || bookingLoading}
                            >
                                {bookingLoading ? 'Đang xử lý...' : '💳 Tiến hành thanh toán'}
                            </button>
                        </div>
                    </aside>
                </div>

            </div>
        </div>
    )
}
