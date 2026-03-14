import { createContext, useContext, useState, useCallback } from 'react';
import { videoService } from '../services/videoService.js';
import toast from 'react-hot-toast';

const VideoContext = createContext(null);

export const VideoProvider = ({ children }) => {
  const [videos, setVideos] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchVideos = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const data = await videoService.getUserVideos(params);
      setVideos(data.videos);
      setPagination(data.pagination);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  }, []);

  const processVideo = useCallback(async (url) => {
    setProcessing(true);
    try {
      const data = await videoService.processVideo(url);
      if (!data.alreadyExists) {
        setVideos((prev) => [data.video, ...prev]);
        toast.success('Video processed successfully!');
      } else {
        toast('Video already in your library', { icon: '📚' });
      }
      return data.video;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to process video';
      toast.error(msg);
      throw err;
    } finally {
      setProcessing(false);
    }
  }, []);

  const deleteVideo = useCallback(async (id) => {
    try {
      await videoService.deleteVideo(id);
      setVideos((prev) => prev.filter((v) => v._id !== id));
      toast.success('Video deleted');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete video');
    }
  }, []);

  const toggleFavorite = useCallback(async (id, currentValue) => {
    try {
      const { video } = await videoService.updateVideo(id, { isFavorite: !currentValue });
      setVideos((prev) => prev.map((v) => (v._id === id ? { ...v, isFavorite: video.isFavorite } : v)));
    } catch (err) {
      toast.error('Failed to update');
    }
  }, []);

  return (
    <VideoContext.Provider
      value={{ videos, pagination, loading, processing, fetchVideos, processVideo, deleteVideo, toggleFavorite }}
    >
      {children}
    </VideoContext.Provider>
  );
};

export const useVideos = () => {
  const ctx = useContext(VideoContext);
  if (!ctx) throw new Error('useVideos must be used within VideoProvider');
  return ctx;
};
