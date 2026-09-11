import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { createModifierGroup as createModifierGroupApi } from "../../services/ModifierService";

export function useCreateModifierGroup() {
  const queryClient = useQueryClient();

  const { mutate: createModifierGroup, isPending: isCreating } = useMutation({
    mutationFn: createModifierGroupApi,
    onSuccess: () => {
      toast.success("Tạo nhóm tùy chọn thành công");
      queryClient.invalidateQueries({ queryKey: ["modifierGroups"] });
    },
    onError: () => {
      toast.error("Không thể tạo nhóm tùy chọn");
    },
  });

  return { isCreating, createModifierGroup };
}
