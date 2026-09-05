import { useQuery } from "@tanstack/react-query";
import { fetchVariantTransactions } from "../../services/InventoryService";

export const useVariantTransactions = (variantId) => {
  const {
    data: transactions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["inventory-transactions", variantId],
    queryFn: () => fetchVariantTransactions(variantId),
    enabled: Boolean(variantId),
  });

  return { transactions, isLoading, error };
};
