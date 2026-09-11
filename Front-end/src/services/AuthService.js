import api from "../utils/axiosConfig";
import { requestRefreshSession } from "../utils/authRefresh";

export const login = async (data) => {
  return await api.post("/login", data, { skipAuthRefresh: true });
};

export const refreshSession = requestRefreshSession;

export const logout = async () => {
  return await api.post("/auth/logout", null, { skipAuthRefresh: true });
};
