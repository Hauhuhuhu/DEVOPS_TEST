import api from "../utils/axiosConfig";

export const addUser = async (user) => {
  return await api.post("/admin/register", user);
};
export const deleteUser = async (userId) => {
  return await api.delete(`/admin/users/${userId}`);
};

export const fetchUsers = async () => {
  const response = await api.get("/admin/users");
  return response.data;
};

export const updateUser = async (userId, userRequest) => {
  const response = await api.put(`/admin/users/${userId}`, userRequest);
  return response.data;
};
