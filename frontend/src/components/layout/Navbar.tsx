import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import toast from 'react-hot-toast'
import './Navbar.css'

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const { user, isAuthenticated, signOut } = useAuthStore()
    const navigate = useNavigate()

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const handleSignOut = async () => {
        await signOut()
        toast.success('Đã đăng xuất')
        navigate('/')
    }

    return (
        <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
            <div className="container navbar__inner">

                {/* Logo */}
                <Link to="/" className="navbar__logo">
                    <span className="navbar__logo-icon">🎬</span>
                    <span className="navbar__logo-text">
                        Cinema<span>X</span>
                    </span>
                </Link>

                {/* Nav links */}
                <nav className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
                    <NavLink to="/" end className={({ isActive }) => isActive ? 'navbar__link navbar__link--active' : 'navbar__link'}>
                        Trang chủ
                    </NavLink>
                    <NavLink to="/news" className={({ isActive }) => isActive ? 'navbar__link navbar__link--active' : 'navbar__link'}>
                        Tin tức
                    </NavLink>
                    {isAuthenticated && (
                        <NavLink to="/my-bookings" className={({ isActive }) => isActive ? 'navbar__link navbar__link--active' : 'navbar__link'}>
                            Vé của tôi
                        </NavLink>
                    )}
                    {user?.role === 'Admin' && (
                        <NavLink to="/admin/movies" className={({ isActive }) => isActive ? 'navbar__link navbar__link--active' : 'navbar__link'}>
                            Quản trị
                        </NavLink>
                    )}
                </nav>

                {/* Right actions */}
                <div className="navbar__actions">
                    {isAuthenticated ? (
                        <div className="navbar__user">
                            <span className="navbar__greeting">
                                Xin chào, <strong>{user?.fullname}</strong>
                            </span>
                            <div className="navbar__avatar">
                                {user?.fullname?.charAt(0).toUpperCase() ?? 'U'}
                            </div>
                            <div className="navbar__dropdown">
                                <Link to="/my-bookings" className="navbar__dropdown-item">
                                    🎟️ Vé của tôi
                                </Link>
                                {user?.role === 'Admin' && (
                                    <Link to="/admin/movies" className="navbar__dropdown-item">
                                        ⚙️ Quản trị
                                    </Link>
                                )}
                                <button onClick={handleSignOut} className="navbar__dropdown-item navbar__dropdown-item--danger">
                                    🚪 Đăng xuất
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="navbar__auth">
                            <Link to="/auth/signin" className="btn-ghost">Đăng nhập</Link>
                            <Link to="/auth/signup" className="btn-primary">Đăng ký</Link>
                        </div>
                    )}

                    {/* Mobile hamburger */}
                    <button
                        className="navbar__hamburger"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span className={menuOpen ? 'open' : ''}></span>
                        <span className={menuOpen ? 'open' : ''}></span>
                        <span className={menuOpen ? 'open' : ''}></span>
                    </button>
                </div>

            </div>
        </header>
    )
}
