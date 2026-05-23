import { useEffect, useState } from 'react'
import { useMovieStore } from '@/stores/useMovieStore'
import MovieCard from '@/components/ui/MovieCard'
import './HomePage.css'

type Tab = 'Now showing' | 'Coming soon'

export default function HomePage() {
    const [activeTab, setActiveTab] = useState<Tab>('Now showing')
    const { movies, isLoading, fetchMovies } = useMovieStore()

    useEffect(() => {
        fetchMovies({
            status: activeTab === 'Now showing' ? 'Now Showing' : 'Coming Soon',
            limit: '20',
        })
    }, [activeTab])

    const movieList = movies?.data ?? []

    return (
        <div className="home fade-in">

            {/* ── Hero Banner ─────────────────────── */}
            <section className="hero-banner">
                <div className="hero-banner__bg" />
                <div className="container hero-banner__content">
                    <p className="hero-banner__sub">🎬 Chào mừng đến với CinemaX</p>
                    <h1 className="hero-banner__title">
                        Trải nghiệm điện ảnh<br />
                        <span className="shimmer">đỉnh cao nhất</span>
                    </h1>
                    <p className="hero-banner__desc">
                        Chọn phim, chọn ghế, thanh toán trong vài giây.
                    </p>
                </div>
                <div className="hero-banner__overlay" />
            </section>

            {/* ── Movie Section ───────────────────── */}
            <section className="home-movies">
                <div className="container">

                    {/* Tabs */}
                    <div className="home-tabs">
                        <button
                            className={`home-tab ${activeTab === 'Now showing' ? 'home-tab--active' : ''}`}
                            onClick={() => setActiveTab('Now showing')}
                        >
                            Đang chiếu
                        </button>
                        <div className="home-tab__divider" />
                        <button
                            className={`home-tab ${activeTab === 'Coming soon' ? 'home-tab--active' : ''}`}
                            onClick={() => setActiveTab('Coming soon')}
                        >
                            Sắp chiếu
                        </button>
                    </div>

                    {/* Movie Carousel */}
                    {isLoading ? (
                        <div className="home-movies__loading">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="movie-card-skeleton" />
                            ))}
                        </div>
                    ) : movieList.length === 0 ? (
                        <div className="home-movies__empty">
                            <p>Không có phim nào.</p>
                        </div>
                    ) : (
                        <div className="home-movies__grid">
                            {movieList.map((movie) => (
                                <MovieCard key={movie._id} movie={movie} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

        </div>
    )
}
