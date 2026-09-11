import axios from "axios";
import { queryClient } from "./queryClient"; // Import queryClient gốc của bạn
import { clearSession, getAccessToken, setSession } from "./authSession";
import { API_BASE_URL, requestRefreshSession } from "./authRefresh";
import { shouldRefreshRequest } from "./authRetryPolicy";

const api = axios.create({
  baseURL: API_BASE_URL,
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
    refreshPromise = requestRefreshSession()
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
    const shouldRefresh = shouldRefreshRequest(error);

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
