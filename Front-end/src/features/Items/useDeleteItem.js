import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { deleteItem as deleteItemApi } from "../../services/ItemService";

export function useDeleteItem() {
  const queryClient = useQueryClient();

  const { isPending: isDeleting, mutate: deleteItem } = useMutation({
    mutationFn: deleteItemApi,
    onSuccess: async () => {
      toast.success("Item successfully deleted");
      await queryClient.invalidateQueries({ queryKey: ["items"] });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isDeleting, deleteItem };
}
