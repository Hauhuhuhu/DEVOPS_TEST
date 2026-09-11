import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { updateItem as updateItemApi } from "../../services/ItemService";

export function useUpdateItem() {
  const queryClient = useQueryClient();

  const { mutate: updateItem, isPending: isUpdating } = useMutation({
    mutationFn: ({ itemId, itemData }) => updateItemApi(itemId, itemData),
    onSuccess: () => {
      toast.success("Cập nhật mặt hàng thành công");
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || "Không thể cập nhật mặt hàng";
      toast.error(msg);
    },
  });

  return { isUpdating, updateItem };
}
