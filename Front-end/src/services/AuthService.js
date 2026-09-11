import api from "../utils/axiosConfig";

export const login = async (data) => {
  return await api.post("/login", data);
};

export const refreshSession = async () => {
  const response = await api.post("/auth/refresh", null, { skipAuthRefresh: true });
  return response.data;
};

export const logout = async () => {
  return await api.post("/auth/logout", null, { skipAuthRefresh: true });
};
