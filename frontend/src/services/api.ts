import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const eventsApi = {
  getAll: (page = 1, limit = 12, featured = false, includeCompleted = false) =>
    api.get(`/events?page=${page}&limit=${limit}&featured=${featured}&includeCompleted=${includeCompleted}`),
  getBySlug: (slug: string) => api.get(`/events/${slug}`),
};

export const postsApi = {
  getAll: (page = 1, limit = 12) => api.get(`/posts?page=${page}&limit=${limit}`),
  getBySlug: (slug: string) => api.get(`/posts/${slug}`),
  getTags: () => api.get('/posts/tags'),
};

export const socialApi = {
  getConfigs: () => api.get('/social/configs'),
  getAdminConfigs: () => api.get('/social/admin/configs'),
  createConfig: (data: any) => api.post('/social/admin/configs', data),
  updateConfig: (id: string, data: any) => api.put(`/social/admin/configs/${id}`, data),
  deleteConfig: (id: string) => api.delete(`/social/admin/configs/${id}`),
  updateBatch: (items: any[]) => api.put('/social/admin/configs', { items }),
};

export const siteApi = {
  getSettings: () => api.get('/site/settings'),
  getSettingsFull: () => api.get('/site/settings/full'),
  updateSettings: (data: Record<string, string>) => api.put('/site/settings', data),
  getMenu: (location: string) => api.get(`/site/menu/${location}`),
  getMenuAll: () => api.get('/site/menu'),
  updateMenuBatch: (items: Array<{ id: string; order: number; isActive: boolean }>) => api.put('/site/menu/batch', { items }),
  createMenuItem: (data: any) => api.post('/site/menu', data),
  updateMenuItem: (id: string, data: any) => api.put(`/site/menu/${id}`, data),
  deleteMenuItem: (id: string) => api.delete(`/site/menu/${id}`),
  getContent: (section?: string) => api.get('/site/content', { params: section ? { section } : {} }),
  getContentAll: () => api.get('/site/content/admin'),
  createContent: (data: any) => api.post('/site/content', data),
  updateContent: (id: string, data: any) => api.put(`/site/content/${id}`, data),
  deleteContent: (id: string) => api.delete(`/site/content/${id}`),
  updatePage: (pageKey: string, data: { settings: Record<string, string>; content: Array<{ key: string; body: string | null }> }) => api.put(`/site/pages/${pageKey}`, data),
  getServices: () => api.get('/site/services'),
  getServicesAll: () => api.get('/site/services/admin'),
  createService: (data: any) => api.post('/site/services', data),
  updateService: (id: string, data: any) => api.put(`/site/services/${id}`, data),
  deleteService: (id: string) => api.delete(`/site/services/${id}`),
};

export const mediaApi = {
  upload: (formData: FormData) => api.post('/admin/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAll: () => api.get('/admin/media'),
  delete: (id: string) => api.delete(`/admin/media/${id}`),
  health: () => api.get('/admin/media/health').then(r => r.data),
};

export const contactApi = {
  submit: (data: { name: string; email: string; message: string }) =>
    api.post('/contact', data).then(r => r.data),
};

export default api;
