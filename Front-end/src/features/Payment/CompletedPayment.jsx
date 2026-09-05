import { useState } from "react";
import { formatCurrency } from "../../utils/formatCurrency";
import ReceiptPopup from "../Explore/ReceiptPopup";

function CompletedPayment({ orderId, order }) {
  const [showReceipt, setShowReceipt] = useState(false);
  const currentOrder = order || { orderId };

  return (
    <>
      <div
        className="mt-4 p-4 border rounded text-center shadow-sm"
        style={{ backgroundColor: "#d4edda", borderColor: "#c3e6cb" }}
      >
        <h5 className="text-success fw-bold mb-3">🎉 Thanh toán thành công!</h5>
        <div className="mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="56"
            height="56"
            fill="#28a745"
            className="bi bi-check-circle-fill"
            viewBox="0 0 16 16"
          >
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
          </svg>
        </div>
        <div className="order-details text-dark">
          <p className="mb-1">
            <strong>Mã đơn hàng:</strong> #{orderId || currentOrder.orderId}
          </p>
          {currentOrder.grandTotal !== undefined && (
            <p className="mb-1">
              <strong>Tổng thanh toán:</strong>{" "}
              <span className="text-success fw-bold">
                {formatCurrency(currentOrder.grandTotal)}
              </span>
            </p>
          )}
          {currentOrder.discountAmount > 0 && (
            <div className="badge bg-success text-white py-1 px-2 mb-2">
              🏷️ Tiết kiệm: {formatCurrency(currentOrder.discountAmount)} (
              {currentOrder.promotionName || "Khuyến mãi"})
            </div>
          )}
          <p className="mb-2 text-muted small">Cảm ơn bạn! Đơn hàng đã hoàn tất.</p>
        </div>

        {currentOrder && (
          <button
            type="button"
            className="btn btn-outline-success btn-sm mt-2"
            onClick={() => setShowReceipt(true)}
          >
            🖨️ Xem & In hóa đơn
          </button>
        )}
      </div>

      {showReceipt && (
        <ReceiptPopup
          order={currentOrder}
          isOpen={showReceipt}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </>
  );
}
export default CompletedPayment;
