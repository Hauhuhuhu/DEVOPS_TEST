import api from "../utils/axiosConfig";

export const addCategory = async (category) => {
  return await api.post("/admin/categories", category);
};
export const deleteCategory = async (categoryId) => {
  return await api.delete(`/admin/categories/${categoryId}`);
};

export const updateCategory = async (categoryId, formData) => {
  const response = await api.put(`/admin/categories/${categoryId}`, formData);
  return response.data;
};

export const fetchCategories = async () => {
  const response = await api.get("/categories");
  return response.data;
};
