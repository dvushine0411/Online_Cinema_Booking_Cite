import { Link } from 'react-router-dom'
import './NotFoundPage.css'

export default function NotFoundPage() {
    return (
        <div className="not-found fade-in">
            <div className="not-found__inner">
                <div className="not-found__code">404</div>
                <h1 className="not-found__title">Trang không tồn tại</h1>
                <p className="not-found__desc">
                    Trang bạn đang tìm kiếm đã bị xoá hoặc không tồn tại.
                </p>
                <Link to="/" className="btn-primary">
                    ← Về trang chủ
                </Link>
            </div>
        </div>
    )
}
