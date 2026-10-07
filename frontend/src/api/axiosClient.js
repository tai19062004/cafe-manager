import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => {
    // Trả về trực tiếp data từ backend ({ success: true, data: ... })
    return response.data;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Không thể kết nối đến máy chủ backend.';
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;

