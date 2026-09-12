import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getActivityLogs } from "../../services/ActivityLogService";

export function useActivityLogs({
  page = 0,
  size = 20,
  userEmail = "",
  action = "",
  startDate = "",
  endDate = "",
} = {}) {
  const {
    isLoading,
    isFetching,
    data,
    error,
    refetch,
  } = useQuery({
    queryKey: ["activityLogs", page, size, userEmail, action, startDate, endDate],
    queryFn: () => getActivityLogs({ page, size, userEmail, action, startDate, endDate }),
    placeholderData: keepPreviousData,
  });

  const logs = data?.content || [];
  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 0;
  const currentPage = data?.currentPage ?? page;
  const pageSize = data?.pageSize ?? size;

  return {
    isLoading,
    isFetching,
    logs,
    data,
    totalElements,
    totalPages,
    currentPage,
    pageSize,
    error,
    refetch,
  };
}
