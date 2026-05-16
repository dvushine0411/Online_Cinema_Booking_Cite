import api from "@/lib/axios";
import type { ApiResponse } from "@/types/apiTypes";
import type { Room, SeatLayout } from "@/types/roomTypes";


export interface CreateRoomPayload {
    name: string;
    seatLayouts: SeatLayout[];
}


export const roomService = {

    getAllRooms: async (): Promise<{ data: Room[] }> => {
        const response = await api.get("rooms");
        return response.data;
    },

    getRoomById: async (id: string): Promise<{ data: Room }> => {
        const response = await api.get(`rooms/${id}`);
        return response.data;
    },

    createRoom: async (payload: CreateRoomPayload): Promise<ApiResponse<Room>> => {
        const response = await api.post("rooms/create", payload);
        return response.data;
    },

    deleteRoom: async (id: string): Promise<{ message: string }> => {
        const response = await api.delete(`rooms/delete/${id}`);
        return response.data;
    },


    updateRoom: async (
        id: string,
        payload: Partial<CreateRoomPayload>
    ): Promise<ApiResponse<Room>> => {
        const response = await api.patch(`rooms/update/${id}`, payload);
        return response.data;
    },
};
