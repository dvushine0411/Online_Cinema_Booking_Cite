import api from "@/lib/axios";
import type { Booking } from "@/types/bookingTypes";
import type { CreateBookingPayload } from "@/types/bookingTypes";
import type { ApiResponse } from "@/types/apiTypes";


export const bookingService = {
    createBooking: async (payload: CreateBookingPayload): Promise<ApiResponse<Booking>> => {
        const response = await api.post("/booking", payload);
        return response.data;

    },

    getAllBookings: async (status?: string, userId?: string): Promise<ApiResponse<Booking[]>> => {
        const response = await api.get("/booking", { params: { ...api, ...(status && { status }), ...(userId && { userId }) } });
        return response.data;

    },

    getBookingById: async (id: string): Promise<ApiResponse<Booking>> => {
        const response = await api.get(`/booking/${id}`);
        return response.data;
    },

    cancelBooking: async (id: string): Promise<ApiResponse<Booking>> => {
        const response = await api.delete(`/booking/${id}`);
        return response.data;
    },

    updateBookingStatus: async (id: string, status: string): Promise<ApiResponse<Booking>> => {
        const response = await api.put(`/booking/${id}`, { status });
        return response.data;
    },

    getMyBookings: async (status?: string): Promise<ApiResponse<Booking[]>> => {
        const response = await api.get("/booking/my-bookings", { params: status ? { status } : undefined });
        return response.data;
    }

}