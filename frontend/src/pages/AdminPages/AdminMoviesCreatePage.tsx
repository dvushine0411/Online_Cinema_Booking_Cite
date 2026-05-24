import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { movieService } from '@/services/movieService'
import toast from 'react-hot-toast'
import './AdminPages.css'

type CreateForm = {
    title: string
    description: string
    duration: string
    genres: string       // comma-separated
    actors: string       // comma-separated
    releasedDate: string
    status: 'Now Showing' | 'Coming Soon'
}

const INITIAL_FORM: CreateForm = {
    title: '',
    description: '',
    duration: '',
    genres: '',
    actors: '',
    releasedDate: '',
    status: 'Coming Soon',
}

export default function AdminMoviesCreatePage() {
    const navigate = useNavigate()

    const [form, setForm] = useState<CreateForm>(INITIAL_FORM)
    const [posterFile, setPosterFile] = useState<File | null>(null)
    const [posterPreview, setPosterPreview] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
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

        if (!posterFile) {
            toast.error('Vui lòng chọn poster cho phim')
            return
        }

        setSaving(true)
        try {
            const formData = new FormData()
            formData.append('title', form.title.trim())
            formData.append('description', form.description.trim())
            formData.append('duration', String(Number(form.duration)))
            formData.append('releasedDate', form.releasedDate)
            formData.append('status', form.status)
            form.genres.split(',').map(g => g.trim()).filter(Boolean)
                .forEach(g => formData.append('genres', g))
            form.actors.split(',').map(a => a.trim()).filter(Boolean)
                .forEach(a => formData.append('actors', a))
            formData.append('poster', posterFile)

            await movieService.createMovie(formData)
            toast.success('Đã thêm phim mới!')
            navigate('/admin/movies')
        } catch {
            toast.error('Không thể thêm phim. Vui lòng kiểm tra lại.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="admin-page fade-in">
            <div className="container">

                {/* Header */}
                <div className="admin-page__header">
                    <div>
                        <h1 className="admin-page__title">Thêm <span>Phim mới</span></h1>
                        <p className="admin-page__count">Điền đầy đủ thông tin bên dưới</p>
                    </div>
                    <button className="btn-ghost" onClick={() => navigate('/admin/movies')}>
                        ← Quay lại
                    </button>
                </div>

                {/* Form */}
                <div className="admin-edit-wrap">

                    {/* Poster bên trái */}
                    <div className="admin-edit-poster">
                        {posterPreview ? (
                            <img
                                src={posterPreview}
                                alt="Poster preview"
                                className="admin-edit-poster-img"
                            />
                        ) : (
                            <div className="admin-create-poster-placeholder">
                                <span>🎬</span>
                                <p>Chưa có poster</p>
                            </div>
                        )}

                        <label className="admin-edit-poster-btn" htmlFor="poster-upload">
                            {posterPreview ? '🖼️ Đổi poster' : '📁 Chọn poster'}
                        </label>
                        <input
                            id="poster-upload"
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handlePosterChange}
                        />
                        {!posterFile && (
                            <p className="admin-edit-poster-note" style={{ color: 'var(--color-red)' }}>
                                * Bắt buộc
                            </p>
                        )}
                        {posterFile && (
                            <p className="admin-edit-poster-note" style={{ color: 'var(--color-gold)' }}>
                                ✅ Đã chọn: {posterFile.name}
                            </p>
                        )}
                    </div>

                    {/* Form bên phải */}
                    <form className="admin-edit-form" onSubmit={handleSubmit}>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Tên phim <span style={{ color: 'var(--color-red)' }}>*</span></label>
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
                            <label className="admin-form-label">Mô tả <span style={{ color: 'var(--color-red)' }}>*</span></label>
                            <textarea
                                className="admin-form-input admin-form-textarea"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                required
                                rows={4}
                                placeholder="Nội dung tóm tắt của phim..."
                            />
                        </div>

                        <div className="admin-form-row">
                            <div className="admin-form-group">
                                <label className="admin-form-label">Thời lượng (phút) <span style={{ color: 'var(--color-red)' }}>*</span></label>
                                <input
                                    className="admin-form-input"
                                    name="duration"
                                    type="number"
                                    min={1}
                                    value={form.duration}
                                    onChange={handleChange}
                                    required
                                    placeholder="120"
                                />
                            </div>
                            <div className="admin-form-group">
                                <label className="admin-form-label">Ngày phát hành <span style={{ color: 'var(--color-red)' }}>*</span></label>
                                <input
                                    className="admin-form-input"
                                    name="releasedDate"
                                    type="date"
                                    value={form.releasedDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Trạng thái <span style={{ color: 'var(--color-red)' }}>*</span></label>
                            <select
                                className="admin-form-input admin-filter-select"
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                            >
                                <option value="Coming Soon">Coming Soon</option>
                                <option value="Now Showing">Now Showing</option>
                            </select>
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">
                                Thể loại <span style={{ color: 'var(--color-red)' }}>*</span>
                                <span className="admin-form-hint"> (phân cách bằng dấu phẩy)</span>
                            </label>
                            <input
                                className="admin-form-input"
                                name="genres"
                                value={form.genres}
                                onChange={handleChange}
                                required
                                placeholder="Action, Drama, Thriller"
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">
                                Diễn viên <span style={{ color: 'var(--color-red)' }}>*</span>
                                <span className="admin-form-hint"> (phân cách bằng dấu phẩy)</span>
                            </label>
                            <input
                                className="admin-form-input"
                                name="actors"
                                value={form.actors}
                                onChange={handleChange}
                                required
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
                                {saving ? 'Đang tải lên...' : '🎬 Thêm phim'}
                            </button>
                        </div>

                    </form>
                </div>

            </div>
        </div>
    )
}
