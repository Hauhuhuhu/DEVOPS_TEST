import { useState } from "react";
import { useOrders } from "../features/Orders/useOrders";
import Spinner from "../ui/Spinner";
import { formatCurrency } from "../utils/formatCurrency";
import ReceiptPopup from "../features/Explore/ReceiptPopup";

function OrderHistory() {
  const { isLoading, orders } = useOrders();
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState(null);

  if (isLoading) return <Spinner />;

  const formatItems = (items) => {
    return items?.map((item) => `${item.name} x ${item.quantity}`).join(", ") || "";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  if (!orders || orders?.length === 0) {
    return <div className="text-center py-4 text-light">Không có đơn hàng nào.</div>;
  }

  return (
    <div className="orders-history-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0 text-light fw-bold">Danh sách đơn hàng</h2>
        <span className="badge bg-secondary fs-6">{orders.length} đơn hàng</span>
      </div>

      <div className="table-responsive table-scroll">
        <table className="table table-striped table-hover table-fixed">
          <thead className="table-dark">
            <tr>
              <th>Mã ĐH</th>
              <th>Khách hàng</th>
              <th>Sản phẩm</th>
              <th>Khuyến mãi</th>
              <th>Tổng tiền</th>
              <th>Thanh toán</th>
              <th>Trạng thái</th>
              <th>Thời gian</th>
              <th className="text-center">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.orderId}>
                <td className="fw-semibold">#{order.orderId}</td>
                <td>
                  <span className="fw-medium">{order.customerName}</span>
                  <br />
                  <small className="text-muted">{order.phoneNumber}</small>
                </td>
                <td style={{ maxWidth: "250px", whiteSpace: "normal" }}>
                  {formatItems(order.items)}
                </td>
                <td>
                  {order.discountAmount > 0 || order.promotionName ? (
                    <div>
                      <span className="badge bg-danger-subtle text-danger border border-danger-subtle mb-1">
                        {order.promotionName || "Ưu đãi"}
                      </span>
                      {order.discountAmount > 0 && (
                        <div className="small text-danger fw-semibold">
                          -{formatCurrency(order.discountAmount)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted small">-</span>
                  )}
                </td>
                <td className="fw-bold text-warning">
                  {formatCurrency(order.grandTotal)}
                </td>
                <td>
                  <span className="badge bg-dark-subtle text-light border border-secondary">
                    {order.paymentMethod}
                  </span>
                </td>
                <td>
                  <span
                    className={`badge ${
                      order.paymentDetails?.status === "COMPLETED"
                        ? "bg-success"
                        : "bg-danger text-dark"
                    }`}
                  >
                    {order.paymentDetails?.status || "PENDING"}
                  </span>
                </td>
                <td className="small text-muted">{formatDate(order.createdAt)}</td>
                <td className="text-center">
                  <button
                    className="btn btn-outline-info btn-sm"
                    title="Xem & In hóa đơn"
                    onClick={() => setSelectedOrderForReceipt(order)}
                  >
                    🧾 In hóa đơn
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Receipt Modal */}
      {selectedOrderForReceipt && (
        <ReceiptPopup
          order={selectedOrderForReceipt}
          isOpen={Boolean(selectedOrderForReceipt)}
          onClose={() => setSelectedOrderForReceipt(null)}
        />
      )}
    </div>
  );
}

export default OrderHistory;
