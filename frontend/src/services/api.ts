import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const eventsApi = {
  getAll: (page = 1, limit = 12, featured = false) =>
    api.get(`/events?page=${page}&limit=${limit}&featured=${featured}`),
  getBySlug: (slug: string) => api.get(`/events/${slug}`),
};

export const postsApi = {
  getAll: (page = 1, limit = 12) => api.get(`/posts?page=${page}&limit=${limit}`),
  getBySlug: (slug: string) => api.get(`/posts/${slug}`),
  getTags: () => api.get('/posts/tags'),
};

export const badgesApi = {
  getAll: () => api.get('/badges'),
  getBySlug: (slug: string) => api.get(`/badges/${slug}`),
};

export const membersApi = {
  getAll: () => api.get('/members'),
  getById: (id: string) => api.get(`/members/${id}`),
};

export const socialApi = {
  getConfigs: () => api.get('/social/configs'),
};

export default api;
