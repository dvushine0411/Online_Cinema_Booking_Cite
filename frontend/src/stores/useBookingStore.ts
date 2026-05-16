import { create } from "zustand";
import { bookingService } from "@/services/bookingService";
import type { Booking, CreateBookingPayload } from "@/types/bookingTypes";


interface BookingState {
    myBookings: Booking[];
    selectedBooking: Booking | null;
    isLoading: boolean;
    error: string | null;

    createBooking: (payload: CreateBookingPayload) => Promise<Booking>;
    fetchMyBookings: (status?: string) => Promise<void>;
    fetchBookingById: (id: string) => Promise<void>;
    cancelBooking: (id: string) => Promise<void>;
    clearSelectedBooking: () => void;
    clearError: () => void;
}


export const useBookingStore = create<BookingState>((set) => ({
    myBookings: [],
    selectedBooking: null,
    isLoading: false,
    error: null,

    createBooking: async (payload) => {
        set({ isLoading: true, error: null });
        try {
            const response = await bookingService.createBooking(payload);
            return response.data;
        } catch (err: any) {
            set({ error: err.response?.data?.message ?? "Lỗi đặt vé" });
            throw err;
        } finally {
            set({ isLoading: false });
        }
    },

    fetchMyBookings: async (status) => {
        set({ isLoading: true, error: null });
        try {
            const response = await bookingService.getMyBookings(status);
            set({ myBookings: response.data });
        } catch (err: any) {
            set({ error: err.response?.data?.message ?? "Lỗi tải lịch sử đặt vé" });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchBookingById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await bookingService.getBookingById(id);
            set({ selectedBooking: response.data });
        } catch (err: any) {
            set({ error: err.response?.data?.message ?? "Lỗi tải thông tin booking" });
        } finally {
            set({ isLoading: false });
        }
    },

    cancelBooking: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await bookingService.cancelBooking(id);
            set((state) => ({
                myBookings: state.myBookings.map((b) =>
                    b._id === id ? { ...b, status: "Cancelled" } : b
                ),
            }));
        } catch (err: any) {
            set({ error: err.response?.data?.message ?? "Lỗi huỷ booking" });
            throw err;
        } finally {
            set({ isLoading: false });
        }
    },

    clearSelectedBooking: () => set({ selectedBooking: null }),
    clearError: () => set({ error: null }),
}));
