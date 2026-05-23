import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useMovieStore } from '@/stores/useMovieStore'
import { useShowtimeStore } from '@/stores/useShowtimeStore'
import StarRating from '@/components/ui/StarRating'
import { formatDate, formatDuration, formatTime } from '@/lib/utils'
import './MovieDetailPage.css'
import ReviewSection from '@/components/ui/ReviewSection'
import { useAuthStore } from '@/stores/useAuthStore'

export default function MovieDetailPage() {
    const { id } = useParams<{ id: string }>()
    const { selectedMovie, isLoading: movieLoading, fetchMovieById } = useMovieStore()
    const { showtimes, isLoading: showtimeLoading, fetchShowtimesByMovieId } = useShowtimeStore()
    const { isAuthenticated, user } = useAuthStore()

    useEffect(() => {
        if (id) {
            fetchMovieById(id)
            fetchShowtimesByMovieId(id)
        }
    }, [id])

    if (movieLoading) {
        return (
            <div className="movie-detail-loading">
                <div className="spinner" />
            </div>
        )
    }

    if (!selectedMovie) {
        return (
            <div className="movie-detail-error">
                <p>Không tìm thấy phim.</p>
                <Link to="/" className="btn-primary">← Về trang chủ</Link>
            </div>
        )
    }

    return (
        <div className="movie-detail fade-in">

            {/* ── Hero ──────────────────────────── */}
            <section className="movie-hero">
                <div
                    className="movie-hero__backdrop"
                    style={{ backgroundImage: `url(${selectedMovie.posterURL})` }}
                />
                <div className="movie-hero__overlay" />
                <div className="container movie-hero__content">
                    <div className="movie-hero__poster">
                        <img src={selectedMovie.posterURL} alt={selectedMovie.title} />
                    </div>
                    <div className="movie-hero__info">
                        <div className="movie-hero__badges">
                            <span className={`badge ${selectedMovie.status === 'Now Showing' ? 'badge-red' : 'badge-gold'}`}>
                                {selectedMovie.status === 'Now Showing' ? 'Đang chiếu' : 'Sắp chiếu'}
                            </span>
                        </div>
                        <h1 className="movie-hero__title">{selectedMovie.title}</h1>
                        <div className="movie-hero__meta">
                            <span>🕐 {formatDuration(selectedMovie.duration)}</span>
                            <span>📅 {formatDate(selectedMovie.releasedDate)}</span>
                        </div>
                        <div className="movie-hero__genres">
                            {selectedMovie.genres.map((g) => (
                                <span key={g} className="genre-tag">{g}</span>
                            ))}
                        </div>
                        <div className="movie-hero__rating">
                            <StarRating rating={selectedMovie.avgRating} size="lg" showValue />
                            <span className="movie-hero__review-count">
                                ({selectedMovie.reviewCount} đánh giá)
                            </span>
                        </div>
                        <p className="movie-hero__desc">{selectedMovie.description}</p>
                        {selectedMovie.status === 'Now Showing' && (
                            <a href="#showtimes" className="btn-primary movie-hero__cta">
                                🎟️ Đặt vé ngay
                            </a>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Actors ────────────────────────── */}
            <section className="container movie-section">
                <h2 className="section-title">Diễn viên</h2>
                <div className="actors-list">
                    {selectedMovie.actors.map((actor) => (
                        <span key={actor} className="actor-tag">{actor}</span>
                    ))}
                </div>
            </section>

            {/* ── Showtimes ─────────────────────── */}
            <section id="showtimes" className="container movie-section">
                <h2 className="section-title">Lịch chiếu</h2>
                {showtimeLoading ? (
                    <div className="spinner" />
                ) : showtimes.length === 0 ? (
                    <p className="text-muted">Chưa có suất chiếu nào.</p>
                ) : (
                    <div className="showtime-list">
                        {showtimes.map((st) => (
                            <Link
                                key={st._id}
                                to={`/booking/${st._id}`}
                                className="showtime-card"
                            >
                                <div className="showtime-card__time">
                                    {formatTime(st.startTime)}
                                </div>
                                <div className="showtime-card__info">
                                    <span className="showtime-card__room">
                                        {st.roomID.name}
                                    </span>
                                    <span className="showtime-card__date">
                                        {formatDate(st.startTime)}
                                    </span>
                                </div>
                                <div className="showtime-card__price">
                                    {st.ticketPrices.standard.toLocaleString('vi-VN')}đ
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            <ReviewSection
                movieId={selectedMovie._id}
                isAuthenticated={isAuthenticated}
                currentUserId={user?._id}
            />

        </div>
    )
}
