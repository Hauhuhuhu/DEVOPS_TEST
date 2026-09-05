import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { createModifierGroup as createModifierGroupApi } from "../../services/ModifierService";

export function useCreateModifierGroup() {
  const queryClient = useQueryClient();

  const { mutate: createModifierGroup, isPending: isCreating } = useMutation({
    mutationFn: createModifierGroupApi,
    onSuccess: () => {
      toast.success("Modifier group successfully created");
      queryClient.invalidateQueries({ queryKey: ["modifierGroups"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message;
      toast.error(msg);
    },
  });

  return { isCreating, createModifierGroup };
}
