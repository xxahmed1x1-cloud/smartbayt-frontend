import { apiClient } from "./client";

export const categoriesApi = {
  getAll: async () => {
    const res = await apiClient.get("/api/categories");
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get(`/api/categories/${id}`);
    return res.data;
  },

  create: async (data: {
    name: string;
    slug: string;
    icon?: string;
    displayOrder: number;
  }) => {
    const res = await apiClient.post("/api/categories", data);
    return res.data;
  },

  update: async (id: string, data: {
    name: string;
    slug: string;
    icon?: string;
    displayOrder: number;
  }) => {
    const res = await apiClient.put(`/api/categories/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/api/categories/${id}`);
  },
};