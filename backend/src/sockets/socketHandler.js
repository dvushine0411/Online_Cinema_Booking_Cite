// backend/src/sockets/socketHandler.js
import jwt from 'jsonwebtoken';
import Showtime from '../models/Showtime.js';

// In-Memory Store: Map<showtimeId, Map<seatId, { userId, timer }>>
const heldSeats = new Map();

const HOLD_DURATION_MS = 5 * 60 * 1000; // 5 phút

// Helper: lấy hoặc tạo map ghế cho một suất chiếu
const getShowtimeMap = (showtimeId) => {
    if (!heldSeats.has(showtimeId)) {
        heldSeats.set(showtimeId, new Map());
    }
    return heldSeats.get(showtimeId);
};

// Helper: nhả ghế và broadcast
const releaseSeat = (io, showtimeId, seatId) => {
    const showtimeMap = heldSeats.get(showtimeId);
    if (!showtimeMap) return;

    const holdData = showtimeMap.get(seatId);
    if (holdData) {
        clearTimeout(holdData.timer); // clear timer nếu còn
        showtimeMap.delete(seatId);
    }

    // Broadcast cho tất cả trong phòng
    io.to(showtimeId).emit('seat_released', { seatId, showtimeId });
    console.log(`[Socket] Seat ${seatId} released in showtime ${showtimeId}`);
};

// Middleware xác thực JWT cho Socket.io
export const socketAuthMiddleware = (socket, next) => {
    // Token có thể gửi qua handshake auth hoặc query
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    console.log("=== KIỂM TRA KẾT NỐI SOCKET ===");
    console.log("Auth payload:", token);

    if (!token) {
        return next(new Error('Authentication error: No token provided'));
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        socket.userId = decoded.id;   // Gắn userId vào socket object
        socket.userRole = decoded.role;
        next();
    } catch (err) {
        console.log('[Socket Middleware] ❌ Bị đuổi vì TOKEN SAI / HẾT HẠN');
        next(new Error('Authentication error: Invalid token'));
    }
};

// Handler chính - gọi từ server.js
export const initSocketHandler = (io) => {
    // Áp dụng middleware auth cho TẤT CẢ connections
    io.use(socketAuthMiddleware);

    io.on('connection', (socket) => {
        console.log(`[Socket] User ${socket.userId} connected: ${socket.id}`);

        // Event 1: User vào trang chọn ghế → join room
        socket.on('join_showtime', async (showtimeId) => {
            if (!showtimeId) return;

            // Rời phòng cũ nếu đang ở phòng khác (user chuyển tab)
            // (Socket.io tự quản lý, chỉ cần join phòng mới)
            socket.join(showtimeId);
            socket.currentShowtimeId = showtimeId; // lưu để dùng khi disconnect

            console.log(`[Socket] User ${socket.userId} joined showtime room: ${showtimeId}`);

            // Gửi lại danh sách ghế đang bị held hiện tại cho user mới vào
            const showtimeMap = getShowtimeMap(showtimeId);
            const currentHeldSeats = Array.from(showtimeMap.entries()).map(([seatId, data]) => ({
                seatId,
                heldByMe: data.userId === socket.userId
            }));

            socket.emit('current_held_seats', currentHeldSeats);
        });

        // Event 2: User bấm chọn ghế → hold seat
        socket.on('hold_seat', async ({ showtimeId, seatId }) => {
            if (!showtimeId || !seatId) return;

            const showtimeMap = getShowtimeMap(showtimeId);

            // === ATOMIC CHECK: JavaScript single-threaded đảm bảo không race condition ===
            if (showtimeMap.has(seatId)) {
                // Ghế đang bị hold bởi người khác
                socket.emit('hold_seat_failed', {
                    seatId,
                    message: 'Ghế này đang được người khác giữ'
                });
                return;
            }

            // Kiểm tra thêm trong DB: ghế có bị booked cứng không?
            try {
                const showtime = await Showtime.findById(showtimeId).select('bookedSeat');
                if (showtime && showtime.bookedSeat.includes(seatId)) {
                    socket.emit('hold_seat_failed', {
                        seatId,
                        message: 'Ghế này đã được đặt'
                    });
                    return;
                }
            } catch (err) {
                console.error('[Socket] DB check error:', err.message);
                socket.emit('hold_seat_failed', { seatId, message: 'Lỗi hệ thống' });
                return;
            }

            // Set timer tự động nhả ghế sau 5 phút
            const timer = setTimeout(() => {
                const currentData = heldSeats.get(showtimeId)?.get(seatId);
                // Nếu user đã chuyển sang bước thanh toán (isPaying == true) → KHÔNG nhả ghế
                if (currentData?.isPaying) {
                    console.log(`[Socket] Seat ${seatId} hold expired but user is paying — skipped release`);
                    return;
                }
                // Nếu isPaying == false -> Nhả ghế //
                releaseSeat(io, showtimeId, seatId);
                socket.emit('hold_expired', { seatId, showtimeId });
            }, HOLD_DURATION_MS);

            // Ghi vào Map (atomic)
            showtimeMap.set(seatId, {
                userId: socket.userId,
                socketId: socket.id,
                timer,
                heldAt: Date.now()
            });

            // Xác nhận cho chính user A: hold thành công
            socket.emit('hold_seat_success', {
                seatId,
                expiresAt: Date.now() + HOLD_DURATION_MS
            });

            // Broadcast cho TẤT CẢ người khác trong phòng
            socket.to(showtimeId).emit('seat_held', { seatId });

            console.log(`[Socket] Seat ${seatId} held by user ${socket.userId} in showtime ${showtimeId}`);
        });

        // Event 3: User bỏ chọn ghế → release seat
        socket.on('release_seat', ({ showtimeId, seatId }) => {
            if (!showtimeId || !seatId) return;

            const showtimeMap = heldSeats.get(showtimeId);
            if (!showtimeMap) return;

            const holdData = showtimeMap.get(seatId);

            // Chỉ cho phép user đang hold ghế đó mới được nhả
            if (!holdData || holdData.userId !== socket.userId) {
                socket.emit('release_seat_failed', { seatId, message: 'Bạn không giữ ghế này' });
                return;
            }

            releaseSeat(io, showtimeId, seatId);
        });

        // Event 4: Thanh toán thành công → confirm booking
        // (Gọi từ paymentController sau khi VNPay callback thành công)

        // Event 5: Disconnect → tự động nhả tất cả ghế đang hold
        socket.on('disconnect', () => {
            console.log(`[Socket] User ${socket.userId} disconnected: ${socket.id}`);

            const showtimeId = socket.currentShowtimeId;
            if (!showtimeId) return;

            const showtimeMap = heldSeats.get(showtimeId);
            if (!showtimeMap) return;

            // Tìm và nhả tất cả ghế đang hold bởi socket này
            for (const [seatId, holdData] of showtimeMap.entries()) {
                if (holdData.socketId === socket.id) {
                    releaseSeat(io, showtimeId, seatId);
                }
            }
        });
    });
};

// Gọi từ bookingController sau khi createBooking thành công
// Đánh dấu các ghế đang trong quá trình thanh toán → timer 5 phút sẽ bỏ qua
export const markSeatsAsPaying = (showtimeId, seatIds, userId) => {
    const showtimeMap = heldSeats.get(showtimeId);
    if (!showtimeMap) return;

    for (const seatId of seatIds) {
        const holdData = showtimeMap.get(seatId);
        // Chỉ đánh dấu nếu chính user đó đang giữ ghế
        if (holdData && holdData.userId === userId) {
            holdData.isPaying = true;
            console.log(`[Socket] Seat ${seatId} marked as paying by user ${userId}`);
        }
    }
};

// Hàm này gọi từ paymentController khi VNPay callback thành công
// io được export từ server.js
export const confirmBookedSeats = (io, showtimeId, seatIds) => {
    for (const seatId of seatIds) {
        // Dọn dẹp held seat khỏi Map (timer đã chạy, clear nó đi)
        const showtimeMap = heldSeats.get(showtimeId);
        if (showtimeMap) {
            const holdData = showtimeMap.get(seatId);
            if (holdData) clearTimeout(holdData.timer);
            showtimeMap.delete(seatId);
        }
    }

    // Broadcast: ghế đã được book cứng
    io.to(showtimeId).emit('seat_booked_success', { seatIds, showtimeId });
    console.log(`[Socket] Seats ${seatIds.join(', ')} confirmed booked in showtime ${showtimeId}`);
};


// Bỏ qua hoàn toàn flag isPaying — dọn Map + broadcast seat_released để tránh ghế bị liệt vĩnh viễn.
export const forceReleaseSeats = (io, showtimeId, seatIds) => {
    for (const seatId of seatIds) {
        releaseSeat(io, showtimeId, seatId); // releaseSeat đã xử lý: clearTimeout + delete Map + broadcast
    }
    console.log(`[Socket] Force-released seats [${seatIds.join(', ')}] in showtime ${showtimeId} by scheduler`);
};
