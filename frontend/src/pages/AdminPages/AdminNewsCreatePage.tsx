// frontend/src/pages/AdminPages/AdminNewsCreatePage.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { newsService } from '@/services/newsService'
import { NEWS_CATEGORIES } from '@/lib/constants'
import type { CreateNewsPayload } from '@/types/newsTypes'
import toast from 'react-hot-toast'
import './AdminPages.css'

const INITIAL_FORM: CreateNewsPayload = {
    title: '',
    content: '',
    category: NEWS_CATEGORIES[0],
}

export default function AdminNewsCreatePage() {
    const navigate = useNavigate()

    const [form, setForm] = useState<CreateNewsPayload>(INITIAL_FORM)
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

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

        if (!thumbnailFile) {
            toast.error('Vui lòng chọn ảnh thumbnail cho bài viết')
            return
        }
        if (!form.title.trim()) {
            toast.error('Vui lòng nhập tiêu đề')
            return
        }
        if (!form.content.trim()) {
            toast.error('Vui lòng nhập nội dung')
            return
        }

        setSaving(true)
        try {
            await newsService.createNews(
                { title: form.title.trim(), content: form.content.trim(), category: form.category },
                thumbnailFile
            )
            toast.success('Đã đăng bài viết mới!')
            navigate('/admin/news')
        } catch {
            toast.error('Không thể tạo bài viết. Vui lòng thử lại.')
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
                        <h1 className="admin-page__title">Thêm <span>Bài viết mới</span></h1>
                        <p className="admin-page__count">Điền đầy đủ thông tin bên dưới</p>
                    </div>
                    <button className="btn-ghost" onClick={() => navigate('/admin/news')}>
                        ← Quay lại
                    </button>
                </div>

                {/* Form */}
                <div className="admin-edit-wrap">

                    {/* Thumbnail bên trái */}
                    <div className="admin-edit-poster">
                        {thumbnailPreview ? (
                            <img
                                src={thumbnailPreview}
                                alt="Thumbnail preview"
                                className="admin-edit-poster-img"
                                style={{ aspectRatio: '16/9', objectFit: 'cover' }}
                            />
                        ) : (
                            <div className="admin-create-poster-placeholder"
                                style={{ aspectRatio: '16/9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', gap: 8 }}>
                                <span style={{ fontSize: 32 }}>📰</span>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Chưa có thumbnail</p>
                            </div>
                        )}

                        <label className="admin-edit-poster-btn" htmlFor="thumbnail-upload">
                            {thumbnailPreview ? '🖼️ Đổi thumbnail' : '📁 Chọn thumbnail'}
                        </label>
                        <input
                            id="thumbnail-upload"
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleThumbnailChange}
                        />
                        {!thumbnailFile && (
                            <p className="admin-edit-poster-note" style={{ color: 'var(--color-red)' }}>
                                * Bắt buộc
                            </p>
                        )}
                        {thumbnailFile && (
                            <p className="admin-edit-poster-note" style={{ color: 'var(--color-gold)' }}>
                                ✅ {thumbnailFile.name}
                            </p>
                        )}
                    </div>

                    {/* Form bên phải */}
                    <form className="admin-edit-form" onSubmit={handleSubmit}>

                        <div className="admin-form-group">
                            <label className="admin-form-label">
                                Tiêu đề <span style={{ color: 'var(--color-red)' }}>*</span>
                            </label>
                            <input
                                className="admin-form-input"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                required
                                placeholder="Nhập tiêu đề bài viết..."
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">
                                Danh mục <span style={{ color: 'var(--color-red)' }}>*</span>
                            </label>
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
                                Nội dung <span style={{ color: 'var(--color-red)' }}>*</span>
                                <span className="admin-form-hint"> (hỗ trợ Markdown)</span>
                            </label>
                            <textarea
                                className="admin-form-input admin-form-textarea"
                                name="content"
                                value={form.content}
                                onChange={handleChange}
                                required
                                rows={14}
                                placeholder={"# Tiêu đề\n\nNội dung bài viết..."}
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
                                {saving ? 'Đang đăng...' : '📰 Đăng bài viết'}
                            </button>
                        </div>

                    </form>
                </div>

            </div>
        </div>
    )
}
