import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { updateModifierGroup as updateModifierGroupApi } from "../../services/ModifierService";

export function useUpdateModifierGroup() {
  const queryClient = useQueryClient();

  const { mutate: updateModifierGroup, isPending: isUpdating } = useMutation({
    mutationFn: ({ groupId, data }) => updateModifierGroupApi(groupId, data),
    onSuccess: () => {
      toast.success("Cập nhật nhóm tùy chọn thành công");
      queryClient.invalidateQueries({ queryKey: ["modifierGroups"] });
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
    onError: () => {
      toast.error("Không thể cập nhật nhóm tùy chọn");
    },
  });

  return { isUpdating, updateModifierGroup };
}
