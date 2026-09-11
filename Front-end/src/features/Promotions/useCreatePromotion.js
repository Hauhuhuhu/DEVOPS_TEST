import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { createPromotion } from "../../services/PromotionService";

export function useCreatePromotion() {
  const queryClient = useQueryClient();

  const { mutate: addPromotion, isPending: isCreating } = useMutation({
    mutationFn: createPromotion,
    onSuccess: async () => {
      toast.success("Tạo khuyến mãi thành công");
      await queryClient.invalidateQueries({ queryKey: ["promotions"] });
      await queryClient.invalidateQueries({ queryKey: ["active-promotions"] });
    },
    onError: () => {
      toast.error("Không thể tạo khuyến mãi");
    },
  });

  return { isCreating, addPromotion };
}
