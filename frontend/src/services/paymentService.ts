import api from "@/lib/axios";


export interface CreatePaymentResponse {
    message: string;
    paymentUrl: string;
    bookingId: string;
    amount: number;
}

export interface PaymentStatusResponse {
    message: string;
    bookingId: string;
    bookingStatus: "Pending" | "Confirmed" | "Cancelled" | "Refunded";
    paymentStatus: "Pending" | "Completed" | "Failed" | "Not initiated";
    paymentMethod?: string;
    amount: number;
    paidAt?: string;
    transactionId?: string;
}


export const paymentService = {

    createPayment: async (bookingId: string): Promise<CreatePaymentResponse> => {
        const response = await api.post("payments/create", { bookingId });
        return response.data;
    },

    checkPaymentStatus: async (bookingId: string): Promise<PaymentStatusResponse> => {
        const response = await api.get(`payments/${bookingId}`);
        return response.data;
    },
};
