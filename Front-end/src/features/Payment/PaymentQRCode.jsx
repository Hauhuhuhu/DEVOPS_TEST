import { useState, useEffect } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { usePolledOrderData } from "./usePolledOrderData";
import { cancelOrder, switchToCash } from "../../services/OrderService";
import CompletedPayment from "./CompletedPayment";
import ConfirmDeleteModal from "../../ui/ConfirmDeleteModal";
import toast from "react-hot-toast";
import QRCode from "./QRCode";

function PaymentQRCode({ orderData, onCancelSuccess, onSwitchToCashSuccess }) {
  const queryClient = useQueryClient();
  const orderId = orderData?.data?.orderId;
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);
  const [isConfirmSwitchOpen, setIsConfirmSwitchOpen] = useState(false);

  // 1. Trích xuất dữ liệu từ cache (nếu đã từng gọi api thành công) kết hợp dữ liệu gốc
  const cachedData = queryClient.getQueryData(["order", orderId]);
  const baseData = cachedData?.data || orderData?.data;
  const { polledOrderData } = usePolledOrderData(baseData, orderId);

  // 3. Hợp nhất dữ liệu mới nhất (sau khi gọi API) để render giao diện
  const currentData = polledOrderData?.data || baseData;
  const isFinalCompleted = currentData?.paymentDetails?.status === "COMPLETED";

  // Mutations for in-flight actions
  const cancelMutation = useMutation({
    mutationFn: () => cancelOrder(orderId),
    onSuccess: () => {
      toast.success("Đã hủy đơn hàng thành công");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-transactions"] });
      setIsConfirmCancelOpen(false);
      onCancelSuccess?.();
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message || err.message || "Lỗi khi hủy đơn hàng"
      );
    },
  });

  const switchToCashMutation = useMutation({
    mutationFn: () => switchToCash(orderId),
    onSuccess: (data) => {
      toast.success("Chuyển sang thanh toán tiền mặt thành công");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-transactions"] });
      setIsConfirmSwitchOpen(false);
      onSwitchToCashSuccess?.(data);
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Lỗi khi chuyển sang tiền mặt"
      );
    },
  });

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

  return (
    <>
      <QRCode
        currentData={currentData}
        onCancelOrder={() => setIsConfirmCancelOpen(true)}
        onSwitchToCash={() => setIsConfirmSwitchOpen(true)}
        isCancelling={cancelMutation.isPending}
        isSwitchingToCash={switchToCashMutation.isPending}
      />

      {isConfirmSwitchOpen && (
        <ConfirmDeleteModal
          isOpen={isConfirmSwitchOpen}
          onClose={() => setIsConfirmSwitchOpen(false)}
          onConfirm={() => switchToCashMutation.mutate()}
          isLoading={switchToCashMutation.isPending}
          title="Xác nhận chuyển sang tiền mặt"
          entityName={`Đơn hàng #${orderId}`}
          message="Khách hàng muốn chuyển sang thanh toán tiền mặt? Hệ thống sẽ hoàn tất đơn hàng bằng Tiền mặt, hủy mã QR PayOS và mở hóa đơn để in."
          confirmText="Thu tiền mặt"
          cancelText="Quay lại"
        />
      )}

      {isConfirmCancelOpen && (
        <ConfirmDeleteModal
          isOpen={isConfirmCancelOpen}
          onClose={() => setIsConfirmCancelOpen(false)}
          onConfirm={() => cancelMutation.mutate()}
          isLoading={cancelMutation.isPending}
          title="Xác nhận hủy đơn hàng"
          entityName={`Đơn hàng #${orderId}`}
          message="Bạn có chắc chắn muốn hủy đơn hàng này không? Tồn kho của các sản phẩm sẽ được tự động hoàn lại vào kho."
          confirmText="Hủy đơn hàng"
          cancelText="Quay lại"
        />
      )}
    </>
  );
}

export default PaymentQRCode;
