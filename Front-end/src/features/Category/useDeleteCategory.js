import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { deleteCategory as deleteCategoryApi } from "../../services/CategoryService";

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  const { isPending: isDeleting, mutate: deleteCategory } = useMutation({
    mutationFn: deleteCategoryApi,
    onSuccess: () => {
      toast.success("Xóa danh mục thành công");

      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
    },
    onError: () => toast.error("Không thể xóa danh mục"),
  });

  return { isDeleting, deleteCategory };
}
