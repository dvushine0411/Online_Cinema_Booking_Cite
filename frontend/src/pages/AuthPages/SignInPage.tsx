import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import toast from 'react-hot-toast'
import './AuthPage.css'

export default function SignInPage() {
    const [form, setForm] = useState({ username: '', password: '' })
    const [loading, setLoading] = useState(false)
    const { signIn } = useAuthStore()
    const navigate = useNavigate()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.username || !form.password) {
            toast.error('Vui lòng nhập đầy đủ thông tin')
            return
        }
        setLoading(true)
        try {
            await signIn(form)
            toast.success('Đăng nhập thành công!')
            navigate('/')
        } catch (err: any) {
            toast.error('Sai mật khẩu hoặc tên đăng nhập. Vui lòng thử lại!');
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-page__backdrop" />

            <div className="auth-card fade-in">
                <div className="auth-card__header">
                    <Link to="/" className="auth-card__logo">🎬 Cinema<span>X</span></Link>
                    <h1 className="auth-card__title">Đăng nhập</h1>
                    <p className="auth-card__sub">Chào mừng trở lại!</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-form__field">
                        <label className="auth-form__label">Tên đăng nhập</label>
                        <input
                            className="input"
                            name="username"
                            placeholder="username"
                            value={form.username}
                            onChange={handleChange}
                            autoComplete="username"
                        />
                    </div>

                    <div className="auth-form__field">
                        <label className="auth-form__label">Mật khẩu</label>
                        <input
                            className="input"
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                        />
                    </div>

                    <button type="submit" className="btn-primary auth-form__submit" disabled={loading}>
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>

                <p className="auth-card__switch">
                    Chưa có tài khoản?{' '}
                    <Link to="/auth/signup" className="text-gold">Đăng ký ngay</Link>
                </p>
            </div>
        </div>
    )
}
