import { useQuery } from "@tanstack/react-query";
import { getOrders } from "../../services/OrderService";

export function useOrders({ page = 0, size = 10, search = "", status = "" } = {}) {
  const {
    isPending: isLoading,
    isFetching,
    isPlaceholderData,
    data,
    error,
    refetch,
  } = useQuery({
    queryKey: ["orders", page, size, search, status],
    queryFn: () => getOrders(page, size, search, status),
  });

  const orders = data?.content || [];
  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 0;
  const currentPage = data?.currentPage ?? page;
  const pageSize = data?.pageSize ?? size;

  return {
    isLoading,
    isFetching,
    isPlaceholderData,
    error,
    orders,
    data,
    totalElements,
    totalPages,
    currentPage,
    pageSize,
    refetch,
  };
}
