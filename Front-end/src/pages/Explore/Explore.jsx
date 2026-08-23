import { useState } from "react";
import { useCategories } from "../../features/Category/useCategories";
import CartItems from "../../features/Explore/CartItems";
import CartSummary from "../../features/Explore/CartSummary";
import CustomerForm from "../../features/Explore/CustomerForm";
import DisplayCategories from "../../features/Explore/DisplayCategories";
import DisplayItems from "../../features/Explore/DisplayItems";
import Spinner from "../../ui/Spinner";
import "./Explore.css";
import { useCartItem } from "../../features/Explore/useCartItem";
function Explore() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const { categories, isLoading } = useCategories();
  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart } =
    useCartItem();
  return (
    <div className="item-container text-light">
      <div className="left-column">
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
        <div className="customer-form-container" style={{ height: "15%" }}>
          <CustomerForm
            customerName={customerName}
            setCustomerName={setCustomerName}
            mobileNumber={mobileNumber}
            setMobileNumber={setMobileNumber}
          />
        </div>
        <hr className="my-3 text-light" />
        <div
          className="cart-items-container"
          style={{ height: "55%", overflowY: "auto" }}
        >
          <CartItems
            cartItems={cartItems}
            removeFromCart={removeFromCart}
            updateQuantity={updateQuantity}
          />
        </div>
        <div className="cart-summary-container" style={{ height: "30%" }}>
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
