import { useEffect, useState } from 'react'
import { useShowtimeStore } from '@/stores/useShowtimeStore'
import { showtimeService } from '@/services/showtimeService'
import { formatDateTime, formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'
import './AdminPages.css'

export default function AdminShowtimesPage() {
    const { showtimes, isLoading, fetchShowtimes } = useShowtimeStore()
    const [deleting, setDeleting] = useState<string | null>(null)

    useEffect(() => { fetchShowtimes() }, [])

    const handleDelete = async (id: string) => {
        if (!confirm('Xoá suất chiếu này?')) return
        setDeleting(id)
        try {
            await showtimeService.deleteShowtime(id)
            toast.success('Đã xoá suất chiếu')
            fetchShowtimes()
        } catch {
            toast.error('Không thể xoá suất chiếu')
        } finally {
            setDeleting(null)
        }
    }

    return (
        <div className="admin-page fade-in">
            <div className="container">
                <div className="admin-page__header">
                    <div>
                        <h1 className="admin-page__title">Quản lý <span>Suất chiếu</span></h1>
                        <p className="admin-page__count">{showtimes.length} suất chiếu</p>
                    </div>
                    <a href="/admin/showtimes/create" className="btn-primary">+ Thêm suất chiếu</a>
                </div>

                {isLoading ? (
                    <div className="admin-table-skeleton" />
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Phim</th>
                                    <th>Phòng</th>
                                    <th>Bắt đầu</th>
                                    <th>Kết thúc</th>
                                    <th>Standard</th>
                                    <th>VIP</th>
                                    <th>Sweetbox</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {showtimes.map((s) => (
                                    <tr key={s._id}>
                                        <td>
                                            <p className="admin-movie-title">{s.movieID?.title ?? '—'}</p>
                                        </td>
                                        <td className="admin-cell-muted">{s.roomID?.name ?? '—'}</td>
                                        <td className="admin-cell-muted">{formatDateTime(s.startTime)}</td>
                                        <td className="admin-cell-muted">{formatDateTime(s.endTime)}</td>
                                        <td className="admin-cell-muted">{formatCurrency(s.ticketPrices.standard)}</td>
                                        <td className="admin-cell-muted">{formatCurrency(s.ticketPrices.vip)}</td>
                                        <td className="admin-cell-muted">{formatCurrency(s.ticketPrices.sweetbox)}</td>
                                        <td>
                                            <div className="admin-actions">
                                                <a href={`/admin/showtimes/edit/${s._id}`} className="admin-btn-edit">Sửa</a>
                                                <button
                                                    className="admin-btn-delete"
                                                    onClick={() => handleDelete(s._id)}
                                                    disabled={deleting === s._id}
                                                >
                                                    {deleting === s._id ? '...' : 'Xoá'}
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
