import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { togglePromotionActive } from "../../services/PromotionService";

export function useTogglePromotion() {
  const queryClient = useQueryClient();

  const { mutate: toggleActive, isPending: isToggling } = useMutation({
    mutationFn: togglePromotionActive,
    onSuccess: async () => {
      toast.success("Promotion status toggled");
      await queryClient.invalidateQueries({ queryKey: ["promotions"] });
      await queryClient.invalidateQueries({ queryKey: ["active-promotions"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || "Failed to toggle status");
    },
  });

  return { isToggling, toggleActive };
}
