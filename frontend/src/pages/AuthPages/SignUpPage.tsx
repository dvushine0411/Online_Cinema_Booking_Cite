import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import toast from 'react-hot-toast'
import './AuthPage.css'

export default function SignUpPage() {
    const [form, setForm] = useState({ email: '', username: '', fullname: '', password: '' })
    const [loading, setLoading] = useState(false)
    const { signUp } = useAuthStore()
    const navigate = useNavigate()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.email || !form.username || !form.fullname || !form.password) {
            toast.error('Vui lòng nhập đầy đủ thông tin')
            return
        }
        setLoading(true)
        try {
            await signUp(form)
            toast.success('Đăng ký thành công!')
            navigate('/')
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? 'Đăng ký thất bại')
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
                    <h1 className="auth-card__title">Đăng ký</h1>
                    <p className="auth-card__sub">Tạo tài khoản để đặt vé ngay!</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-form__field">
                        <label className="auth-form__label">Họ và tên</label>
                        <input className="input" name="fullname" placeholder="Nguyễn Văn A" value={form.fullname} onChange={handleChange} />
                    </div>
                    <div className="auth-form__field">
                        <label className="auth-form__label">Email</label>
                        <input className="input" type="email" name="email" placeholder="email@example.com" value={form.email} onChange={handleChange} />
                    </div>
                    <div className="auth-form__field">
                        <label className="auth-form__label">Tên đăng nhập</label>
                        <input className="input" name="username" placeholder="username" value={form.username} onChange={handleChange} />
                    </div>
                    <div className="auth-form__field">
                        <label className="auth-form__label">Mật khẩu</label>
                        <input className="input" type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} />
                    </div>

                    <button type="submit" className="btn-primary auth-form__submit" disabled={loading}>
                        {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                    </button>
                </form>

                <p className="auth-card__switch">
                    Đã có tài khoản?{' '}
                    <Link to="/auth/signin" className="text-gold">Đăng nhập</Link>
                </p>
            </div>
        </div>
    )
}
