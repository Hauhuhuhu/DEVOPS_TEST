import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { updateCustomer } from "../../services/CustomerService";

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  const { mutate: editCustomer, isPending: isUpdating } = useMutation({
    mutationFn: updateCustomer,
    onSuccess: async () => {
      toast.success("Customer successfully updated");
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || "Failed to update customer");
    },
  });

  return { isUpdating, editCustomer };
}
