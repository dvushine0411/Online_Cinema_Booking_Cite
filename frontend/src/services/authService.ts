import api from "@/lib/axios";
import type { SignupPayload, SigninPayload } from "@/types/authTypes";


export const authService = {
    signUp: async (payload: SignupPayload) => {
        const response = await api.post(
            "auth/signup",
            payload,
            { withCredentials: true }
        );

        return response.data;
    },

    signIn: async (payload: SigninPayload) => {
        const response = await api.post(
            "auth/signin",
            payload,
            { withCredentials: true }
        );

        return response.data;

    },

    signOut: async () => {
        const response = await api.post(
            "auth/signout",
            {},
            { withCredentials: true }
        );
        return response.data;

    },

    refreshToken: async () => {
        const response = await api.post(
            "auth/refresh",
            { withCredentials: true }
        );
        return response.data.accessToken;
    }

}


