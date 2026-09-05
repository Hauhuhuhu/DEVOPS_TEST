import { useQuery } from "@tanstack/react-query";
import { fetchCustomers } from "../../services/CustomerService";

export function useCustomers(query = "") {
  const { isPending: isLoading, data: customers, error } = useQuery({
    queryKey: ["customers", query],
    queryFn: () => fetchCustomers(query),
  });

  return { isLoading, error, customers: customers || [] };
}
