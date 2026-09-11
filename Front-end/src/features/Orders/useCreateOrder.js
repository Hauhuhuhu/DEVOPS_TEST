import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { createOrder as createOrderApi } from "../../services/OrderService";

export function useCreateOrder() {
  const queryClient = useQueryClient();

  const {
    mutate: createOrder,
    isPending: isCreating,
    data: orderData,
  } = useMutation({
    mutationFn: createOrderApi,
    onSuccess: () => {
      toast.success("Tạo đơn hàng thành công");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => toast.error("Không thể tạo đơn hàng"),
  });

  return { isCreating, createOrder, orderData };
}
