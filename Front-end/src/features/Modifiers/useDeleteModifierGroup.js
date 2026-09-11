import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { deleteModifierGroup as deleteModifierGroupApi } from "../../services/ModifierService";

export function useDeleteModifierGroup() {
  const queryClient = useQueryClient();

  const { mutate: deleteModifierGroup, isPending: isDeleting } = useMutation({
    mutationFn: deleteModifierGroupApi,
    onSuccess: () => {
      toast.success("Xóa nhóm tùy chọn thành công");
      queryClient.invalidateQueries({ queryKey: ["modifierGroups"] });
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
    onError: () => {
      toast.error("Không thể xóa nhóm tùy chọn");
    },
  });

  return { isDeleting, deleteModifierGroup };
}
