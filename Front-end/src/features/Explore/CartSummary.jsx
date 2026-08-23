import { useState } from "react";
import { useCreateOrder } from "../Orders/useCreateOrder";
import PaymentQRCode from "../Payment/PaymentQRCode"; //
import toast from "react-hot-toast";
import { formatCurrency } from "../../utils/formatCurrency";

function CartSummary({
  customerName,
  setCustomerName,
  mobileNumber,
  setMobileNumber,
  cartItems,
  clearCart,
}) {
  const { isCreating, createOrder, orderData } = useCreateOrder();

  // 1. Khai báo state để quản lý việc hiển thị Modal
  const [showModal, setShowModal] = useState(false);

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const tax = totalAmount * 0.1;
  const grandTotal = totalAmount + tax;

  function onCreateOrder(paymentMode) {
    const dataForm = {
      customerName: customerName.trim() || "Người dùng mặc định",
      phoneNumber: mobileNumber.trim() || "0000000000",
      cartItems,
      subtotal: totalAmount,
      tax,
      grandTotal,
      paymentMethod: paymentMode.toUpperCase(),
    };

    createOrder(dataForm, {
      onSuccess: (dt) => {
        // 2. Nếu người dùng chọn PAYOS và tạo đơn thành công, mở Modal
        if (paymentMode === "PAYOS") {
          setShowModal(true);
        } else if (
          paymentMode === "CASH" &&
          dt.data.paymentDetails?.status === "COMPLETED"
        ) {
          toast.success("Thanh toán thành công");
        }
      },
    });
  }

  function handleClearCart() {
    setCustomerName("");
    setMobileNumber("");
    clearCart();
  }

  return (
    <div className="mt-2">
      <div className="d-flex justify-content-between mb-2">
        <span className="text-light">Item: </span>
        <span className="text-light">{formatCurrency(totalAmount)}</span>
      </div>
      <div className="d-flex justify-content-between mb-2">
        <span className="text-light">Tax (10%): </span>
        <span className="text-light">{formatCurrency(tax)}</span>
      </div>
      <div className="d-flex justify-content-between mb-2">
        <span className="text-light">Total: </span>
        <span className="text-light">{formatCurrency(grandTotal)}</span>
      </div>

      <div className="d-flex gap-3">
        <button
          className="btn btn-success flex-grow-1"
          onClick={() => onCreateOrder("CASH")}
          disabled={isCreating || !cartItems.length}
        >
          CASH
        </button>
        <button
          className="btn btn-primary flex-grow-1"
          onClick={() => onCreateOrder("PAYOS")}
          disabled={isCreating || !cartItems.length}
        >
          PAYOS
        </button>
      </div>
      <div className="d-flex gap-3 mt-3">
        <button
          className="btn btn-warning flex-grow-1"
          onClick={() => handleClearCart()}
        >
          Place Order
        </button>
      </div>

      {/* 3. GIAO DIỆN MODAL HIỂN THỊ MÃ QR */}
      {showModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }} // Tạo lớp nền tối mờ
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              {/* Header của Modal có nút X để đóng */}
              <div className="modal-header border-0 pb-0">
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                ></button>
              </div>

              {/* Body của Modal: Hiển thị Component PaymentQRCode */}
              <div className="modal-body pt-0">
                {/* Chỉ render nếu có orderData */}
                {orderData && <PaymentQRCode orderData={orderData} />}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartSummary;
