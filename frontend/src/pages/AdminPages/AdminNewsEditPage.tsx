// frontend/src/pages/AdminPages/AdminNewsEditPage.tsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { newsService } from '@/services/newsService'
import { NEWS_CATEGORIES } from '@/lib/constants'
import type { News } from '@/types/newsTypes'
import toast from 'react-hot-toast'
import './AdminPages.css'

type EditForm = {
    title: string
    content: string
    category: 'Khuyến mãi' | 'Phim mới' | 'Thông báo' | 'Sự kiện'
}

export default function AdminNewsEditPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [news, setNews] = useState<News | null>(null)
    const [form, setForm] = useState<EditForm>({ title: '', content: '', category: NEWS_CATEGORIES[0] })
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Load bài viết hiện tại
    useEffect(() => {
        if (!id) return
        newsService.getNewsById(id)
            .then(res => {
                // getNewsById trả về { data: { news, comments } }
                const n = (res as any).data?.news ?? (res as any).data
                setNews(n)
                setForm({
                    title: n.title ?? '',
                    content: n.content ?? '',
                    category: n.category ?? NEWS_CATEGORIES[0],
                })
            })
            .catch(() => toast.error('Không thể tải bài viết'))
            .finally(() => setLoading(false))
    }, [id])

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setThumbnailFile(file)
        setThumbnailPreview(URL.createObjectURL(file))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!id) return

        setSaving(true)
        try {
            await newsService.updateNews(
                id,
                { title: form.title.trim(), content: form.content.trim(), category: form.category },
                thumbnailFile ?? undefined
            )
            toast.success('Đã cập nhật bài viết!')
            navigate('/admin/news')
        } catch {
            toast.error('Không thể cập nhật bài viết')
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

    if (!news) {
        return (
            <div className="admin-page fade-in">
                <div className="container">
                    <p style={{ color: 'var(--text-muted)' }}>Không tìm thấy bài viết.</p>
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
                        <h1 className="admin-page__title">Sửa <span>Bài viết</span></h1>
                        <p className="admin-page__count">{news.title}</p>
                    </div>
                    <button className="btn-ghost" onClick={() => navigate('/admin/news')}>
                        ← Quay lại
                    </button>
                </div>

                {/* Form */}
                <div className="admin-edit-wrap">

                    {/* Thumbnail bên trái */}
                    <div className="admin-edit-poster">
                        <img
                            src={thumbnailPreview ?? news.thumbnailURL}
                            alt={news.title}
                            className="admin-edit-poster-img"
                            style={{ aspectRatio: '16/9', objectFit: 'cover' }}
                        />
                        <label className="admin-edit-poster-btn" htmlFor="thumbnail-upload">
                            🖼️ Đổi thumbnail
                        </label>
                        <input
                            id="thumbnail-upload"
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleThumbnailChange}
                        />
                        {thumbnailPreview && (
                            <p className="admin-edit-poster-note" style={{ color: 'var(--color-gold)' }}>
                                ✅ Ảnh mới đã chọn
                            </p>
                        )}
                        {!thumbnailPreview && (
                            <p className="admin-edit-poster-note">
                                Để trống = giữ ảnh cũ
                            </p>
                        )}
                    </div>

                    {/* Form bên phải */}
                    <form className="admin-edit-form" onSubmit={handleSubmit}>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Tiêu đề</label>
                            <input
                                className="admin-form-input"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                required
                                placeholder="Tiêu đề bài viết"
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Danh mục</label>
                            <select
                                className="admin-form-input admin-filter-select"
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                            >
                                {NEWS_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">
                                Nội dung
                                <span className="admin-form-hint"> (hỗ trợ Markdown)</span>
                            </label>
                            <textarea
                                className="admin-form-input admin-form-textarea"
                                name="content"
                                value={form.content}
                                onChange={handleChange}
                                required
                                rows={14}
                            />
                        </div>

                        <div className="admin-form-actions">
                            <button
                                type="button"
                                className="btn-ghost"
                                onClick={() => navigate('/admin/news')}
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
