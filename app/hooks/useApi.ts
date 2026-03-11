import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { backendUrl } from '../constants/constants';

export const useApi = () => {
  const { token } = useAuth();

  const api = axios.create({
    baseURL: backendUrl,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // Interceptor to always update token if it changes
  api.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return api;
};
