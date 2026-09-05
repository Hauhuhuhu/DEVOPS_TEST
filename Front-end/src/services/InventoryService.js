import api from "../utils/axiosConfig";

export const recordStockTransaction = async (data) => {
  const response = await api.post("/admin/inventory/transactions", data);
  return response.data;
};

export const fetchVariantTransactions = async (variantId) => {
  const response = await api.get(`/inventory/variants/${variantId}/transactions`);
  return response.data;
};

export const fetchRecentTransactions = async () => {
  const response = await api.get("/admin/inventory/transactions");
  return response.data;
};

export const performStockCheck = async (data) => {
  const response = await api.post("/admin/inventory/stock-check", data);
  return response.data;
};
