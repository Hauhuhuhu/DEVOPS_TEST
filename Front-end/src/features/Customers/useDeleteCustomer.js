import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { deleteCustomer } from "../../services/CustomerService";

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  const { mutate: removeCustomer, isPending: isDeleting } = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: async () => {
      toast.success("Xóa khách hàng thành công");
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: () => {
      toast.error("Không thể xóa khách hàng");
    },
  });

  return { isDeleting, removeCustomer };
}
