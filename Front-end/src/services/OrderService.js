import api from "../utils/axiosConfig";

export const latestOrders = async () => {
  const response = await api.get("/orders/latest");
  return response.data;
};

export const getOrders = async (page = 0, size = 10, search = "", status = "") => {
  const params = { page, size };
  if (search && search.trim()) params.search = search.trim();
  if (status && status.trim() && status !== "ALL") params.status = status.trim();
  const response = await api.get("/orders", { params });
  return response.data;
};

export const createOrder = async (order) => {
  return await api.post("/orders", order);
};

export const deleteOrder = async (orderId) => {
  return await api.delete(`/orders/${orderId}`);
};

export const getOrderById = async (orderId) => {
  return await api.get(`/orders/${orderId}`);
};

export const cancelOrder = async (orderId) => {
  const response = await api.post(`/orders/${orderId}/cancel`);
  return response.data;
};

export const switchToCash = async (orderId) => {
  const response = await api.post(`/orders/${orderId}/switch-to-cash`);
  return response.data;
};

