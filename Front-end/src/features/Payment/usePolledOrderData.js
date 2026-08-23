import { useQuery } from "@tanstack/react-query";
import { getOrderById } from "../../services/OrderService";

export function usePolledOrderData(baseData, orderId) {
  // Trạng thái suy diễn (Không dùng useState)
  const isCompleted = baseData?.paymentDetails?.status === "COMPLETED";

  // 2. Thiết lập useQuery dựa trên trạng thái
  const { data: polledOrderData } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrderById(orderId),
    // Tự động vô hiệu hoá hook nếu chưa có id hoặc trạng thái đã hoàn thành
    enabled: !!orderId && !isCompleted,
    // Tắt vòng lặp API (trả về false) nếu đã COMPLETED, ngược lại 3s gọi 1 lần
    refetchInterval: isCompleted ? false : 3000,
  });
  return { polledOrderData };
}
