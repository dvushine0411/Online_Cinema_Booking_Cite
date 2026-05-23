import { useEffect, useState } from "react";
import { bookingService } from "@/services/bookingService";
import type { Booking } from "@/types/bookingTypes";
import toast from "react-hot-toast";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import { BOOKING_STATUS_COLOR } from "@/lib/constants";


export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [updating, setUpdating] = useState<string | null>(null);

    const fetchBookings = async () => {

        setIsLoading(true);
        try {
            const res = await bookingService.getAllBookings(filterStatus || undefined);
            setBookings(res.data);


        } catch (error) {
            toast.error("Không thể tải danh sách đặt vé");

        } finally {
            setIsLoading(false);
        }

    }

    useEffect(() => {
        fetchBookings()
    }, [filterStatus]);

    const handleStatusChange = async (id: string, status: string) => {
        setUpdating(id);
        try {

            await bookingService.updateBookingStatus(id, status);
            toast.success("Cập nhật trạng thái thành công");
            fetchBookings();

        } catch (error) {
            toast.error("Không thể cập nhật trạng thái");

        } finally {

            setUpdating(null);
        }
    }

    return (
        <div className="admin-page fade-in">
            <div className="container">
                <div className="admin-page__header">
                    <div>
                        <h1 className="admin-page__title">Quản lý <span>Đặt vé</span></h1>
                        <p className="admin-page__count">{bookings.length} booking</p>
                    </div>
                    <select
                        className="admin-filter-select"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Refunded">Refunded</option>
                    </select>
                </div>
                {isLoading ? (
                    <div className="admin-table-skeleton" />
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Khách hàng</th>
                                    <th>Suất chiếu</th>
                                    <th>Ghế</th>
                                    <th>Tổng tiền</th>
                                    <th>Ngày đặt</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((b) => (
                                    <tr key={b._id}>
                                        <td>
                                            <p className="admin-movie-title">{(b.userID as any)?.fullname ?? '—'}</p>
                                            <p className="admin-movie-genres">{(b.userID as any)?.email ?? ''}</p>
                                        </td>
                                        <td className="admin-cell-muted">
                                            {b.showtimeID?.movieID?.title ?? '—'}<br />
                                            {b.showtimeID?.startTime ? formatDateTime(b.showtimeID.startTime) : ''}
                                        </td>
                                        <td className="admin-cell-muted">
                                            {b.seats.map(s => `${s.row}${s.number}`).join(', ')}
                                        </td>
                                        <td>
                                            <span className="admin-rating">{formatCurrency(b.totalAmount)}</span>
                                        </td>
                                        <td className="admin-cell-muted">{formatDateTime(b.createdAt)}</td>
                                        <td>
                                            <span
                                                className="badge"
                                                style={{ background: BOOKING_STATUS_COLOR[b.status] + '22', color: BOOKING_STATUS_COLOR[b.status], border: `1px solid ${BOOKING_STATUS_COLOR[b.status]}` }}
                                            >
                                                {b.status}
                                            </span>
                                        </td>
                                        <td>
                                            <select
                                                className="admin-status-select"
                                                value={b.status}
                                                disabled={updating === b._id}
                                                onChange={(e) => handleStatusChange(b._id, e.target.value)}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Confirmed">Confirmed</option>
                                                <option value="Cancelled">Cancelled</option>
                                                <option value="Refunded">Refunded</option>
                                            </select>
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