import axios from 'axios';

const API = axios.create({
  baseURL: 'https://learning-management-system-backend-uewc.onrender.com/api', // Adjust for deployed backend
});

// Add token to request headers if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
