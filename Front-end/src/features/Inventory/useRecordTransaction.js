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
        `Stock ${data?.transactionType === "IN" ? "received" : "deducted"} successfully! New stock: ${data?.balanceAfter}`
      );
    },
    onError: (err) => {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to record inventory transaction";
      toast.error(message);
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
        `Stock check recorded! New stock: ${data?.balanceAfter} (Adjustment: ${diffSign})`
      );
    },
    onError: (err) => {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to record stock check";
      toast.error(message);
    },
  });

  return { executeStockCheck, isChecking };
};

