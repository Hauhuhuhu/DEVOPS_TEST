import { useQuery } from "@tanstack/react-query";
import { fetchDashboardData } from "../../services/DashboardService";

export function useDashboard() {
  const {
    isPending: isLoading,
    data: dashboardData,
    error,
  } = useQuery({
    queryKey: ["orders", "dashboard"],
    queryFn: fetchDashboardData,
  });

  return { isLoading, error, dashboardData };
}
