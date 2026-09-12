import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchCustomers } from "../../services/CustomerService";

export function useCustomers(query = "") {
  const { isPending: isLoading, isFetching, data: customers, error } = useQuery({
    queryKey: ["customers", query],
    queryFn: () => fetchCustomers(query),
    placeholderData: keepPreviousData,
    staleTime: 30000,
  });

  return { isLoading, isFetching, error, customers: customers || [] };
}
