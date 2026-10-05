import { create } from 'zustand';
import api from '@/lib/api';

export const useProjectStore = create((set) => ({
  projects: [],
  currentProject: null,
  pagination: null,
  isLoading: false,
  error: null,

  fetchProjects: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/projects', { params });
      set({
        projects: data.projects || [],
        pagination: data.pagination,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err.response?.data?.message || 'Could not load projects. Is the backend running?',
      });
    }
  },

  fetchProject: async (id) => {
    const { data } = await api.get(`/projects/${id}`);
    set({ currentProject: data.project });
    return data.project;
  },

  clearCurrent: () => set({ currentProject: null }),
}));
