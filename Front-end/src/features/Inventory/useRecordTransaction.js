import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  recordStockTransaction,
  performStockCheck,
} from "../../services/InventoryService";
import toast from "react-hot-toast";

export const useRecordTransaction = () => {
  const queryClient = useQueryClient();

  const { mutate: recordTransaction, isPending: isRecording } = useMutation({
    mutationFn: recordStockTransaction,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({
        queryKey: ["inventory-transactions", data?.variantId],
      });
      queryClient.invalidateQueries({
        queryKey: ["inventory-transactions"],
      });
      toast.success(
        `${data?.transactionType === "IN" ? "Nhập kho" : "Xuất kho"} thành công. Tồn kho mới: ${data?.balanceAfter}`
      );
    },
    onError: () => {
      toast.error("Không thể ghi nhận giao dịch tồn kho");
    },
  });

  return { recordTransaction, isRecording };
};

export const useStockCheck = () => {
  const queryClient = useQueryClient();

  const { mutate: executeStockCheck, isPending: isChecking } = useMutation({
    mutationFn: performStockCheck,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({
        queryKey: ["inventory-transactions", data?.variantId],
      });
      queryClient.invalidateQueries({
        queryKey: ["inventory-transactions"],
      });
      const diffSign = data?.quantity > 0 ? `+${data?.quantity}` : data?.quantity;
      toast.success(
        `Đã ghi nhận kiểm kê. Tồn kho mới: ${data?.balanceAfter} (điều chỉnh: ${diffSign})`
      );
    },
    onError: () => {
      toast.error("Không thể ghi nhận kết quả kiểm kê");
    },
  });

  return { executeStockCheck, isChecking };
};
