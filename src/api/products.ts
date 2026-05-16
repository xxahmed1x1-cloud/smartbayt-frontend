import { apiClient } from "./client";

export const productsApi = {
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    category?: string;
    search?: string;
    active?: boolean;
  }) => {
    const res = await apiClient.get("/api/products", { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get(`/api/products/${id}`);
    return res.data;
  },

  getBySlug: async (slug: string) => {
    const res = await apiClient.get(`/api/products/slug/${slug}`);
    return res.data;
  },

  create: async (data: any) => {
    const res = await apiClient.post("/api/products", data);
    return res.data;
  },

  update: async (id: string, data: any) => {
    const res = await apiClient.put(`/api/products/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/api/products/${id}`);
  },
};