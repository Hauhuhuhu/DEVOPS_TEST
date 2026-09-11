import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { updatePromotion } from "../../services/PromotionService";

export function useUpdatePromotion() {
  const queryClient = useQueryClient();

  const { mutate: editPromotion, isPending: isUpdating } = useMutation({
    mutationFn: updatePromotion,
    onSuccess: async () => {
      toast.success("Cập nhật khuyến mãi thành công");
      await queryClient.invalidateQueries({ queryKey: ["promotions"] });
      await queryClient.invalidateQueries({ queryKey: ["active-promotions"] });
    },
    onError: () => {
      toast.error("Không thể cập nhật khuyến mãi");
    },
  });

  return { isUpdating, editPromotion };
}
