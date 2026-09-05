import api from "../utils/axiosConfig";

export const addItem = async (item) => {
  return await api.post("/admin/items", item);
};
export const deleteItem = async (itemId) => {
  return await api.delete(`/admin/items/${itemId}`);
};

export const fetchItems = async () => {
  const response = await api.get("/items");
  return response.data;
};

export const attachModifierGroups = async (itemId, groupIds) => {
  const response = await api.post(`/admin/items/${itemId}/modifier-groups`, groupIds);
  return response.data;
};

export const fetchItemModifierGroups = async (itemId) => {
  const response = await api.get(`/items/${itemId}/modifier-groups`);
  return response.data;
};

