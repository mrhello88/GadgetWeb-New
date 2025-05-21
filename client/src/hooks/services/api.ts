// If you want automatic refresh token (if token expires and API returns 401), you can also modify the response interceptor to try refreshing the token before rejecting

import axios from 'axios';
// import { getCookie } from 'cookies-next';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

const requestInterceptors = (config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token'); // <-- fix here
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};
//
//const requrestInterceptors = (config: InternalAxiosRequestConfig) => {
//   const token = getCookie('token');
//   if (token && config.headers) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// };
const responseInterceptors = (response: AxiosResponse) => response;

axiosInstance.interceptors.request.use(requestInterceptors);

axiosInstance.interceptors.response.use(responseInterceptors, (error) => {
  const { response } = error;
  const expectedError = response && response.status >= 400 && response.status < 500;
  if (!expectedError) {
    console.log('Logging the error', error);
    return Promise.reject(error.response);
  }
  return Promise.reject(error.response);
});
