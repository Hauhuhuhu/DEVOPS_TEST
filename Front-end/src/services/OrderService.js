import api from "../utils/axiosConfig";

export const latestOrders = async () => {
  const response = await api.get("/orders/latest");
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
