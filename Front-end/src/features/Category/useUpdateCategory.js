import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { updateCategory as updateCategoryApi } from "../../services/CategoryService";

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  const { mutate: updateCategory, isPending: isUpdating } = useMutation({
    mutationFn: ({ categoryId, formData }) => updateCategoryApi(categoryId, formData),
    onSuccess: () => {
      toast.success("Cập nhật danh mục thành công");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || "Không thể cập nhật danh mục";
      toast.error(msg);
    },
  });

  return { isUpdating, updateCategory };
}
