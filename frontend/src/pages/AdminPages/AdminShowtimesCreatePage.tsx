import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { showtimeService } from '@/services/showtimeService'
import { roomService } from '@/services/roomService'
import { movieService } from '@/services/movieService'
import type { Room } from '@/types/roomTypes'
import type { Movie } from '@/types/movieTypes'
import type { Showtime, CreateShowtimePayload } from '@/types/showtimeTypes'
import toast from 'react-hot-toast'
import './AdminPages.css'

// Dữ liệu conflict trả về từ backend khi có xung đột
interface ConflictResponse {
    message: string
    conflictingShowtimes: Showtime[]
    suggestedTimeSlots: { startTime: string; endTime: string }[]
}

type CreateForm = {
    movieID: string
    roomID: string
    startTime: string   // datetime-local input value
    ticketPriceStandard: string
    ticketPriceVip: string
    ticketPriceSweetbox: string
}

const INITIAL_FORM: CreateForm = {
    movieID: '',
    roomID: '',
    startTime: '',
    ticketPriceStandard: '',
    ticketPriceVip: '',
    ticketPriceSweetbox: '',
}

export default function AdminShowtimesCreatePage() {
    const navigate = useNavigate()

    const [form, setForm] = useState<CreateForm>(INITIAL_FORM)
    const [movies, setMovies] = useState<Movie[]>([])
    const [rooms, setRooms] = useState<Room[]>([])
    const [saving, setSaving] = useState(false)
    const [conflict, setConflict] = useState<ConflictResponse | null>(null)

    // Load danh sách phim và phòng
    useEffect(() => {
        movieService.getAllMovies().then(r => setMovies(r.data.data ?? []))
        roomService.getAllRooms().then(r => setRooms(r.data ?? []))
    }, [])

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
        // Reset conflict khi user thay đổi input
        setConflict(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.movieID || !form.roomID || !form.startTime) {
            toast.error('Vui lòng điền đầy đủ thông tin')
            return
        }

        setSaving(true)
        setConflict(null)
        try {
            const payload: CreateShowtimePayload = {
                movieID: form.movieID,
                roomID: form.roomID,
                startTime: new Date(form.startTime).toISOString(),
                endTime: '',   // backend tự tính từ movie.duration
                ticketPrices: {
                    standard: Number(form.ticketPriceStandard),
                    vip: Number(form.ticketPriceVip),
                    sweetbox: Number(form.ticketPriceSweetbox),
                },
            }

            await showtimeService.createShowtime(payload)
            toast.success('Đã tạo suất chiếu mới!')
            navigate('/admin/showtimes')
        } catch (err: any) {
            const data = err.response?.data
            // Backend trả 400 với conflictingShowtimes + suggestedTimeSlots
            if (data?.conflictingShowtimes) {
                setConflict(data)
                toast.error('Khung giờ bị trùng — xem gợi ý bên dưới')
            } else {
                toast.error(data?.message ?? 'Không thể tạo suất chiếu')
            }
        } finally {
            setSaving(false)
        }
    }

    // Khi user chọn 1 khung giờ gợi ý
    const applySuggestedSlot = (startTime: string) => {
        const local = new Date(startTime)
        // Chuyển ISO → format yyyy-MM-ddTHH:mm cho datetime-local input
        const pad = (n: number) => String(n).padStart(2, '0')
        const formatted =
            `${local.getFullYear()}-${pad(local.getMonth() + 1)}-${pad(local.getDate())}` +
            `T${pad(local.getHours())}:${pad(local.getMinutes())}`
        setForm(prev => ({ ...prev, startTime: formatted }))
        setConflict(null)
        toast('Đã áp dụng giờ gợi ý — kiểm tra và nhấn Lưu', { icon: '⏰' })
    }

    const formatDisplay = (iso: string) =>
        new Date(iso).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        })

    return (
        <div className="admin-page fade-in">
            <div className="container">

                {/* Header */}
                <div className="admin-page__header">
                    <div>
                        <h1 className="admin-page__title">Thêm <span>Suất chiếu</span></h1>
                        <p className="admin-page__count">Điền đầy đủ thông tin bên dưới</p>
                    </div>
                    <button className="btn-ghost" onClick={() => navigate('/admin/showtimes')}>
                        ← Quay lại
                    </button>
                </div>

                {/* Form */}
                <div className="admin-edit-wrap">
                    <form className="admin-edit-form" onSubmit={handleSubmit}>

                        {/* Chọn phim */}
                        <div className="admin-form-group">
                            <label className="admin-form-label">
                                Phim <span style={{ color: 'var(--color-red)' }}>*</span>
                            </label>
                            <select
                                className="admin-form-input admin-filter-select"
                                name="movieID"
                                value={form.movieID}
                                onChange={handleChange}
                                required
                            >
                                <option value="">-- Chọn phim --</option>
                                {movies.map(m => (
                                    <option key={m._id} value={m._id}>{m.title}</option>
                                ))}
                            </select>
                        </div>

                        {/* Chọn phòng */}
                        <div className="admin-form-group">
                            <label className="admin-form-label">
                                Phòng chiếu <span style={{ color: 'var(--color-red)' }}>*</span>
                            </label>
                            <select
                                className="admin-form-input admin-filter-select"
                                name="roomID"
                                value={form.roomID}
                                onChange={handleChange}
                                required
                            >
                                <option value="">-- Chọn phòng --</option>
                                {rooms.map(r => (
                                    <option key={r._id} value={r._id}>{r.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Thời gian bắt đầu */}
                        <div className="admin-form-group">
                            <label className="admin-form-label">
                                Giờ bắt đầu <span style={{ color: 'var(--color-red)' }}>*</span>
                            </label>
                            <input
                                className="admin-form-input"
                                type="datetime-local"
                                name="startTime"
                                value={form.startTime}
                                onChange={handleChange}
                                required
                            />
                            <span className="admin-form-hint">
                                Giờ kết thúc sẽ được tự động tính dựa trên thời lượng phim
                            </span>
                        </div>

                        {/* Giá vé */}
                        <div className="admin-form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                            <div className="admin-form-group">
                                <label className="admin-form-label">
                                    Giá Standard (₫) <span style={{ color: 'var(--color-red)' }}>*</span>
                                </label>
                                <input
                                    className="admin-form-input"
                                    type="number"
                                    name="ticketPriceStandard"
                                    value={form.ticketPriceStandard}
                                    onChange={handleChange}
                                    min={0}
                                    placeholder="75000"
                                    required
                                />
                            </div>
                            <div className="admin-form-group">
                                <label className="admin-form-label">
                                    Giá VIP (₫) <span style={{ color: 'var(--color-red)' }}>*</span>
                                </label>
                                <input
                                    className="admin-form-input"
                                    type="number"
                                    name="ticketPriceVip"
                                    value={form.ticketPriceVip}
                                    onChange={handleChange}
                                    min={0}
                                    placeholder="100000"
                                    required
                                />
                            </div>
                            <div className="admin-form-group">
                                <label className="admin-form-label">
                                    Giá Sweetbox (₫) <span style={{ color: 'var(--color-red)' }}>*</span>
                                </label>
                                <input
                                    className="admin-form-input"
                                    type="number"
                                    name="ticketPriceSweetbox"
                                    value={form.ticketPriceSweetbox}
                                    onChange={handleChange}
                                    min={0}
                                    placeholder="150000"
                                    required
                                />
                            </div>
                        </div>

                        {/* Conflict warning + suggestions */}
                        {conflict && (
                            <div className="admin-conflict-box">
                                <p className="admin-conflict-title">⚠️ Khung giờ bị trùng với:</p>
                                <ul className="admin-conflict-list">
                                    {conflict.conflictingShowtimes.map(s => (
                                        <li key={s._id}>
                                            🎬 {s.movieID?.title ?? '—'} — {formatDisplay(s.startTime)} → {formatDisplay(s.endTime)}
                                        </li>
                                    ))}
                                </ul>

                                {conflict.suggestedTimeSlots.length > 0 && (
                                    <>
                                        <p className="admin-conflict-suggest-title">💡 Khung giờ gợi ý:</p>
                                        <div className="admin-conflict-slots">
                                            {conflict.suggestedTimeSlots.map((slot, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    className="admin-conflict-slot-btn"
                                                    onClick={() => applySuggestedSlot(slot.startTime)}
                                                >
                                                    {formatDisplay(slot.startTime)} → {formatDisplay(slot.endTime)}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="admin-form-actions">
                            <button
                                type="button"
                                className="btn-ghost"
                                onClick={() => navigate('/admin/showtimes')}
                            >
                                Huỷ
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={saving}
                            >
                                {saving ? 'Đang lưu...' : '🎬 Thêm suất chiếu'}
                            </button>
                        </div>

                    </form>
                </div>

            </div>
        </div>
    )
}
