import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { addUser } from "../../services/UserService";

export function useCreateUser() {
  const queryClient = useQueryClient();

  const { mutate: createUser, isPending: isCreating } = useMutation({
    mutationFn: addUser,
    onSuccess: () => {
      toast.success("Tạo người dùng thành công");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => toast.error("Không thể tạo người dùng"),
  });

  return { isCreating, createUser };
}
