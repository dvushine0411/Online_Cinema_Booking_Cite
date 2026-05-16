import type { Showtime } from "./showtimeTypes";

export interface Seat {
    row: string;
    number: number;
    seatType: 'Standard' | 'VIP' | 'Sweetbox';

}

export interface Payment {
    transactionId: string;
    status: 'Pending' | 'Completed' | 'Failed';
    method: string;
    amount: number;
    bankCode: string;
    paidAt: string;
}

// Thông tin booking đầy đủ //

export interface Booking {
    _id: string;
    userID: string;
    showtimeID: Showtime;
    seats: Seat[];
    totalAmount: number;

    status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Refunded';
    payment: Payment;
    createdAt: string;
    updatedAt: string;
}

// Dữ liệu gửi lên khi tạo booking //

export interface CreateBookingPayload {
    showtimeID: string;
    seats: Seat[];
}


