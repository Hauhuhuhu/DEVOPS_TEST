import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { updatePromotion } from "../../services/PromotionService";

export function useUpdatePromotion() {
  const queryClient = useQueryClient();

  const { mutate: editPromotion, isPending: isUpdating } = useMutation({
    mutationFn: updatePromotion,
    onSuccess: async () => {
      toast.success("Promotion successfully updated");
      await queryClient.invalidateQueries({ queryKey: ["promotions"] });
      await queryClient.invalidateQueries({ queryKey: ["active-promotions"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || "Failed to update promotion");
    },
  });

  return { isUpdating, editPromotion };
}
