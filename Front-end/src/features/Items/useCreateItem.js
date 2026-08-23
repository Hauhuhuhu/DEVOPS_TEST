import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { addItem } from "../../services/ItemService";

export function useCreateItem() {
  const queryClient = useQueryClient();

  const { mutate: createItem, isPending: isCreating } = useMutation({
    mutationFn: addItem,
    onSuccess: async () => {
      toast.success("New item successfully created");
      await queryClient.invalidateQueries({ queryKey: ["items"] });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isCreating, createItem };
}
