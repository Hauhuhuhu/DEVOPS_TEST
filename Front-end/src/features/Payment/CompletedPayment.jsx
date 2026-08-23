function CompletedPayment({ orderId }) {
  return (
    <div
      className="mt-4 p-4 border rounded text-center"
      style={{ backgroundColor: "#d4edda", borderColor: "#c3e6cb" }}
    >
      <h5 className="text-success mb-3">🎉 Thanh toán thành công!</h5>
      <div className="mb-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          fill="#28a745"
          className="bi bi-check-circle-fill"
          viewBox="0 0 16 16"
        >
          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
        </svg>
      </div>
      <div className="order-details mt-3 text-dark">
        <p className="mb-1">
          <strong>Mã đơn hàng:</strong> {orderId}
        </p>
        <p className="mb-0">Cảm ơn bạn! Đơn hàng của bạn đang được xử lý.</p>
      </div>
    </div>
  );
}
export default CompletedPayment;
