import { apiClient } from "./client";

export const ordersApi = {
  place: async (data: {
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    shippingAddress?: string;
    paymentMethod?: string;
    notes?: string;
    items: {
      productId?: string;
      productName: string;
      price: number;
      quantity: number;
    }[];
    couponCode?: string;
  }) => {
    const res = await apiClient.post("/api/orders", data);
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get(`/api/orders/${id}`);
    return res.data;
  },

  getAll: async (params?: { page?: number; pageSize?: number; status?: string }) => {
    const res = await apiClient.get("/api/orders", { params });
    return res.data;
  },

  getMine: async () => {
    const res = await apiClient.get("/api/orders/my");
    return res.data;
  },

  updateStatus: async (id: string, status: string) => {
    const res = await apiClient.patch(`/api/orders/${id}/status`, { status });
    return res.data;
  },
};