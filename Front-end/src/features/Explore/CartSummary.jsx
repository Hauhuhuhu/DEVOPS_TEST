import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateOrder } from "../Orders/useCreateOrder";
import PaymentQRCode from "../Payment/PaymentQRCode";
import toast from "react-hot-toast";
import { formatCurrency } from "../../utils/formatCurrency";
import { evaluatePromotion } from "../../services/PromotionService";

function CartSummary({
  customerName,
  setCustomerName,
  mobileNumber,
  setMobileNumber,
  cartItems,
  clearCart,
}) {
  const queryClient = useQueryClient();
  const { isCreating, createOrder, orderData } = useCreateOrder();

  const [showModal, setShowModal] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  const rawTotal = cartItems.reduce(
    (total, item) => total + (item.price || item.basePrice || 0) * item.quantity,
    0,
  );

  // Evaluate promotions whenever cart items or applied coupon changes
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      return;
    }

    let isMounted = true;
    const formattedCartItems = cartItems.map((item) => ({
      itemId: item.itemId,
      variantId: item.variantId || null,
      name: item.name,
      basePrice: item.basePrice || item.price,
      price: item.price,
      quantity: item.quantity,
      selectedModifiers: item.selectedModifiers || [],
    }));

    evaluatePromotion({
      couponCode: appliedCoupon || undefined,
      cartItems: formattedCartItems,
    })
      .then((data) => {
        if (isMounted) {
          setEvaluation(data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          if (appliedCoupon) {
            toast.error(
              err.response?.data?.message ||
                "Mã giảm giá không còn khả dụng với giỏ hàng hiện tại",
            );
            setAppliedCoupon("");
            evaluatePromotion({ cartItems: formattedCartItems })
              .then((fallback) => {
                if (isMounted) setEvaluation(fallback);
              })
              .catch(() => {});
          }
        }
      });

    return () => {
      isMounted = false;
    };
  }, [cartItems, appliedCoupon]);

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }
    if (!cartItems.length) {
      toast.error("Giỏ hàng đang trống");
      return;
    }

    const formattedCartItems = cartItems.map((item) => ({
      itemId: item.itemId,
      variantId: item.variantId || null,
      name: item.name,
      basePrice: item.basePrice || item.price,
      price: item.price,
      quantity: item.quantity,
      selectedModifiers: item.selectedModifiers || [],
    }));

    setIsEvaluating(true);
    try {
      const res = await evaluatePromotion({
        couponCode: code,
        cartItems: formattedCartItems,
      });
      setAppliedCoupon(code);
      setEvaluation(res);
      toast.success(res.message || "Áp dụng mã giảm giá thành công!");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Mã giảm giá không hợp lệ";
      toast.error(msg);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon("");
    setCouponInput("");
    toast.success("Đã gỡ mã giảm giá");
  };

  // Calculations
  const activeEvaluation = cartItems?.length > 0 ? evaluation : null;
  const subtotal = activeEvaluation ? activeEvaluation.subtotal : rawTotal;
  const discountAmount = activeEvaluation ? activeEvaluation.discountAmount : 0;
  const tax = activeEvaluation ? activeEvaluation.tax : rawTotal * 0.1;
  const grandTotal = activeEvaluation ? activeEvaluation.grandTotal : rawTotal + tax;

  function onCreateOrder(paymentMode) {
    const formattedCartItems = cartItems.map((item) => ({
      itemId: item.itemId,
      variantId: item.variantId || null,
      name: item.name,
      basePrice: item.basePrice || item.price,
      price: item.price,
      quantity: item.quantity,
      selectedModifiers: item.selectedModifiers || [],
    }));

    const dataForm = {
      customerName: customerName.trim() || "Người dùng mặc định",
      phoneNumber: mobileNumber.trim() || "0000000000",
      cartItems: formattedCartItems,
      subtotal,
      discountAmount,
      tax,
      grandTotal,
      appliedPromotionId: activeEvaluation?.appliedPromotionId || null,
      couponCode: appliedCoupon || null,
      paymentMethod: paymentMode.toUpperCase(),
    };

    createOrder(dataForm, {
      onSuccess: (dt) => {
        queryClient.invalidateQueries({ queryKey: ["items"] });
        queryClient.invalidateQueries({ queryKey: ["inventory-transactions"] });

        if (paymentMode === "PAYOS") {
          setShowModal(true);
        } else if (
          paymentMode === "CASH" &&
          dt.data?.paymentDetails?.status === "COMPLETED"
        ) {
          toast.success("Thanh toán thành công");
          handleClearCart();
        }
      },
    });
  }

  function handleClearCart() {
    setCustomerName("");
    setMobileNumber("");
    setCouponInput("");
    setAppliedCoupon("");
    setEvaluation(null);
    clearCart();
  }

  return (
    <div className="mt-2">
      {/* Coupon Input Section */}
      <div className="input-group input-group-sm mb-2">
        <input
          type="text"
          className="form-control bg-dark text-white border-secondary"
          placeholder="Mã giảm giá (Coupon)"
          value={couponInput}
          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
          disabled={isEvaluating || Boolean(appliedCoupon)}
        />
        {appliedCoupon ? (
          <button
            className="btn btn-outline-danger"
            type="button"
            onClick={handleRemoveCoupon}
            disabled={isEvaluating}
          >
            Gỡ mã
          </button>
        ) : (
          <button
            className="btn btn-outline-warning"
            type="button"
            onClick={handleApplyCoupon}
            disabled={isEvaluating || !cartItems.length}
          >
            {isEvaluating ? "Đang tính..." : "Áp dụng"}
          </button>
        )}
      </div>

      {/* Promotion Active Badge */}
      {activeEvaluation?.appliedPromotionType === "HAPPY_HOUR" && (
        <div className="d-flex align-items-center justify-content-between mb-2 p-1 px-2 rounded bg-warning-subtle text-warning-emphasis small">
          <span>
            ⚡ Khung giờ vàng: <strong>{activeEvaluation.appliedPromotionName}</strong>
          </span>
        </div>
      )}

      {activeEvaluation?.appliedPromotionType === "COUPON" && (
        <div className="d-flex align-items-center justify-content-between mb-2 p-1 px-2 rounded bg-success-subtle text-success small">
          <span>
            🏷️ Mã ưu đãi: <strong>{appliedCoupon}</strong> ({activeEvaluation.appliedPromotionName})
          </span>
        </div>
      )}

      {activeEvaluation?.appliedPromotionType === "BOGO" && (
        <div className="d-flex align-items-center justify-content-between mb-2 p-1 px-2 rounded bg-info-subtle text-info-emphasis small">
          <span>
            🎁 Mua 1 Tặng 1: <strong>{activeEvaluation.appliedPromotionName}</strong>
          </span>
        </div>
      )}

      {/* Pricing Breakdown */}
      <div className="d-flex justify-content-between mb-1">
        <span className="text-secondary small">Tạm tính:</span>
        <span className="text-light">{formatCurrency(subtotal)}</span>
      </div>

      {discountAmount > 0 && (
        <div className="d-flex justify-content-between mb-1 text-danger">
          <span className="small">
            Giảm giá {activeEvaluation?.appliedPromotionName ? `(${activeEvaluation.appliedPromotionName})` : ""}:
          </span>
          <span className="fw-semibold">-{formatCurrency(discountAmount)}</span>
        </div>
      )}

      <div className="d-flex justify-content-between mb-1">
        <span className="text-secondary small">Thuế (10%):</span>
        <span className="text-light">{formatCurrency(tax)}</span>
      </div>

      <div className="d-flex justify-content-between mb-2">
        <span className="text-light fw-bold">Tổng thanh toán:</span>
        <span className="text-warning fw-bold fs-5">
          {formatCurrency(grandTotal)}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="d-flex gap-2">
        <button
          className="btn btn-success flex-grow-1"
          onClick={() => onCreateOrder("CASH")}
          disabled={isCreating || !cartItems.length}
        >
          TIỀN MẶT
        </button>
        <button
          className="btn btn-primary flex-grow-1"
          onClick={() => onCreateOrder("PAYOS")}
          disabled={isCreating || !cartItems.length}
        >
          CHUYỂN KHOẢN (PAYOS)
        </button>
      </div>
      <div className="d-flex gap-2 mt-2">
        <button
          className="btn btn-outline-secondary btn-sm flex-grow-1"
          onClick={() => handleClearCart()}
        >
          Xóa giỏ hàng
        </button>
      </div>

      {/* Modal PayOS */}
      {showModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header border-0 pb-0">
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body pt-0">
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

