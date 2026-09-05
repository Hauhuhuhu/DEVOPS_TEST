import { useState } from "react";
import { useCategories } from "../../features/Category/useCategories";
import { useActivePromotions } from "../../features/Promotions/useActivePromotions";
import CartItems from "../../features/Explore/CartItems";
import CartSummary from "../../features/Explore/CartSummary";
import CustomerForm from "../../features/Explore/CustomerForm";
import DisplayCategories from "../../features/Explore/DisplayCategories";
import DisplayItems from "../../features/Explore/DisplayItems";
import Spinner from "../../ui/Spinner";
import { formatCurrency } from "../../utils/formatCurrency";
import "./Explore.css";
import { useCartItem } from "../../features/Explore/useCartItem";

function Explore() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [customerId, setCustomerId] = useState(null);
  const { categories, isLoading } = useCategories();
  const { activePromotions } = useActivePromotions();
  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart } =
    useCartItem();
  return (
    <div className="item-container text-light">
      <div className="left-column">
        {/* Store-wide Active Promotions Banner */}
        {activePromotions && activePromotions.length > 0 && (
          <div className="alert alert-dark border border-warning-subtle py-2 px-3 mb-2 rounded-3 shadow-sm text-light small">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div className="d-flex align-items-center flex-wrap gap-2">
                <span className="badge bg-warning text-dark fw-bold px-2 py-1">
                  🔥 KHUYẾN MÃI CỬA HÀNG
                </span>
                {activePromotions.map((p) => {
                  if (p.type === "HAPPY_HOUR") {
                    return (
                      <span
                        key={p.id}
                        className="badge bg-danger d-inline-flex align-items-center gap-1 py-1 px-2 shadow-sm"
                        title={`Áp dụng khung giờ ${p.startTime?.substring(0, 5)} - ${p.endTime?.substring(0, 5)}`}
                      >
                        ⚡ Giờ vàng: {p.name} (
                        {p.discountType === "PERCENTAGE"
                          ? `-${p.discountValue}%`
                          : `-${formatCurrency(p.discountValue)}`}
                        )
                      </span>
                    );
                  }
                  if (p.type === "BOGO") {
                    return (
                      <span
                        key={p.id}
                        className="badge bg-info text-dark d-inline-flex align-items-center gap-1 py-1 px-2 shadow-sm"
                      >
                        🎁 BOGO: {p.name}
                      </span>
                    );
                  }
                  if (p.type === "COUPON" && p.code) {
                    return (
                      <span
                        key={p.id}
                        className="badge bg-success d-inline-flex align-items-center gap-1 py-1 px-2 shadow-sm"
                        title={p.name}
                      >
                        🏷️ Mã: <strong>{p.code}</strong> (
                        {p.discountType === "PERCENTAGE"
                          ? `-${p.discountValue}%`
                          : `-${formatCurrency(p.discountValue)}`}
                        )
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
              <span className="text-secondary" style={{ fontSize: "0.75rem" }}>
                * Áp dụng 1 ưu đãi cao nhất cho hóa đơn
              </span>
            </div>
          </div>
        )}

        <div className="first-row" style={{ overflowY: "auto" }}>
          {isLoading ? (
            <Spinner />
          ) : (
            <DisplayCategories
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={categories}
            />
          )}
        </div>
        <hr className="horizontal-line" />
        <div className="second-row" style={{ overflowY: "auto" }}>
          <DisplayItems
            addToCart={addToCart}
            selectedCategory={selectedCategory}
          />
        </div>
      </div>
      <div className="right-column d-flex flex-column">
        <div className="customer-form-container" style={{ height: "14%" }}>
          <CustomerForm
            customerName={customerName}
            setCustomerName={setCustomerName}
            mobileNumber={mobileNumber}
            setMobileNumber={setMobileNumber}
            setCustomerId={setCustomerId}
          />
        </div>
        <hr className="my-2 text-light" />
        <div
          className="cart-items-container"
          style={{ height: "46%", overflowY: "auto" }}
        >
          <CartItems
            cartItems={cartItems}
            removeFromCart={removeFromCart}
            updateQuantity={updateQuantity}
          />
        </div>
        <div className="cart-summary-container" style={{ height: "40%", overflowY: "auto" }}>
          <CartSummary
            customerName={customerName}
            setCustomerName={setCustomerName}
            mobileNumber={mobileNumber}
            setMobileNumber={setMobileNumber}
            customerId={customerId}
            setCustomerId={setCustomerId}
            cartItems={cartItems}
            clearCart={clearCart}
          />
        </div>
      </div>
    </div>
  );
}
export default Explore;
