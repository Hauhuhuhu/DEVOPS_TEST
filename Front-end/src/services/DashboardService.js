import api from "../utils/axiosConfig";

export const fetchDashboardData = async () => {
  const response = await api.get("/dashboard");
  return response.data;
};
