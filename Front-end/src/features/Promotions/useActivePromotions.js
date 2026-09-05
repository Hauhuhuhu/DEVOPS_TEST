import { useQuery } from "@tanstack/react-query";
import { fetchActivePromotions } from "../../services/PromotionService";

export function useActivePromotions() {
  const { isPending: isLoading, data: activePromotions, error } = useQuery({
    queryKey: ["active-promotions"],
    queryFn: fetchActivePromotions,
  });

  return { isLoading, error, activePromotions: activePromotions || [] };
}
