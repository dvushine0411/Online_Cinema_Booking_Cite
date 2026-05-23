import { useEffect, useState } from 'react'
import { reviewService } from '@/services/reviewService'
import type { Review } from '@/types/reviewTypes'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import './ReviewSection.css'

interface Props {
    movieId: string
    isAuthenticated: boolean
    currentUserId?: string
}

// Chuyển đổi rating 0-10 → số sao 0-5 để hiển thị
const toStars = (rating: number) => Math.round(rating / 2)

// Hiển thị thời gian tương đối
const timeAgo = (dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins} phút trước`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs} giờ trước`
    const days = Math.floor(hrs / 24)
    if (days < 7) return `${days} ngày trước`
    return formatDate(dateStr)
}

// Render sao tĩnh inline (★ màu vàng / xám)
function InlineStars({ rating }: { rating: number }) {
    const filled = toStars(rating)
    return (
        <span className="rs-inline-stars">
            {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < filled ? 'rs-star rs-star--on' : 'rs-star'}>★</span>
            ))}
        </span>
    )
}

// Render sao interactive (click để chọn)
function InteractiveStars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const [hovered, setHovered] = useState(0)
    const active = hovered || toStars(value)
    return (
        <span className="rs-inline-stars rs-inline-stars--lg">
            {Array.from({ length: 5 }).map((_, i) => (
                <span
                    key={i}
                    className={`rs-star rs-star--interactive ${i < active ? 'rs-star--on' : ''}`}
                    onMouseEnter={() => setHovered(i + 1)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => onChange((i + 1) * 2)} // convert 1-5 → 2-10
                >★</span>
            ))}
        </span>
    )
}

export default function ReviewSection({ movieId, isAuthenticated, currentUserId }: Props) {
    const [reviews, setReviews] = useState<Review[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [myReview, setMyReview] = useState<Review | null>(null)

    // Form tạo mới
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [showForm, setShowForm] = useState(false)

    // Trạng thái edit
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editRating, setEditRating] = useState(0)
    const [editComment, setEditComment] = useState('')

    const fetchReviews = async () => {
        setIsLoading(true)
        try {
            const res = await reviewService.getReviewsByMovieId(movieId)
            setReviews(res.data)
            if (currentUserId) {
                setMyReview(res.data.find(r => r.userId._id === currentUserId) ?? null)
            }
        } catch {
            toast.error('Không thể tải đánh giá')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => { fetchReviews() }, [movieId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (rating === 0) { toast.error('Vui lòng chọn số sao'); return }
        setSubmitting(true)
        try {
            await reviewService.createReview({ movieId, rating, comment })
            toast.success('Đã gửi đánh giá!')
            setRating(0); setComment(''); setShowForm(false)
            fetchReviews()
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? 'Không thể gửi đánh giá')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Xoá đánh giá này?')) return
        try {
            await reviewService.deleteReview(id)
            toast.success('Đã xoá đánh giá')
            fetchReviews()
        } catch {
            toast.error('Không thể xoá đánh giá')
        }
    }

    const startEdit = (r: Review) => {
        setEditingId(r._id)
        setEditRating(r.rating)
        setEditComment(r.comment ?? '')
    }

    const handleUpdate = async () => {
        if (!editingId) return
        setSubmitting(true)
        try {
            await reviewService.updateReview(editingId, { rating: editRating, comment: editComment })
            toast.success('Đã cập nhật đánh giá')
            setEditingId(null)
            fetchReviews()
        } catch {
            toast.error('Không thể cập nhật')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <section className="container movie-section">
            {/* ── Tiêu đề ── */}
            <h2 className="rs-title">
                Cộng đồng <span className="rs-title__count">({reviews.length})</span>
            </h2>

            {/* ── Nút viết đánh giá ── */}
            {isAuthenticated && !myReview && !showForm && (
                <div className="rs-write-btn-wrap">
                    <button className="rs-write-btn" onClick={() => setShowForm(true)}>
                        ✏️ Viết đánh giá
                    </button>
                </div>
            )}

            {/* ── Form gửi đánh giá ── */}
            {isAuthenticated && !myReview && showForm && (
                <form onSubmit={handleSubmit} className="rs-form">
                    <p className="rs-form__label">Chọn số sao</p>
                    <InteractiveStars value={rating} onChange={setRating} />
                    <textarea
                        className="rs-form__textarea"
                        placeholder="Chia sẻ cảm nhận của bạn về bộ phim..."
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        rows={3}
                    />
                    <div className="rs-form__actions">
                        <button type="submit" className="btn-primary" disabled={submitting}>
                            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                            Huỷ
                        </button>
                    </div>
                </form>
            )}

            {/* ── Chưa đăng nhập ── */}
            {!isAuthenticated && (
                <p className="rs-login-hint">
                    <a href="/auth/signin" className="text-gold">Đăng nhập</a> để viết đánh giá.
                </p>
            )}

            {/* ── Danh sách ── */}
            {isLoading ? (
                <div className="spinner" style={{ margin: '32px auto' }} />
            ) : reviews.length === 0 ? (
                <p className="text-muted" style={{ textAlign: 'center', padding: '24px 0' }}>
                    Chưa có đánh giá nào. Hãy là người đầu tiên!
                </p>
            ) : (
                <div className="rs-list">
                    {reviews.map(r => {
                        const isOwner = r.userId._id === currentUserId
                        const isEditing = editingId === r._id

                        return (
                            <div key={r._id} className="rs-card">
                                {/* Header: avatar + tên + sao + thời gian */}
                                <div className="rs-card__header">
                                    <div className="rs-card__avatar">
                                        {r.userId.fullname.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="rs-card__meta">
                                        <div className="rs-card__name-row">
                                            <span className="rs-card__name">{r.userId.fullname}</span>
                                            <InlineStars rating={r.rating} />
                                            <span className="rs-card__score">{Math.round(r.rating / 2)}</span>
                                        </div>
                                        <p className="rs-card__time">{timeAgo(r.createdAt)}</p>
                                    </div>
                                </div>

                                {/* Nội dung hoặc form edit */}
                                {isEditing ? (
                                    <div className="rs-edit">
                                        <InteractiveStars value={editRating} onChange={setEditRating} />
                                        <textarea
                                            className="rs-form__textarea"
                                            value={editComment}
                                            onChange={e => setEditComment(e.target.value)}
                                            rows={3}
                                        />
                                        <div className="rs-form__actions">
                                            <button className="btn-primary" onClick={handleUpdate} disabled={submitting}>
                                                {submitting ? 'Đang lưu...' : 'Lưu'}
                                            </button>
                                            <button className="btn-secondary" onClick={() => setEditingId(null)}>
                                                Huỷ
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    r.comment && (
                                        <p className="rs-card__comment">{r.comment}</p>
                                    )
                                )}

                                {/* Footer: nút hành động */}
                                {!isEditing && (
                                    <div className="rs-card__footer">
                                        <div className="rs-card__vote">
                                            <button className="rs-vote-btn" title="Hữu ích">
                                                <span>👍</span>
                                            </button>
                                            <button className="rs-vote-btn" title="Không hữu ích">
                                                <span>👎</span>
                                            </button>
                                        </div>
                                        <div className="rs-card__right-actions">
                                            {isOwner && (
                                                <>
                                                    <button className="rs-action-btn rs-action-btn--edit" onClick={() => startEdit(r)}>
                                                        ✏️ Sửa
                                                    </button>
                                                    <button className="rs-action-btn rs-action-btn--delete" onClick={() => handleDelete(r._id)}>
                                                        🗑️ Xoá
                                                    </button>
                                                </>
                                            )}
                                            <button className="rs-share-btn" title="Sao chép liên kết"
                                                onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Đã sao chép liên kết') }}>
                                                🔗
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </section>
    )
}
