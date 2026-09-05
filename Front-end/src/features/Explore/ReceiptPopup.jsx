import { formatCurrency } from "../../utils/formatCurrency";

function ReceiptPopup({ order, isOpen, onClose }) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return new Date().toLocaleString("vi-VN");
    return new Date(dateStr).toLocaleString("vi-VN");
  };

  const subtotal = order.subtotal ?? order.grandTotal ?? 0;
  const discountAmount = order.discountAmount ?? 0;
  const tax = order.tax ?? 0;
  const grandTotal = order.grandTotal ?? 0;

  return (
    <div
      className="modal show d-block receipt-modal-overlay"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.65)", zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "420px" }}>
        <div className="modal-content shadow-lg border-0 text-dark bg-white rounded-3 overflow-hidden">
          {/* Header (Hidden in Print) */}
          <div className="modal-header border-0 pb-0 justify-content-between no-print bg-light">
            <h6 className="modal-title fw-bold text-secondary">Hóa đơn thanh toán</h6>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          {/* Printable Receipt Container */}
          <div className="modal-body p-4 receipt-printable-area">
            {/* Store Header */}
            <div className="text-center mb-3">
              <h5 className="fw-bold mb-0 text-uppercase tracking-wide">
                Billing App POS
              </h5>
              <div className="text-muted small">Hệ thống bán hàng thông minh</div>
              <div className="text-muted small">Hotline: 1900 8888</div>
              <div className="mt-1">
                <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                  {order.paymentDetails?.status === "COMPLETED" ? "ĐÃ THANH TOÁN" : "CHỜ XỬ LÝ"}
                </span>
              </div>
            </div>

            {/* Receipt Metadata */}
            <div className="border-top border-bottom border-dashed py-2 my-2 small">
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Mã hóa đơn:</span>
                <span className="fw-semibold">#{order.orderId}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Thời gian:</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Khách hàng:</span>
                <span className="fw-semibold">{order.customerName || "Khách vãng lai"}</span>
              </div>
              {order.phoneNumber && order.phoneNumber !== "0000000000" && (
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Số điện thoại:</span>
                  <span>{order.phoneNumber}</span>
                </div>
              )}
              <div className="d-flex justify-content-between">
                <span className="text-muted">Phương thức:</span>
                <span className="fw-medium">
                  {order.paymentMethod === "PAYOS" ? "Chuyển khoản (PayOS)" : "Tiền mặt"}
                </span>
              </div>
            </div>

            {/* Products Table */}
            <div className="my-2">
              <table className="table table-sm table-borderless small mb-0">
                <thead>
                  <tr className="border-bottom text-muted">
                    <th className="ps-0">Tên món</th>
                    <th className="text-center">SL</th>
                    <th className="text-end">Đ.Giá</th>
                    <th className="text-end pe-0">T.Tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item, index) => {
                    const itemUnitPrice = item.price ?? item.basePrice ?? 0;
                    const itemTotal = itemUnitPrice * (item.quantity || 1);
                    return (
                      <tr key={index} className="align-top border-bottom-subtle">
                        <td className="ps-0 py-1">
                          <div className="fw-semibold text-dark">{item.name}</div>
                          {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                            <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                              {item.selectedModifiers.map((m, mi) => (
                                <span key={mi} className="me-1">
                                  +{m.name} ({formatCurrency(m.price)})
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="text-center py-1">{item.quantity}</td>
                        <td className="text-end py-1 text-muted">
                          {formatCurrency(itemUnitPrice)}
                        </td>
                        <td className="text-end pe-0 py-1 fw-semibold">
                          {formatCurrency(itemTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totals & Promotion Savings Itemization */}
            <div className="border-top border-dashed pt-2 mt-2 small">
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Tạm tính (Subtotal):</span>
                <span className="fw-medium">{formatCurrency(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="d-flex justify-content-between mb-1 text-danger fw-semibold">
                  <span>
                    Giảm giá {order.promotionName ? `(${order.promotionName})` : ""}:
                  </span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Thuế VAT (10%):</span>
                <span>{formatCurrency(tax)}</span>
              </div>

              <div className="border-top border-dark border-2 pt-2 mt-2 d-flex justify-content-between align-items-center">
                <span className="fw-bold fs-6">TỔNG THANH TOÁN:</span>
                <span className="fw-bold fs-5 text-primary">
                  {formatCurrency(grandTotal)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="mt-2 p-2 rounded bg-success-subtle text-success text-center small fw-bold">
                  🎉 Quý khách đã tiết kiệm được {formatCurrency(discountAmount)}!
                </div>
              )}
            </div>

            {/* Receipt Footer */}
            <div className="text-center text-muted small mt-4 pt-3 border-top border-dashed">
              <p className="mb-1 fw-medium">Cảm ơn Quý Khách - Hẹn Gặp Lại!</p>
              <p className="mb-0 text-secondary" style={{ fontSize: "0.72rem" }}>
                Vui lòng kiểm tra lại hóa đơn trước khi rời khỏi quầy.
              </p>
            </div>
          </div>

          {/* Action Buttons (Hidden in Print) */}
          <div className="modal-footer border-0 pt-0 no-print d-flex gap-2 bg-light p-3">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm flex-grow-1"
              onClick={onClose}
            >
              Đóng
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm flex-grow-1"
              onClick={handlePrint}
            >
              🖨️ In hóa đơn
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .border-dashed {
          border-top: 1px dashed #ced4da !important;
          border-bottom: 1px dashed #ced4da !important;
        }
        @media print {
          body * {
            visibility: hidden !important;
          }
          .receipt-modal-overlay,
          .receipt-modal-overlay * {
            visibility: visible !important;
          }
          .receipt-modal-overlay {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .receipt-modal-overlay .modal-dialog {
            max-width: 380px !important;
            margin: 0 auto !important;
          }
          .receipt-modal-overlay .modal-content {
            border: none !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default ReceiptPopup;

