import { apiClient } from "./client";

// ─── REVIEWS ─────────────────────────────────────────────
export const reviewsApi = {
  getAll: async (params?: { productId?: string; approved?: boolean }) => {
    const res = await apiClient.get("/api/reviews", { params });
    return res.data;
  },

  create: async (data: {
    productId?: string;
    authorName: string;
    rating: number;
    comment?: string;
  }) => {
    const res = await apiClient.post("/api/reviews", data);
    return res.data;
  },

  approve: async (id: string) => {
    const res = await apiClient.patch(`/api/reviews/${id}/approve`);
    return res.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/api/reviews/${id}`);
  },
};

// ─── COUPONS ─────────────────────────────────────────────
export const couponsApi = {
  getAll: async () => {
    const res = await apiClient.get("/api/coupons");
    return res.data;
  },

  create: async (data: any) => {
    const res = await apiClient.post("/api/coupons", data);
    return res.data;
  },

  update: async (id: string, data: any) => {
    const res = await apiClient.put(`/api/coupons/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/api/coupons/${id}`);
  },

  validate: async (code: string, cartTotal: number) => {
    const res = await apiClient.post("/api/coupons/validate", { code, cartTotal });
    return res.data;
  },
};

// ─── FAQS ────────────────────────────────────────────────
export const faqsApi = {
  getAll: async (active?: boolean) => {
    const res = await apiClient.get("/api/faqs", { params: { active } });
    return res.data;
  },

  create: async (data: any) => {
    const res = await apiClient.post("/api/faqs", data);
    return res.data;
  },

  update: async (id: string, data: any) => {
    const res = await apiClient.put(`/api/faqs/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/api/faqs/${id}`);
  },
};

// ─── BLOG ────────────────────────────────────────────────
export const blogApi = {
  getAll: async (published?: boolean) => {
    const res = await apiClient.get("/api/blog", { params: { published } });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get(`/api/blog/${id}`);
    return res.data;
  },

  create: async (data: any) => {
    const res = await apiClient.post("/api/blog", data);
    return res.data;
  },

  update: async (id: string, data: any) => {
    const res = await apiClient.put(`/api/blog/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/api/blog/${id}`);
  },
};

// ─── JOBS ────────────────────────────────────────────────
export const jobsApi = {
  getAll: async (active?: boolean) => {
    const res = await apiClient.get("/api/jobs", { params: { active } });
    return res.data;
  },

  create: async (data: any) => {
    const res = await apiClient.post("/api/jobs", data);
    return res.data;
  },

  update: async (id: string, data: any) => {
    const res = await apiClient.put(`/api/jobs/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/api/jobs/${id}`);
  },
};

// ─── SETTINGS ────────────────────────────────────────────
export const settingsApi = {
  getAll: async () => {
    const res = await apiClient.get("/api/settings");
    return res.data;
  },

  getByKey: async (key: string) => {
    const res = await apiClient.get(`/api/settings/${key}`);
    return res.data;
  },

  upsert: async (key: string, value: string) => {
    const res = await apiClient.put(`/api/settings/${key}`, { key, value }); // key + value مطلوبين في الـ DTO
    return res.data;
  },
};

// ─── CONTACT ─────────────────────────────────────────────
export const contactApi = {
  send: async (data: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
    attachmentUrl?: string;
  }) => {
    const res = await apiClient.post("/api/contact", data);
    return res.data;
  },

  getAll: async () => {
    const res = await apiClient.get("/api/contact");
    return res.data;
  },
};

// ─── DASHBOARD ───────────────────────────────────────────
export const dashboardApi = {
  get: async () => {
    const res = await apiClient.get("/api/dashboard");
    return res.data;
  },
};

// ─── UPLOAD ──────────────────────────────────────────────
export const uploadApi = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post("/api/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};