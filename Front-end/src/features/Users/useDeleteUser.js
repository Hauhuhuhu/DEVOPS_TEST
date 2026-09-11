import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { deleteUser as deleteCategoryApi } from "../../services/UserService";

export function useDeleteUser() {
  const queryClient = useQueryClient();

  const { isPending: isDeleting, mutate: deleteUser } = useMutation({
    mutationFn: deleteCategoryApi,
    onSuccess: () => {
      toast.success("Xóa người dùng thành công");

      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
    onError: () => toast.error("Không thể xóa người dùng"),
  });

  return { isDeleting, deleteUser };
}
