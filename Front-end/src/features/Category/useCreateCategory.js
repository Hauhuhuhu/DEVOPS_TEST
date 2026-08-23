import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { addCategory } from "../../services/CategoryService";

export function useCreateCategory() {
  const queryClient = useQueryClient();

  const { mutate: createCategory, isPending: isCreating } = useMutation({
    mutationFn: addCategory,
    onSuccess: () => {
      toast.success("New category successfully created");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isCreating, createCategory };
}