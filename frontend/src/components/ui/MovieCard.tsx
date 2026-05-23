import { Link } from 'react-router-dom'
import type { Movie } from '@/types/movieTypes'
import StarRating from './StarRating'
import { formatDate } from '@/lib/utils'
import './MovieCard.css'

interface MovieCardProps {
    movie: Movie
}

export default function MovieCard({ movie }: MovieCardProps) {
    const isNew = () => {
        const release = new Date(movie.releasedDate)
        const now = new Date()
        const diffDays = (now.getTime() - release.getTime()) / (1000 * 60 * 60 * 24)
        return diffDays <= 14
    }

    return (
        <Link to={`/movies/${movie._id}`} className="movie-card">
            {/* Poster */}
            <div className="movie-card__poster">
                <img
                    src={movie.posterURL || '/placeholder-poster.jpg'}
                    alt={movie.title}
                    loading="lazy"
                />

                {/* Badges */}
                <div className="movie-card__badges">
                    {isNew() && <span className="badge badge-red">Mới</span>}
                    {movie.status === 'Coming Soon' && (
                        <span className="badge badge-gold">Sắp chiếu</span>
                    )}
                </div>

                {/* Hover overlay */}
                <div className="movie-card__overlay">
                    <button className="movie-card__buy-btn">
                        🎟️ Mua vé
                    </button>
                </div>

                {/* Bottom gradient */}
                <div className="movie-card__gradient" />
            </div>

            {/* Info */}
            <div className="movie-card__info">
                <h3 className="movie-card__title">{movie.title}</h3>
                <div className="movie-card__meta">
                    <StarRating rating={movie.avgRating} size="sm" showValue={true} />
                    <span className="movie-card__date">{formatDate(movie.releasedDate)}</span>
                </div>
            </div>
        </Link>
    )
}
