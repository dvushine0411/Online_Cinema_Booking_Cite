import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useNewsStore } from '@/stores/useNewsStore'
import { NEWS_CATEGORIES } from '@/lib/constants'
import { truncateText, formatDate } from '@/lib/utils'
import './NewsPage.css'

export default function NewsPage() {
    const [category, setCategory] = useState<string>('')
    const { newsList, isLoading, fetchNews } = useNewsStore()

    useEffect(() => {
        fetchNews({ category: category || undefined, limit: '12' })
    }, [category])

    const news = newsList?.data ?? [];

    console.log("DATA: ", news);

    return (
        <div className="news-page fade-in">
            <div className="container">

                {/* Header */}
                <div className="news-page__header">
                    <h1 className="section-title">
                        Tin tức <span>điện ảnh</span>
                    </h1>

                    {/* Category filter */}
                    <div className="news-filters">
                        <button
                            className={`news-filter-btn ${category === '' ? 'news-filter-btn--active' : ''}`}
                            onClick={() => setCategory('')}
                        >
                            Tất cả
                        </button>
                        {NEWS_CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                className={`news-filter-btn ${category === cat ? 'news-filter-btn--active' : ''}`}
                                onClick={() => setCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="news-grid">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="news-card-skeleton" />
                        ))}
                    </div>
                ) : news.length === 0 ? (
                    <p className="text-muted" style={{ textAlign: 'center', padding: '60px 0' }}>
                        Không có bài viết nào.
                    </p>
                ) : (
                    <div className="news-grid">
                        {news?.map((item) => (
                            <Link key={item._id} to={`/news/${item._id}`} className="news-card">
                                <div className="news-card__thumb">
                                    <img
                                        src={item.thumbnailURL || '/placeholder-news.jpg'}
                                        alt={item.title}
                                        loading="lazy"
                                    />
                                    <span className="news-card__category badge badge-red">
                                        {item.category}
                                    </span>
                                </div>
                                <div className="news-card__body">
                                    <h3 className="news-card__title">
                                        {truncateText(item.title, 70)}
                                    </h3>
                                    <div className="news-card__meta">
                                        <span>{item.authorId.fullname}</span>
                                        <span>·</span>
                                        <span>{formatDate(item.createdAt)}</span>
                                        <span>·</span>
                                        <span>💬 {item.commentCount}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

            </div>
        </div>
    )
}
