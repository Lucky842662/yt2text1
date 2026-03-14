import api from './api.js';

export const videoService = {
  async processVideo(url, generateAiSummary = true) {
    const res = await api.post('/videos/process', { url, generateAiSummary });
    return res.data;
  },

  async getUserVideos({ page = 1, limit = 12, search = '', status } = {}) {
    const params = { page, limit };
    if (search) params.search = search;
    if (status) params.status = status;
    const res = await api.get('/videos', { params });
    return res.data;
  },

  async getVideoById(id) {
    const res = await api.get(`/videos/${id}`);
    return res.data;
  },

  async deleteVideo(id) {
    const res = await api.delete(`/videos/${id}`);
    return res.data;
  },

  async updateVideo(id, data) {
    const res = await api.put(`/videos/${id}`, data);
    return res.data;
  },

  async regenerateSummary(id) {
    const res = await api.post(`/videos/${id}/regenerate-summary`);
    return res.data;
  },
};
