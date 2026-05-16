import { apiClient } from "./client";

export const authApi = {
  register: async (email: string, password: string, fullName?: string) => {
    const res = await apiClient.post("/api/auth/register", { email, password, fullName });
    return res.data;
  },

  login: async (email: string, password: string) => {
    const res = await apiClient.post("/api/auth/login", { email, password });
    return res.data;
  },

  me: async () => {
    const res = await apiClient.get("/api/auth/me");
    return res.data;
  },

  updateProfile: async (data: {
    fullName?: string;
    avatarUrl?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => {
    const res = await apiClient.put("/api/auth/profile", data);
    return res.data;
  },

  forgotPassword: async (email: string) => {
    const res = await apiClient.post("/api/auth/forgot-password", { email });
    return res.data;
  },

  resetPassword: async (email: string, code: string, newPassword: string) => {
    const res = await apiClient.post("/api/auth/reset-password", { email, code, newPassword });
    return res.data;
  },
};