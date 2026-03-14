import api from './api.js';

export const authService = {
  async register(name, email, password) {
    const res = await api.post('/auth/register', { name, email, password });
    return res.data;
  },

  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {}
  },

  async getProfile() {
    const res = await api.get('/auth/profile');
    return res.data;
  },

  async updateProfile(data) {
    const res = await api.put('/auth/profile', data);
    return res.data;
  },

  async refreshToken(token) {
    const res = await api.post('/auth/refresh', { refreshToken: token });
    return res.data;
  },
};
