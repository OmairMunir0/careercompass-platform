// src/services/authService.ts
import axiosInstance from "../lib/axiosInstance";

export type RegisterDto = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  companyName?: string;
  companyWebsite?: string;
  position?: string;
};

export type LoginDto = {
  email: string;
  password: string;
};

export type ChangeEmailDto = { newEmail: string };
export type ChangePasswordDto = { oldPassword: string; newPassword: string };

export const authService = {
  register: async (payload: RegisterDto) => {
    const response = await axiosInstance.post("/auth/register", payload);
    return response.data;
  },

  login: async (payload: LoginDto) => {
    const response = await axiosInstance.post("/auth/login", payload);
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post("/auth/logout");
    return response.data;
  },

  changeEmail: async (payload: ChangeEmailDto) => {
    const response = await axiosInstance.post("/auth/change-email", payload);
    return response.data;
  },

  changePassword: async (payload: ChangePasswordDto) => {
    const response = await axiosInstance.post("/auth/change-password", payload);
    return response.data;
  },
};
