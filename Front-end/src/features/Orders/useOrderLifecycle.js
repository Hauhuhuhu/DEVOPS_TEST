import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  cancelOrder as cancelOrderApi,
  switchToCash as switchToCashApi,
} from "../../services/OrderService";

export function useOrderLifecycle({ onCancelSuccess, onSwitchToCashSuccess } = {}) {
  const queryClient = useQueryClient();

  const invalidateOrderRelatedQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["orders"] });
    queryClient.invalidateQueries({ queryKey: ["items"] });
    queryClient.invalidateQueries({ queryKey: ["inventory-transactions"] });
    queryClient.invalidateQueries({ queryKey: ["customers"] });
    queryClient.invalidateQueries({ queryKey: ["promotions"] });
  };

  const cancelMutation = useMutation({
    mutationFn: (orderId) => cancelOrderApi(orderId),
    onSuccess: (data, orderId) => {
      toast.success("Đã hủy đơn hàng thành công");
      invalidateOrderRelatedQueries();
      onCancelSuccess?.(data, orderId);
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message || err.message || "Lỗi khi hủy đơn hàng"
      );
    },
  });

  const switchToCashMutation = useMutation({
    mutationFn: (orderId) => switchToCashApi(orderId),
    onSuccess: (data, orderId) => {
      toast.success("Chuyển sang thanh toán tiền mặt thành công");
      invalidateOrderRelatedQueries();
      onSwitchToCashSuccess?.(data, orderId);
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Lỗi khi chuyển sang tiền mặt"
      );
    },
  });

  return {
    cancelOrder: cancelMutation.mutate,
    isCancelling: cancelMutation.isPending,
    switchToCash: switchToCashMutation.mutate,
    isSwitchingToCash: switchToCashMutation.isPending,
    cancelMutation,
    switchToCashMutation,
  };
}