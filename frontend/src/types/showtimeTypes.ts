import type { Movie } from "./movieTypes";
import type { Room } from "./roomTypes";

export interface TicketPrices {
    standard: number;
    vip: number;
    sweetbox: number;
}

// Thông tin suất chiếu (đã populate) được backend trả về //

export interface Showtime {
    _id: string;
    movieID: Movie;
    roomID: Room;
    startTime: string;
    endTime: string;
    ticketPrices: TicketPrices;
}

// Thông tin suất chiếu (chưa populate) đươcj gửi về backend //
export interface ShowtimeRaw {
    _id: string;
    movieID: string;
    roomID: string;
    bookedSeat: string[];
    startTime: string;
    endTime: string;
    ticketPrices: TicketPrices;
}

export interface ShowtimeFilter {
    movieID?: string;
    roomID?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
}

export interface UpdateShowtimePayload {
    startTime: string;
    endTime: string;
    ticketPrices: TicketPrices;
}

export interface CreateShowtimePayload {
    movieID: string;
    roomID: string;
    startTime: string;
    endTime: string;
    ticketPrices: TicketPrices;
}








