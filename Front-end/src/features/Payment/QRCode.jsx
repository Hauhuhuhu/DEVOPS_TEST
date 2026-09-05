import { QRCodeSVG } from "qrcode.react";
import { formatCurrency } from "../../utils/formatCurrency";

function QRCode({ currentData }) {
  const subtotal = currentData.subtotal;
  const discountAmount = currentData.discountAmount || 0;
  const tax = currentData.tax;
  const grandTotal = currentData.grandTotal || 0;
  const checkoutUrl =
    currentData.paymentDetails?.checkoutUrl || currentData.checkoutUrl;

  return (
    <div
      className="mt-3 p-4 border rounded text-center shadow-sm"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      <h5 className="text-primary fw-bold mb-3">Quét mã QR để thanh toán (PayOS)</h5>

      {currentData.paymentDetails?.qrCode ? (
        <div className="d-flex justify-content-center mb-3">
          <div className="p-3 bg-white rounded shadow-sm d-inline-block border">
            <QRCodeSVG
              value={currentData.paymentDetails.qrCode}
              size={210}
              bgColor={"#ffffff"}
              fgColor={"#000000"}
              level={"H"}
              includeMargin={false}
            />
          </div>
        </div>
      ) : (
        <div className="spinner-border text-primary my-4" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      )}

      <div className="order-details text-dark text-start bg-white p-3 rounded border mx-auto" style={{ maxWidth: "340px" }}>
        <div className="d-flex justify-content-between mb-1 small">
          <span className="text-muted">Mã đơn hàng:</span>
          <span className="fw-semibold">#{currentData.orderId}</span>
        </div>

        {subtotal !== undefined && subtotal !== null && (
          <div className="d-flex justify-content-between mb-1 small">
            <span className="text-muted">Tạm tính:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
        )}

        {discountAmount > 0 && (
          <div className="d-flex justify-content-between mb-1 small text-danger fw-semibold">
            <span>
              🏷️ Giảm giá {currentData.promotionName ? `(${currentData.promotionName})` : ""}:
            </span>
            <span>-{formatCurrency(discountAmount)}</span>
          </div>
        )}

        {tax !== undefined && tax !== null && (
          <div className="d-flex justify-content-between mb-1 small">
            <span className="text-muted">Thuế VAT (10%):</span>
            <span>{formatCurrency(tax)}</span>
          </div>
        )}

        <div className="border-top pt-2 mt-2 d-flex justify-content-between align-items-center">
          <span className="fw-bold">Tổng thanh toán:</span>
          <span className="text-danger fw-bold fs-5">
            {formatCurrency(grandTotal)}
          </span>
        </div>

        {discountAmount > 0 && (
          <div className="mt-2 py-1 px-2 rounded bg-success-subtle text-success text-center small fw-semibold">
            Đã áp dụng ưu đãi: Tiết kiệm {formatCurrency(discountAmount)}
          </div>
        )}

        <p className="text-muted small mt-2 mb-0 text-center" style={{ fontSize: "0.75rem" }}>
          * Đơn hàng sẽ tự động cập nhật trạng thái ngay sau khi bạn chuyển khoản thành công.
        </p>
      </div>

      {checkoutUrl && (
        <a
          href={checkoutUrl}
          target="_blank"
          rel="noreferrer"
          className="btn btn-outline-primary btn-sm mt-3"
        >
          Hoặc mở trang thanh toán PayOS
        </a>
      )}
    </div>
  );
}
export default QRCode;
