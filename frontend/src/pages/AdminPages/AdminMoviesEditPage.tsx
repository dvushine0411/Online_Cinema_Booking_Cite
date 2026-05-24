import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { movieService } from '@/services/movieService'
import type { Movie } from '@/types/movieTypes'
import toast from 'react-hot-toast'
import './AdminPages.css'

type EditForm = {
    title: string
    description: string
    duration: string
    genres: string        // comma-separated
    actors: string        // comma-separated
    releasedDate: string
    status: 'Now Showing' | 'Coming Soon'
}

export default function AdminMoviesEditPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [movie, setMovie] = useState<Movie | null>(null)
    const [form, setForm] = useState<EditForm>({
        title: '',
        description: '',
        duration: '',
        genres: '',
        actors: '',
        releasedDate: '',
        status: 'Now Showing',
    })
    const [posterFile, setPosterFile] = useState<File | null>(null)
    const [posterPreview, setPosterPreview] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Load dữ liệu phim hiện tại
    useEffect(() => {
        if (!id) return
        movieService.getMovieById(id)
            .then(res => {
                const m = res.data
                setMovie(m)
                setForm({
                    title: m.title,
                    description: m.description,
                    duration: String(m.duration),
                    genres: m.genres.join(', '),
                    actors: m.actors.join(', '),
                    releasedDate: m.releasedDate?.slice(0, 10) ?? '',
                    status: m.status,
                })
            })
            .catch(() => toast.error('Không thể tải thông tin phim'))
            .finally(() => setLoading(false))
    }, [id])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setPosterFile(file)
        setPosterPreview(URL.createObjectURL(file))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!id) return

        setSaving(true)
        try {
            const formData = new FormData()
            formData.append('title', form.title.trim())
            formData.append('description', form.description.trim())
            formData.append('duration', String(Number(form.duration)))
            formData.append('releasedDate', form.releasedDate)
            formData.append('status', form.status)
            form.genres.split(',').map(g => g.trim()).filter(Boolean)
                .forEach(g => formData.append('genres[]', g))
            form.actors.split(',').map(a => a.trim()).filter(Boolean)
                .forEach(a => formData.append('actors[]', a))
            if (posterFile) {
                formData.append('poster', posterFile)
            }

            await movieService.updateMovie(id, formData)
            toast.success('Đã cập nhật phim!')
            navigate('/admin/movies')
        } catch {
            toast.error('Không thể cập nhật phim')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="admin-page fade-in">
                <div className="container">
                    <div className="admin-table-skeleton" style={{ height: 480 }} />
                </div>
            </div>
        )
    }

    if (!movie) {
        return (
            <div className="admin-page fade-in">
                <div className="container">
                    <p style={{ color: 'var(--text-muted)' }}>Không tìm thấy phim.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="admin-page fade-in">
            <div className="container">

                {/* Header */}
                <div className="admin-page__header">
                    <div>
                        <h1 className="admin-page__title">Sửa <span>Phim</span></h1>
                        <p className="admin-page__count">{movie.title}</p>
                    </div>
                    <button className="btn-ghost" onClick={() => navigate('/admin/movies')}>
                        ← Quay lại
                    </button>
                </div>

                {/* Form */}
                <div className="admin-edit-wrap">
                    {/* Poster bên trái */}
                    <div className="admin-edit-poster">
                        <img
                            src={posterPreview ?? movie.posterURL}
                            alt={movie.title}
                            className="admin-edit-poster-img"
                        />
                        <label className="admin-edit-poster-btn" htmlFor="poster-upload">
                            🖼️ Đổi poster
                        </label>
                        <input
                            id="poster-upload"
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handlePosterChange}
                        />
                        {posterPreview && (
                            <p className="admin-edit-poster-note" style={{ color: 'var(--color-gold)' }}>
                                ✅ Ảnh mới đã chọn
                            </p>
                        )}
                    </div>

                    {/* Form bên phải */}
                    <form className="admin-edit-form" onSubmit={handleSubmit}>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Tên phim</label>
                            <input
                                className="admin-form-input"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                required
                                placeholder="Nhập tên phim"
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Mô tả</label>
                            <textarea
                                className="admin-form-input admin-form-textarea"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Mô tả nội dung phim"
                            />
                        </div>

                        <div className="admin-form-row">
                            <div className="admin-form-group">
                                <label className="admin-form-label">Thời lượng (phút)</label>
                                <input
                                    className="admin-form-input"
                                    name="duration"
                                    type="number"
                                    min={1}
                                    value={form.duration}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="admin-form-group">
                                <label className="admin-form-label">Ngày phát hành</label>
                                <input
                                    className="admin-form-input"
                                    name="releasedDate"
                                    type="date"
                                    value={form.releasedDate}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Trạng thái</label>
                            <select
                                className="admin-form-input admin-filter-select"
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                            >
                                <option value="Now Showing">Now Showing</option>
                                <option value="Coming Soon">Coming Soon</option>
                            </select>
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Thể loại <span className="admin-form-hint">(phân cách bằng dấu phẩy)</span></label>
                            <input
                                className="admin-form-input"
                                name="genres"
                                value={form.genres}
                                onChange={handleChange}
                                placeholder="Action, Drama, Thriller"
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Diễn viên <span className="admin-form-hint">(phân cách bằng dấu phẩy)</span></label>
                            <input
                                className="admin-form-input"
                                name="actors"
                                value={form.actors}
                                onChange={handleChange}
                                placeholder="Tên diễn viên 1, Tên diễn viên 2"
                            />
                        </div>

                        <div className="admin-form-actions">
                            <button
                                type="button"
                                className="btn-ghost"
                                onClick={() => navigate('/admin/movies')}
                            >
                                Huỷ
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={saving}
                            >
                                {saving ? 'Đang lưu...' : '💾 Lưu thay đổi'}
                            </button>
                        </div>

                    </form>
                </div>

            </div>
        </div>
    )
}
