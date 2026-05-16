import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/services/authService";
import type { User, SigninPayload, SignupPayload } from "@/types/authTypes";


interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;

    signIn: (payload: SigninPayload) => Promise<void>;
    signUp: (payload: SignupPayload) => Promise<void>;
    signOut: () => Promise<void>;
    setAccessToken: (token: string) => void;
    clearAuth: () => void;
}


export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,

            signIn: async (payload) => {
                const data = await authService.signIn(payload);
                localStorage.setItem("accessToken", data.accessToken);
                set({
                    user: data.user,
                    accessToken: data.accessToken,
                    isAuthenticated: true,
                });
            },

            signUp: async (payload) => {
                const data = await authService.signUp(payload);
                localStorage.setItem("accessToken", data.accessToken);
                set({
                    user: data.user,
                    accessToken: data.accessToken,
                    isAuthenticated: true,
                });
            },

            signOut: async () => {
                await authService.signOut();
                localStorage.removeItem("accessToken");
                set({
                    user: null,
                    accessToken: null,
                    isAuthenticated: false,
                });
            },

            setAccessToken: (token) => {
                localStorage.setItem("accessToken", token);
                set({ accessToken: token });
            },

            clearAuth: () => {
                localStorage.removeItem("accessToken");
                set({
                    user: null,
                    accessToken: null,
                    isAuthenticated: false,
                });
            },
        }),
        {
            name: "auth-storage",
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
