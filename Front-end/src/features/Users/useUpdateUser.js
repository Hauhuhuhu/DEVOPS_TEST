import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { updateUser as updateUserApi } from "../../services/UserService";

export function useUpdateUser() {
  const queryClient = useQueryClient();

  const { mutate: updateUser, isPending: isUpdating } = useMutation({
    mutationFn: ({ userId, userRequest }) => updateUserApi(userId, userRequest),
    onSuccess: () => {
      toast.success("Cập nhật người dùng thành công");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || "Không thể cập nhật người dùng";
      toast.error(msg);
    },
  });

  return { isUpdating, updateUser };
}
