import axios from 'axios';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Environment-based API URL
const API_BASE_URL = import.meta.env.PROD 
  ? import.meta.env.VITE_API_URL || 'https://your-production-api.com'
  : 'http://localhost:5000';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const requestInterceptors = (config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

const responseInterceptors = (response: AxiosResponse) => response;

axiosInstance.interceptors.request.use(requestInterceptors);

axiosInstance.interceptors.response.use(responseInterceptors, (error) => {
  const { response } = error;
  const expectedError = response && response.status >= 400 && response.status < 500;
  
  // Handle 401 unauthorized errors
  if (response?.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/user/login';
  }
  
  if (!expectedError) {
    return Promise.reject(error.response);
  }
  return Promise.reject(error.response);
});

// GraphQL client for GraphQL requests
export const graphqlClient = axios.create({
  baseURL: `${API_BASE_URL}/graphql`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to GraphQL requests
graphqlClient.interceptors.request.use(requestInterceptors);

// Upload client for file uploads
export const uploadClient = axios.create({
  baseURL: `${API_BASE_URL}/api/upload`,
  timeout: 30000,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Add auth token to upload requests
uploadClient.interceptors.request.use(requestInterceptors);

export default axiosInstance; 