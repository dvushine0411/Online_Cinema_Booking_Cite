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
        (set, get) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,

            signIn: async (payload) => {
                localStorage.clear();
                const data = await authService.signIn(payload);
                get().setAccessToken(data.accessToken);
                set({
                    user: data.user,
                    isAuthenticated: true,
                });
            },

            signUp: async (payload) => {
                const data = await authService.signUp(payload);
                get().setAccessToken(data.accessToken);
                set({
                    user: data.user,
                    isAuthenticated: true,
                });
            },

            signOut: async () => {
                await authService.signOut();
                get().clearAuth();
                set({
                    user: null,
                    accessToken: null,
                    isAuthenticated: false,
                });
            },

            setAccessToken: (token) => {
                set({ accessToken: token });
            },

            clearAuth: () => {
                set({
                    user: null,
                    accessToken: null,
                    isAuthenticated: false,
                });
                localStorage.clear();
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
