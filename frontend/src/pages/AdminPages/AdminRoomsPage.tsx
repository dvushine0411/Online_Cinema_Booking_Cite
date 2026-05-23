import { useEffect, useState } from 'react'
import { roomService } from '@/services/roomService'
import type { Room } from '@/types/roomTypes'
import toast from 'react-hot-toast'
import './AdminPages.css'

export default function AdminRoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [deleting, setDeleting] = useState<string | null>(null)

    const fetchRooms = async () => {
        setIsLoading(true)
        try {
            const res = await roomService.getAllRooms()
            setRooms(res.data)
        } catch {
            toast.error('Không thể tải danh sách phòng chiếu')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => { fetchRooms() }, [])

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Xoá phòng "${name}"?`)) return
        setDeleting(id)
        try {
            await roomService.deleteRoom(id)
            toast.success('Đã xoá phòng chiếu')
            fetchRooms()
        } catch {
            toast.error('Không thể xoá phòng chiếu')
        } finally {
            setDeleting(null)
        }
    }

    const countSeatsByType = (room: Room, type: string) =>
        room.seatLayouts.filter(s => s.type === type).length

    return (
        <div className="admin-page fade-in">
            <div className="container">
                <div className="admin-page__header">
                    <div>
                        <h1 className="admin-page__title">Quản lý <span>Phòng chiếu</span></h1>
                        <p className="admin-page__count">{rooms.length} phòng</p>
                    </div>
                    <a href="/admin/rooms/create" className="btn-primary">+ Thêm phòng</a>
                </div>

                {isLoading ? (
                    <div className="admin-table-skeleton" />
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Tên phòng</th>
                                    <th>Tổng ghế</th>
                                    <th>Standard</th>
                                    <th>VIP</th>
                                    <th>Sweetbox</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rooms.map((r) => (
                                    <tr key={r._id}>
                                        <td>
                                            <p className="admin-movie-title">{r.name}</p>
                                        </td>
                                        <td className="admin-cell-muted">{r.seatLayouts.length} ghế</td>
                                        <td className="admin-cell-muted">{countSeatsByType(r, 'Standard')}</td>
                                        <td className="admin-cell-muted">{countSeatsByType(r, 'VIP')}</td>
                                        <td className="admin-cell-muted">{countSeatsByType(r, 'Sweetbox')}</td>
                                        <td>
                                            <div className="admin-actions">
                                                <a href={`/admin/rooms/edit/${r._id}`} className="admin-btn-edit">Sửa</a>
                                                <button
                                                    className="admin-btn-delete"
                                                    onClick={() => handleDelete(r._id, r.name)}
                                                    disabled={deleting === r._id}
                                                >
                                                    {deleting === r._id ? '...' : 'Xoá'}
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
