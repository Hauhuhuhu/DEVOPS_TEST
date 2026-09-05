import api from "../utils/axiosConfig";

export const fetchCustomers = async (query = "") => {
  const url = query ? `/customers?query=${encodeURIComponent(query)}` : "/customers";
  const response = await api.get(url);
  return response.data;
};

export const fetchCustomerByPhone = async (phoneNumber) => {
  const response = await api.get(`/customers/by-phone/${encodeURIComponent(phoneNumber)}`);
  return response.data;
};

export const fetchCustomerById = async (customerId) => {
  const response = await api.get(`/customers/${customerId}`);
  return response.data;
};

export const createCustomer = async (customerData) => {
  const response = await api.post("/customers", customerData);
  return response.data;
};

export const updateCustomer = async ({ customerId, ...data }) => {
  const response = await api.put(`/customers/${customerId}`, data);
  return response.data;
};

export const deleteCustomer = async (customerId) => {
  const response = await api.delete(`/customers/${customerId}`);
  return response.data;
};
