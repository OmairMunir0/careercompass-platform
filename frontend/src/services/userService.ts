// src/services/userService.ts
import axiosInstance from "../lib/axiosInstance";

export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  passwordHash: string;
  roleId: string;
  publicEmail: string | null;
  bio: string | null;
  location: string | null;
  phone: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  companyName: string | null;
  companyWebsite: string | null;
  position: string | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  subscriptionTier: "free" | "premium";
  subscriptionStatus: "inactive" | "active" | "expired" | "canceled";
  premiumExpiresAt: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeCheckoutSessionId: string | null;
  lastPaymentAt: string | null;
}

export interface ISafeUser {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  publicEmail: string | null;
  bio: string | null;
  location: string | null;
  phone: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  companyName: string | null;
  companyWebsite: string | null;
  position: string | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  subscriptionTier: "free" | "premium";
  subscriptionStatus: "inactive" | "active" | "expired" | "canceled";
  premiumExpiresAt: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripeCheckoutSessionId?: string | null;
  lastPaymentAt?: string | null;
  isPremiumActive?: boolean;
}

export type UpdateMeDto = Partial<
  Pick<
    IUser,
    | "firstName"
    | "lastName"
    | "username"
    | "publicEmail"
    | "bio"
    | "location"
    | "phone"
    | "linkedinUrl"
    | "portfolioUrl"
    | "companyName"
    | "companyWebsite"
    | "position"
    | "imageUrl"
  >
>;

export type UpdateUserDto = UpdateMeDto;

export type GetUsersQuery = Partial<{
  role: string;
  search: string;
  page: number;
  limit: number;
}>;

export const userService = {
  getMe: async () => {
    const response = await axiosInstance.get("/users/me");
    return response.data;
  },

  updateMe: async (payload: UpdateMeDto) => {
    const response = await axiosInstance.put("/users/me", payload);
    return response.data;
  },

  addProfileImage: async (file: File) => {
    const formData = new FormData();
    formData.append("profileImage", file);
    const response = await axiosInstance.post("/users/me/profile-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  removeProfileImage: async () => {
    const response = await axiosInstance.delete("/users/me/profile-image");
    return response.data;
  },

  addResume: async (file: File) => {
    const formData = new FormData();
    formData.append("profileResume", file);
    const response = await axiosInstance.post("/users/me/resume", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  removeResume: async () => {
    const response = await axiosInstance.delete("/users/me/resume");
    return response.data;
  },

  getUsers: async (query?: GetUsersQuery) => {
    const params = {
      role: query?.role,
      search: query?.search,
      page: query?.page,
      limit: query?.limit,
    };
    const response = await axiosInstance.get("/users", { params });
    return response.data;
  },

  getUser: async (id: string) => {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  },

  updateUser: async (id: string, payload: UpdateUserDto) => {
    const response = await axiosInstance.put(`/users/${id}`, payload);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await axiosInstance.delete(`/users/${id}`);
    return response.data;
  },

  getUsersByRole: async (role: string) => {
    const response = await axiosInstance.get(`/users/role/${role}`);
    return response.data;
  },
};
