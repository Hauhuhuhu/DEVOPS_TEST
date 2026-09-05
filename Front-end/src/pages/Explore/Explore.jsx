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
  const { categories, isLoading } = useCategories();
  const { activePromotions } = useActivePromotions();
  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart } =
    useCartItem();

  const activeHappyHour = activePromotions?.find((p) => p.type === "HAPPY_HOUR");

  return (
    <div className="item-container text-light">
      <div className="left-column">
        {/* Happy Hour Active Banner */}
        {activeHappyHour && (
          <div className="alert alert-warning py-1 px-3 mb-2 d-flex align-items-center justify-content-between rounded-3 shadow-sm border-0 bg-warning text-dark small">
            <div>
              <span className="me-2">⚡ <strong>GIỜ VÀNG ƯU ĐÃI:</strong></span>
              <span>{activeHappyHour.name}</span>
              {activeHappyHour.discountType === "PERCENTAGE" ? (
                <span className="badge bg-danger ms-2">
                  -{activeHappyHour.discountValue}%
                </span>
              ) : (
                <span className="badge bg-danger ms-2">
                  -{formatCurrency(activeHappyHour.discountValue)}
                </span>
              )}
            </div>
            {activeHappyHour.startTime && activeHappyHour.endTime && (
              <span className="text-secondary small">
                ({activeHappyHour.startTime.substring(0, 5)} - {activeHappyHour.endTime.substring(0, 5)})
              </span>
            )}
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
            cartItems={cartItems}
            clearCart={clearCart}
          />
        </div>
      </div>
    </div>
  );
}
export default Explore;
