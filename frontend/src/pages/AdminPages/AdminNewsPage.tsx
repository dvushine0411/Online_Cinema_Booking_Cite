import { useEffect, useState } from 'react'
import { useNewsStore } from '@/stores/useNewsStore'
import { newsService } from '@/services/newsService'
import { formatDate } from '@/lib/utils'
import { NEWS_CATEGORIES } from '@/lib/constants'
import toast from 'react-hot-toast'
import './AdminPages.css'

export default function AdminNewsPage() {
    const { newsList, isLoading, fetchNews } = useNewsStore()
    const [deleting, setDeleting] = useState<string | null>(null)
    const [filterCategory, setFilterCategory] = useState('')

    useEffect(() => {
        fetchNews({ category: filterCategory || undefined, limit: '50' })
    }, [filterCategory])

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Xoá bài viết "${title}"?`)) return
        setDeleting(id)
        try {
            await newsService.deleteNews(id)
            toast.success('Đã xoá bài viết')
            fetchNews({ category: filterCategory || undefined, limit: '50' })
        } catch {
            toast.error('Không thể xoá bài viết')
        } finally {
            setDeleting(null)
        }
    }

    const CATEGORY_COLOR: Record<string, string> = {
        'Khuyến mãi': '#22c55e',
        'Phim mới': '#E8192C',
        'Thông báo': '#f59e0b',
        'Sự kiện': '#6366f1',
    }

    return (
        <div className="admin-page fade-in">
            <div className="container">
                <div className="admin-page__header">
                    <div>
                        <h1 className="admin-page__title">Quản lý <span>Tin tức</span></h1>
                        <p className="admin-page__count">{newsList?.totalItems ?? 0} bài viết</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <select
                            className="admin-filter-select"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="">Tất cả danh mục</option>
                            {NEWS_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <a href="/admin/news/create" className="btn-primary">+ Thêm bài viết</a>
                    </div>
                </div>

                {isLoading ? (
                    <div className="admin-table-skeleton" />
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Bài viết</th>
                                    <th>Danh mục</th>
                                    <th>Tác giả</th>
                                    <th>Bình luận</th>
                                    <th>Ngày đăng</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(newsList?.data ?? []).map((n) => (
                                    <tr key={n._id}>
                                        <td>
                                            <div className="admin-movie-cell">
                                                <img
                                                    src={n.thumbnailURL}
                                                    alt={n.title}
                                                    className="admin-movie-thumb"
                                                    style={{ height: '48px', width: '72px', borderRadius: '6px' }}
                                                />
                                                <p className="admin-movie-title">{n.title}</p>
                                            </div>
                                        </td>
                                        <td>
                                            <span
                                                className="badge"
                                                style={{
                                                    background: (CATEGORY_COLOR[n.category] ?? '#888') + '22',
                                                    color: CATEGORY_COLOR[n.category] ?? '#888',
                                                    border: `1px solid ${CATEGORY_COLOR[n.category] ?? '#888'}`,
                                                }}
                                            >
                                                {n.category}
                                            </span>
                                        </td>
                                        <td className="admin-cell-muted">
                                            {n.authorId?.fullname ?? '—'}
                                        </td>
                                        <td className="admin-cell-muted">
                                            {n.commentCount ?? 0}
                                        </td>
                                        <td className="admin-cell-muted">
                                            {formatDate(n.createdAt)}
                                        </td>
                                        <td>
                                            <div className="admin-actions">
                                                <a
                                                    href={`/admin/news/edit/${n._id}`}
                                                    className="admin-btn-edit"
                                                >
                                                    Sửa
                                                </a>
                                                <button
                                                    className="admin-btn-delete"
                                                    onClick={() => handleDelete(n._id, n.title)}
                                                    disabled={deleting === n._id}
                                                >
                                                    {deleting === n._id ? '...' : 'Xoá'}
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
