import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { deleteModifierGroup as deleteModifierGroupApi } from "../../services/ModifierService";

export function useDeleteModifierGroup() {
  const queryClient = useQueryClient();

  const { mutate: deleteModifierGroup, isPending: isDeleting } = useMutation({
    mutationFn: deleteModifierGroupApi,
    onSuccess: () => {
      toast.success("Modifier group successfully deleted");
      queryClient.invalidateQueries({ queryKey: ["modifierGroups"] });
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message;
      toast.error(msg);
    },
  });

  return { isDeleting, deleteModifierGroup };
}
