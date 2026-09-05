import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { updateModifierGroup as updateModifierGroupApi } from "../../services/ModifierService";

export function useUpdateModifierGroup() {
  const queryClient = useQueryClient();

  const { mutate: updateModifierGroup, isPending: isUpdating } = useMutation({
    mutationFn: ({ groupId, data }) => updateModifierGroupApi(groupId, data),
    onSuccess: () => {
      toast.success("Modifier group successfully updated");
      queryClient.invalidateQueries({ queryKey: ["modifierGroups"] });
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message;
      toast.error(msg);
    },
  });

  return { isUpdating, updateModifierGroup };
}
