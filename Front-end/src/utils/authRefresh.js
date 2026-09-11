import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1.0";

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export async function requestRefreshSession() {
  const response = await refreshClient.post("/auth/refresh", null);
  return response.data;
}
