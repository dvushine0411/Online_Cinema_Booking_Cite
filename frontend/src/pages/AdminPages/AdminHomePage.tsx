// frontend/src/pages/AdminPages/AdminHomePage.tsx

import { useNavigate } from 'react-router-dom'
import './AdminPages.css'
import './AdminHomePage.css'

const ADMIN_CARDS = [
    {
        id: 'movies',
        icon: '🎬',
        label: 'Movies',
        description: 'Quản lý danh sách phim, thêm / sửa / xoá phim',
        path: '/admin/movies',
        accent: 'card-accent--red',
    },
    {
        id: 'showtimes',
        icon: '🕐',
        label: 'Showtimes',
        description: 'Quản lý lịch chiếu, thêm xuất chiếu mới',
        path: '/admin/showtimes',
        accent: 'card-accent--gold',
    },
    {
        id: 'news',
        icon: '📰',
        label: 'News',
        description: 'Quản lý tin tức, bài viết điện ảnh',
        path: '/admin/news',
        accent: 'card-accent--blue',
    },
    {
        id: 'rooms',
        icon: '🏛️',
        label: 'Rooms',
        description: 'Quản lý phòng chiếu, sơ đồ ghế ngồi',
        path: '/admin/rooms',
        accent: 'card-accent--purple',
    },
    {
        id: 'bookings',
        icon: '🎟️',
        label: 'Bookings',
        description: 'Xem & cập nhật trạng thái đặt vé',
        path: '/admin/bookings',
        accent: 'card-accent--green',
    },
]

export default function AdminHomePage() {
    const navigate = useNavigate()

    return (
        <div className="admin-page fade-in">
            <div className="container">
                {/* Header */}
                <div className="admin-home__header">
                    <h1 className="admin-page__title">
                        Admin <span>Dashboard</span>
                    </h1>
                    <p className="admin-page__count">Chọn một mục để bắt đầu quản lý</p>
                </div>

                {/* Cards Grid */}
                <div className="admin-home__grid">
                    {ADMIN_CARDS.map((card) => (
                        <button
                            key={card.id}
                            className={`admin-home__card ${card.accent}`}
                            onClick={() => navigate(card.path)}
                            id={`admin-card-${card.id}`}
                        >
                            <div className="admin-home__card-glow" />
                            <span className="admin-home__card-icon">{card.icon}</span>
                            <h2 className="admin-home__card-label">{card.label}</h2>
                            <p className="admin-home__card-desc">{card.description}</p>
                            <span className="admin-home__card-arrow">→</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
