import api from "../utils/axiosConfig";

export const getActivityLogs = async ({
  page = 0,
  size = 20,
  userEmail = "",
  action = "",
  startDate = "",
  endDate = "",
} = {}) => {
  const params = { page, size };
  if (userEmail && userEmail.trim() && userEmail !== "ALL") {
    params.userEmail = userEmail.trim();
  }
  if (action && action.trim() && action !== "ALL") {
    params.action = action.trim().toUpperCase();
  }
  if (startDate && startDate.trim()) {
    params.startDate = startDate.trim();
  }
  if (endDate && endDate.trim()) {
    params.endDate = endDate.trim();
  }

  const response = await api.get("/activity-logs", { params });
  return response.data;
};
