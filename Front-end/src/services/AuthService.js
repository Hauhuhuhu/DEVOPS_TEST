import api from "../utils/axiosConfig";

export const login = async (data) => {
  return await api.post("/login", data);
};
