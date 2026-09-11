import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { addItem } from "../../services/ItemService";

export function useCreateItem() {
  const queryClient = useQueryClient();

  const { mutate: createItem, isPending: isCreating } = useMutation({
    mutationFn: addItem,
    onSuccess: async () => {
      toast.success("Tạo mặt hàng thành công");
      await queryClient.invalidateQueries({ queryKey: ["items"] });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: () => toast.error("Không thể tạo mặt hàng"),
  });

  return { isCreating, createItem };
}
