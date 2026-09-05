import api from "../utils/axiosConfig";

export const fetchModifierGroups = async () => {
  const response = await api.get("/modifier-groups");
  return response.data;
};

export const fetchModifierGroup = async (groupId) => {
  const response = await api.get(`/modifier-groups/${groupId}`);
  return response.data;
};

export const createModifierGroup = async (data) => {
  const response = await api.post("/admin/modifier-groups", data);
  return response.data;
};

export const updateModifierGroup = async (groupId, data) => {
  const response = await api.put(`/admin/modifier-groups/${groupId}`, data);
  return response.data;
};

export const deleteModifierGroup = async (groupId) => {
  const response = await api.delete(`/admin/modifier-groups/${groupId}`);
  return response.data;
};
