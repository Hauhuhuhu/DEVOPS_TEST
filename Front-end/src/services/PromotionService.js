import api from "../utils/axiosConfig";

export const fetchAdminPromotions = async () => {
  const response = await api.get("/admin/promotions");
  return response.data;
};

export const fetchActivePromotions = async () => {
  const response = await api.get("/promotions/active");
  return response.data;
};

export const fetchPromotionById = async (promotionId) => {
  const response = await api.get(`/admin/promotions/${promotionId}`);
  return response.data;
};

export const createPromotion = async (data) => {
  const response = await api.post("/admin/promotions", data);
  return response.data;
};

export const updatePromotion = async ({ promotionId, ...data }) => {
  const response = await api.put(`/admin/promotions/${promotionId}`, data);
  return response.data;
};

export const togglePromotionActive = async (promotionId) => {
  const response = await api.patch(`/admin/promotions/${promotionId}/toggle`);
  return response.data;
};

export const deletePromotion = async (promotionId) => {
  const response = await api.delete(`/admin/promotions/${promotionId}`);
  return response.data;
};

export const evaluatePromotion = async (data) => {
  const response = await api.post("/promotions/evaluate", data);
  return response.data;
};

