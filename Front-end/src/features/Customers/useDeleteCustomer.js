import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { deleteCustomer } from "../../services/CustomerService";

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  const { mutate: removeCustomer, isPending: isDeleting } = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: async () => {
      toast.success("Customer successfully deleted");
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || "Failed to delete customer");
    },
  });

  return { isDeleting, removeCustomer };
}
