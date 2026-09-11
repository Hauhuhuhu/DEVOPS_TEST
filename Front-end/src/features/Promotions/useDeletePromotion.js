import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { deletePromotion } from "../../services/PromotionService";

export function useDeletePromotion() {
  const queryClient = useQueryClient();

  const { mutate: removePromotion, isPending: isDeleting } = useMutation({
    mutationFn: deletePromotion,
    onSuccess: async () => {
      toast.success("Xóa khuyến mãi thành công");
      await queryClient.invalidateQueries({ queryKey: ["promotions"] });
      await queryClient.invalidateQueries({ queryKey: ["active-promotions"] });
    },
    onError: () => {
      toast.error("Không thể xóa khuyến mãi");
    },
  });

  return { isDeleting, removePromotion };
}
