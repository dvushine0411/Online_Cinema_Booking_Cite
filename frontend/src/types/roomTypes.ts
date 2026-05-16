// 1 ghế trong phòng //

export interface SeatLayout {
    row: string;
    number: number;
    type: 'Standard' | 'VIP' | 'Sweetbox';
}

// Thông tin 1 phòng chiếu //

export interface Room {
    _id: string;
    name: string;
    seatLayouts: SeatLayout[];

}

export interface CreateRoomPayload {
    name: string;
    seatLayouts: SeatLayout[];
}

