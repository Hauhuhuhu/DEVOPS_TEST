import api from "../utils/axiosConfig";

export const addCategory = async (category) => {
  return await api.post("/admin/categories", category);
};
export const deleteCategory = async (categoryId) => {
  return await api.delete(`/admin/categories/${categoryId}`);
};

export const fetchCategories = async () => {
  const response = await api.get("/categories");
  return response.data;
};
