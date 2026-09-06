import axios from "axios";
import { queryClient } from "./queryClient"; // Import queryClient gốc của bạn

const api = axios.create({
  baseURL: '/api',
  // baseURL: "http://localhost:8080/api/v1.0"
});

// Thêm token vào mỗi request
api.interceptors.request.use((config) => {
  const userToken = localStorage.getItem("token");
  if (userToken) {
    config.headers.Authorization = `Bearer ${userToken}`;
  }
  return config;
});

// Bắt lỗi từ server trả về
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Nếu lỗi là 401 (Hết hạn token hoặc không hợp lệ)
    if (error.response && error.response.status === 401) {
      console.log("Token hết hạn, tự động đăng xuất!");

      // 1. Xóa storage
      localStorage.removeItem("token");
      localStorage.removeItem("role");

      // 2. Xóa cache của TanStack Query để ngắt các tiến trình đang dở dang
      queryClient.clear();

      // 3. Chuyển hướng về trang đăng nhập
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
