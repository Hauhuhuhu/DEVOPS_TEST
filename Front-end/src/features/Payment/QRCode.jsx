import { QRCodeSVG } from "qrcode.react";

function QRCode({ currentData }) {
  return (
    <div
      className="mt-4 p-4 border rounded text-center"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      <h5 className="text-primary mb-3">Quét mã QR để thanh toán</h5>

      {currentData.paymentDetails.qrCode ? (
        <div className="d-flex justify-content-center mb-3">
          <div className="p-3 bg-white rounded shadow-sm d-inline-block">
            <QRCodeSVG
              value={currentData.paymentDetails.qrCode}
              size={220}
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

      <div className="order-details mt-3 text-dark">
        <p className="mb-1">
          <strong>Mã đơn hàng:</strong> {currentData.orderId}
        </p>
        <p className="mb-1">
          <strong>Tổng tiền:</strong>{" "}
          <span className="text-danger fw-bold fs-5">
            ${currentData.grandTotal?.toFixed(2)}
          </span>
        </p>
        <p className="text-muted small mt-2 mb-0">
          * Đơn hàng sẽ tự động cập nhật trạng thái sau khi bạn chuyển khoản
          thành công.
        </p>
      </div>

      {currentData.checkoutUrl && (
        <a
          href={currentData.paymentDetails.checkoutUrl}
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
