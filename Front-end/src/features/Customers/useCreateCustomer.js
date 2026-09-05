import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { createCustomer } from "../../services/CustomerService";

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  const { mutate: addCustomer, isPending: isCreating } = useMutation({
    mutationFn: createCustomer,
    onSuccess: async () => {
      toast.success("Customer successfully created");
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || "Failed to create customer");
    },
  });

  return { isCreating, addCustomer };
}
