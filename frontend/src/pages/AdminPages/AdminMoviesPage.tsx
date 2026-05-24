import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMovieStore } from '@/stores/useMovieStore'
import { movieService } from '@/services/movieService'
import { formatDate } from '@/lib/utils'
import { MOVIE_STATUS } from '@/lib/constants'
import toast from 'react-hot-toast'
import './AdminPages.css'

export default function AdminMoviesPage() {
    const { movies, isLoading, fetchMovies } = useMovieStore()
    const [deleting, setDeleting] = useState<string | null>(null)

    useEffect(() => { fetchMovies({ limit: '50' }) }, [])

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Xoá phim "${title}"?`)) return
        setDeleting(id)
        try {
            await movieService.deleteMovie(id)
            toast.success('Đã xoá phim')
            fetchMovies({ limit: '50' })
        } catch {
            toast.error('Không thể xoá phim')
        } finally {
            setDeleting(null)
        }
    }

    return (
        <div className="admin-page fade-in">
            <div className="container">
                <div className="admin-page__header">
                    <div>
                        <h1 className="admin-page__title">Quản lý <span>Phim</span></h1>
                        <p className="admin-page__count">{movies?.totalItems ?? 0} phim</p>
                    </div>
                    <a href="/admin/movies/create" className="btn-primary">+ Thêm phim</a>
                </div>

                {isLoading ? (
                    <div className="admin-table-skeleton" />
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Phim</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày chiếu</th>
                                    <th>Thời lượng</th>
                                    <th>Đánh giá</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(movies?.data ?? []).map((m) => (
                                    <tr key={m._id}>
                                        <td>
                                            <div className="admin-movie-cell">
                                                <img src={m.posterURL} alt={m.title} className="admin-movie-thumb" />
                                                <div>
                                                    <p className="admin-movie-title">{m.title}</p>
                                                    <p className="admin-movie-genres">{m.genres.join(', ')}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${m.status === MOVIE_STATUS.NOW_SHOWING ? 'badge-red' : 'badge-gold'}`}>
                                                {m.status}
                                            </span>
                                        </td>
                                        <td className="admin-cell-muted">{formatDate(m.releasedDate)}</td>
                                        <td className="admin-cell-muted">{m.duration} phút</td>
                                        <td>
                                            <span className="admin-rating">★ {(m.avgRating / 2).toFixed(1)}</span>
                                        </td>
                                        <td>
                                            <div className="admin-actions">
                                                <Link to={`/admin/movies/edit/${m._id}`} className="admin-btn-edit">
                                                    ✏️ Sửa
                                                </Link>
                                                <button
                                                    className="admin-btn-delete"
                                                    onClick={() => handleDelete(m._id, m.title)}
                                                    disabled={deleting === m._id}
                                                >
                                                    {deleting === m._id ? '...' : '🗑️ Xoá'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}