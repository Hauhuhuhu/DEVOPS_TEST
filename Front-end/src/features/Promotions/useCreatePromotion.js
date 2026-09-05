import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { createPromotion } from "../../services/PromotionService";

export function useCreatePromotion() {
  const queryClient = useQueryClient();

  const { mutate: addPromotion, isPending: isCreating } = useMutation({
    mutationFn: createPromotion,
    onSuccess: async () => {
      toast.success("Promotion successfully created");
      await queryClient.invalidateQueries({ queryKey: ["promotions"] });
      await queryClient.invalidateQueries({ queryKey: ["active-promotions"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || "Failed to create promotion");
    },
  });

  return { isCreating, addPromotion };
}
