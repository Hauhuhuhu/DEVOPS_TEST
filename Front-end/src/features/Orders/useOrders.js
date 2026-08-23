import { useQuery } from "@tanstack/react-query";
import { latestOrders } from "../../services/OrderService";

export function useOrders() {
  const {
    isPending: isLoading,
    data: orders,
    error,
  } = useQuery({
    queryKey: ["orders", "list"],
    queryFn: latestOrders,
  });

  return { isLoading, error, orders };
}
