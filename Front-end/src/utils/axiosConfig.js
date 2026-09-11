import axios from "axios";
import { queryClient } from "./queryClient"; // Import queryClient gốc của bạn
import { clearSession, getAccessToken, setSession } from "./authSession";

const api = axios.create({
  // baseURL: "/api/v1.0",
  baseURL: "http://localhost:8080/api/v1.0",
  withCredentials: true,
});

// Thêm token vào mỗi request
api.interceptors.request.use((config) => {
  const userToken = getAccessToken();
  if (userToken) {
    config.headers.Authorization = `Bearer ${userToken}`;
  }
  return config;
});

let refreshPromise = null;

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = api.post("/auth/refresh", null, { skipAuthRefresh: true })
      .then((response) => response.data)
      .then((authResponse) => {
        const session = setSession(authResponse);
        queryClient.setQueryData(["user"], session);
        return authResponse.token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

function clearAuthentication() {
  clearSession();
  queryClient.clear();
  window.location.href = "/login";
}

// Bắt lỗi từ server và tự xoay access token khi phiên ngắn hạn hết hạn
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const shouldRefresh =
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.skipAuthRefresh;

    if (shouldRefresh) {
      originalRequest._retry = true;
      try {
        const token = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearAuthentication();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
