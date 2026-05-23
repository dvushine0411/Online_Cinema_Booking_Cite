import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import './PaymentCallbackPage.css'

export default function PaymentCallbackPage() {
    const [searchParams] = useSearchParams()
    const [status, setStatus] = useState<'loading' | 'success' | 'fail'>('loading')
    const [message, setMessage] = useState('')

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                // Gửi toàn bộ query params từ VNPay lên backend để verify chữ ký & cập nhật DB
                const queryString = searchParams.toString()
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/payments/vnpay-callback?${queryString}`
                )
                if (response.data.status === 'success') {
                    setStatus('success')
                } else {
                    setStatus('fail')
                    setMessage(response.data.message || 'Giao dịch không thành công.')
                }
            } catch (err: any) {
                setStatus('fail')
                setMessage(err?.response?.data?.message || 'Có lỗi xảy ra khi xác thực thanh toán.')
            }
        }

        verifyPayment()
    }, [searchParams])

    return (
        <div className="payment-callback fade-in">
            {status === 'loading' && (
                <div className="payment-callback__inner">
                    <div className="spinner" />
                    <p>Đang xác thực thanh toán...</p>
                </div>
            )}

            {status === 'success' && (
                <div className="payment-callback__inner payment-callback__inner--success">
                    <div className="payment-callback__icon">✅</div>
                    <h1>Thanh toán thành công!</h1>
                    <p>Vé của bạn đã được xác nhận. Chúc bạn xem phim vui vẻ!</p>
                    <div className="payment-callback__actions">
                        <Link to="/my-bookings" className="btn-primary">Xem vé của tôi</Link>
                        <Link to="/" className="btn-secondary">Về trang chủ</Link>
                    </div>
                </div>
            )}

            {status === 'fail' && (
                <div className="payment-callback__inner payment-callback__inner--fail">
                    <div className="payment-callback__icon">❌</div>
                    <h1>Thanh toán thất bại</h1>
                    <p>{message || 'Giao dịch không thành công. Vui lòng thử lại.'}</p>
                    <div className="payment-callback__actions">
                        <Link to="/" className="btn-primary">Về trang chủ</Link>
                    </div>
                </div>
            )}
        </div>
    )
}
