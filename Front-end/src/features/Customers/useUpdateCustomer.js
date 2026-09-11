import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { updateCustomer } from "../../services/CustomerService";

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  const { mutate: editCustomer, isPending: isUpdating } = useMutation({
    mutationFn: updateCustomer,
    onSuccess: async () => {
      toast.success("Cập nhật khách hàng thành công");
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: () => {
      toast.error("Không thể cập nhật khách hàng");
    },
  });

  return { isUpdating, editCustomer };
}
