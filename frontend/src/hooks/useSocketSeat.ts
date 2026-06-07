// frontend/src/hooks/useSocketSeat.ts
import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const RAW_URL = import.meta.env.VITE_API_URL;

const SOCKET_URL = RAW_URL.replace('/api', '');

export type SeatStatus = 'available' | 'held_by_me' | 'held_by_other' | 'booked';

interface UseSocketSeatOptions {
    showtimeId: string;
    token: string | null;
    onSeatHeld: (seatId: string) => void;
    onSeatReleased: (seatId: string) => void;
    onSeatBooked: (seatIds: string[]) => void;
    onHoldExpired: (seatId: string) => void;
    onCurrentHeldSeats: (seats: Array<{ seatId: string; heldByMe: boolean }>) => void;
}

export const useSocketSeat = ({
    showtimeId,
    token,
    onSeatHeld,
    onSeatReleased,
    onSeatBooked,
    onHoldExpired,
    onCurrentHeldSeats,
}: UseSocketSeatOptions) => {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!token || !showtimeId) return;

        console.log("[Socket Hook] Bắt đầu gọi lên Server với URL:", SOCKET_URL);
        // Tạo kết nối Socket với JWT token
        const socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket'], // Dùng WebSocket thay polling để nhanh hơn
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('[Socket] Connected:', socket.id);
            // Vào phòng suất chiếu ngay khi kết nối
            socket.emit('join_showtime', showtimeId);
        });

        socket.on('connect_error', (err) => {
            console.error('[Socket] Connection error:', err.message);
        });

        // ── Nhận events từ server ──────────────────────────
        socket.on('current_held_seats', onCurrentHeldSeats);
        socket.on('seat_held', ({ seatId }: { seatId: string }) => onSeatHeld(seatId));
        socket.on('seat_released', ({ seatId }: { seatId: string }) => onSeatReleased(seatId));
        socket.on('seat_booked_success', ({ seatIds }: { seatIds: string[] }) => onSeatBooked(seatIds));
        socket.on('hold_expired', ({ seatId }: { seatId: string }) => onHoldExpired(seatId));

        return () => {
            console.log('[Socket] Disconnecting...');
            socket.disconnect();
            socketRef.current = null;
        };
    }, [showtimeId, token]); // Reconnect nếu showtimeId hoặc token thay đổi

    // ── Actions gửi lên server ─────────────────────────────
    const holdSeat = useCallback((seatId: string) => {
        socketRef.current?.emit('hold_seat', { showtimeId, seatId });
    }, [showtimeId]);

    const releaseSeat = useCallback((seatId: string) => {
        socketRef.current?.emit('release_seat', { showtimeId, seatId });
    }, [showtimeId]);

    return { holdSeat, releaseSeat };
};
