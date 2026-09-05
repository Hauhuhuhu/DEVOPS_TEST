import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { deletePromotion } from "../../services/PromotionService";

export function useDeletePromotion() {
  const queryClient = useQueryClient();

  const { mutate: removePromotion, isPending: isDeleting } = useMutation({
    mutationFn: deletePromotion,
    onSuccess: async () => {
      toast.success("Promotion successfully deleted");
      await queryClient.invalidateQueries({ queryKey: ["promotions"] });
      await queryClient.invalidateQueries({ queryKey: ["active-promotions"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || "Failed to delete promotion");
    },
  });

  return { isDeleting, removePromotion };
}
