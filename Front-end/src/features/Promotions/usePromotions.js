import { useQuery } from "@tanstack/react-query";
import { fetchAdminPromotions } from "../../services/PromotionService";

export function usePromotions() {
  const { isPending: isLoading, data: promotions, error } = useQuery({
    queryKey: ["promotions"],
    queryFn: fetchAdminPromotions,
  });

  return { isLoading, error, promotions: promotions || [] };
}
