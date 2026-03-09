import { authService } from "@/services/authService";
import { ISafeUser, userService } from "@/services/userService";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  role: string | null;
  user: ISafeUser | null;

  setToken: (token: string | null) => void;
  setRole: (role: string | null) => void;
  setUser: (user: ISafeUser | null) => void;

  isAuthenticated: () => boolean;
  isCandidate: () => boolean;
  isRecruiter: () => boolean;

  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: "candidate" | "recruiter";
    companyName?: string;
    companyWebsite?: string;
    position?: string;
  }) => Promise<void>;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      role: null,
      user: null,

      setToken: (token) => set({ token }),
      setRole: (role) => set({ role }),
      setUser: (user) => set({ user }),

      isAuthenticated: () => !!get().token,
      isCandidate: () => get().role === "candidate",
      isRecruiter: () => get().role === "recruiter",

      register: async (data) => {
        const res = await authService.register(data);
        const { token, user, role } = res.data;
        set({ token, user, role });
      },

      login: async (email, password) => {
        const res = await authService.login({ email, password });
        const { token, user, role } = res.data;
        set({ token, user, role });
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (err) {
          console.error("Logout failed:", err);
        } finally {
          set({ token: null, user: null, role: null });
        }
      },

      fetchCurrentUser: async () => {
        const token = get().token;
        if (!token) return;

        try {
          const res = await userService.getMe();
          const user: ISafeUser = res.data;
          set({ user, role: user.role });
        } catch (err) {
          console.error("Fetching current user failed:", err);
        }
      },
    }),
    {
      name: "auth-storage",
      skipHydration: true,  
      version: 0,
      partialize: (state) => ({
        token: state.token,
        role: state.role,
        user: state.user,
      }),
    }
  )
);
