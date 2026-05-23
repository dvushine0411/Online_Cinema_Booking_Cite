import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container footer__inner">
                <div className="footer__brand">
                    <span className="footer__logo">🎬 Cinema<span>X</span></span>
                    <p>Trải nghiệm điện ảnh đỉnh cao.<br />Đặt vé nhanh — Chọn chỗ ngồi yêu thích.</p>
                </div>

                <div className="footer__col">
                    <h4>Khám phá</h4>
                    <Link to="/">Trang chủ</Link>
                    <Link to="/news">Tin tức</Link>
                    <Link to="/my-bookings">Vé của tôi</Link>
                </div>

                <div className="footer__col">
                    <h4>Tài khoản</h4>
                    <Link to="/auth/signin">Đăng nhập</Link>
                    <Link to="/auth/signup">Đăng ký</Link>
                </div>
            </div>

            <div className="footer__bottom">
                <div className="container">
                    <p>© {new Date().getFullYear()} CinemaX. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
