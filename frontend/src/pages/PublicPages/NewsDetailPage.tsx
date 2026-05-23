import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { useNewsStore } from '@/stores/useNewsStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { formatDateTime } from '@/lib/utils'
import toast from 'react-hot-toast'
import './NewsDetailPage.css'

export default function NewsDetailPage() {
    const { id } = useParams<{ id: string }>()
    const [commentText, setCommentText] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const { selectedNews, comments, isLoading, fetchNewsById, createComment, deleteComment } = useNewsStore()
    const { user, isAuthenticated } = useAuthStore()

    useEffect(() => {
        if (id) fetchNewsById(id)
    }, [id])

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!commentText.trim() || !id) return
        setSubmitting(true)
        try {
            await createComment(id, commentText.trim())
            setCommentText('')
            toast.success('Đã đăng bình luận')
        } catch {
            toast.error('Không thể đăng bình luận')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteComment = async (commentId: string) => {
        if (!id) return
        try {
            await deleteComment(id, commentId)
            toast.success('Đã xoá bình luận')
        } catch {
            toast.error('Không thể xoá bình luận')
        }
    }

    if (isLoading) {
        return <div className="news-detail-loading"><div className="spinner" /></div>
    }

    if (!selectedNews) {
        return <div className="news-detail-loading"><p className="text-muted">Không tìm thấy bài viết.</p></div>
    }

    return (
        <div className="news-detail fade-in">
            <div className="container news-detail__inner">

                {/* Article */}
                <article className="news-article">
                    <div className="news-article__hero">
                        <img src={selectedNews.thumbnailURL} alt={selectedNews.title} />
                    </div>

                    <div className="news-article__header">
                        <span className="badge badge-red">{selectedNews.category}</span>
                        <h1 className="news-article__title">{selectedNews.title}</h1>
                        <div className="news-article__meta">
                            <span>✍️ {selectedNews.authorId.fullname}</span>
                            <span>·</span>
                            <span>{formatDateTime(selectedNews.createdAt)}</span>
                            <span>·</span>
                            <span>💬 {selectedNews.commentCount} bình luận</span>
                        </div>
                    </div>

                    <div className="news-article__content">
                        <ReactMarkdown>{selectedNews.content}</ReactMarkdown>
                    </div>
                </article>

                {/* Comments */}
                <section className="news-comments">
                    <h2 className="news-comments__title">
                        Bình luận <span className="text-gold">({comments.length})</span>
                    </h2>

                    {/* Comment form */}
                    {isAuthenticated ? (
                        <form onSubmit={handleComment} className="comment-form">
                            <div className="comment-form__avatar">
                                {user?.fullname?.charAt(0).toUpperCase()}
                            </div>
                            <div className="comment-form__input-wrap">
                                <textarea
                                    className="input comment-form__input"
                                    placeholder="Viết bình luận..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    rows={3}
                                />
                                <button
                                    type="submit"
                                    className="btn-primary comment-form__submit"
                                    disabled={submitting || !commentText.trim()}
                                >
                                    {submitting ? 'Đang gửi...' : 'Gửi'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <p className="news-comments__login-hint">
                            <a href="/auth/signin" className="text-gold">Đăng nhập</a> để bình luận.
                        </p>
                    )}

                    {/* Comment list */}
                    <div className="comment-list">
                        {comments.map((c) => (
                            <div key={c._id} className="comment-item">
                                <div className="comment-item__avatar">
                                    {c.userId.fullname?.charAt(0).toUpperCase()}
                                </div>
                                <div className="comment-item__body">
                                    <div className="comment-item__header">
                                        <span className="comment-item__name">{c.userId.fullname}</span>
                                        <span className="comment-item__time">{formatDateTime(c.createdAt)}</span>
                                    </div>
                                    <p className="comment-item__content">{c.content}</p>
                                </div>
                                {(user?._id === c.userId._id || user?.role === 'Admin') && (
                                    <button
                                        className="comment-item__delete"
                                        onClick={() => handleDeleteComment(c._id)}
                                        title="Xoá"
                                    >
                                        🗑
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

            </div>
        </div>
    )
}
