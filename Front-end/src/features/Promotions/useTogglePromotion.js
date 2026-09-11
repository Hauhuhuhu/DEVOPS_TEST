import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { togglePromotionActive } from "../../services/PromotionService";

export function useTogglePromotion() {
  const queryClient = useQueryClient();

  const { mutate: toggleActive, isPending: isToggling } = useMutation({
    mutationFn: togglePromotionActive,
    onSuccess: async () => {
      toast.success("Đã cập nhật trạng thái khuyến mãi");
      await queryClient.invalidateQueries({ queryKey: ["promotions"] });
      await queryClient.invalidateQueries({ queryKey: ["active-promotions"] });
    },
    onError: () => {
      toast.error("Không thể cập nhật trạng thái khuyến mãi");
    },
  });

  return { isToggling, toggleActive };
}
