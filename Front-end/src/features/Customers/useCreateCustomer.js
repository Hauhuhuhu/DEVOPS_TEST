import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { createCustomer } from "../../services/CustomerService";

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  const { mutate: addCustomer, isPending: isCreating } = useMutation({
    mutationFn: createCustomer,
    onSuccess: async () => {
      toast.success("Tạo khách hàng thành công");
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: () => {
      toast.error("Không thể tạo khách hàng");
    },
  });

  return { isCreating, addCustomer };
}
