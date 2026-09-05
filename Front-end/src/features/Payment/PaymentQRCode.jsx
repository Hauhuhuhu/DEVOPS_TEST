import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePolledOrderData } from "./usePolledOrderData";
import CompletedPayment from "./CompletedPayment";
import QRCode from "./QRCode";

function PaymentQRCode({ orderData }) {
  const queryClient = useQueryClient();
  const orderId = orderData?.data?.orderId;

  // 1. Trích xuất dữ liệu từ cache (nếu đã từng gọi api thành công) kết hợp dữ liệu gốc
  const cachedData = queryClient.getQueryData(["order", orderId]);
  const baseData = cachedData?.data || orderData?.data;
  const { polledOrderData } = usePolledOrderData(baseData, orderId);

  // 3. Hợp nhất dữ liệu mới nhất (sau khi gọi API) để render giao diện
  const currentData = polledOrderData?.data || baseData;
  const isFinalCompleted = currentData?.paymentDetails?.status === "COMPLETED";

  // 4. Chỉ dùng useEffect cho Side-effect (Invalidate query bên ngoài), tuyệt đối không setState
  useEffect(() => {
    if (isFinalCompleted) {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    }
  }, [isFinalCompleted, queryClient]);

  // Bảo vệ an toàn
  if (!currentData || currentData.paymentMethod !== "PAYOS") {
    return null;
  }

  if (isFinalCompleted) {
    return <CompletedPayment orderId={currentData.orderId} order={currentData} />;
  }
  return <QRCode currentData={currentData} />;
}

export default PaymentQRCode;
