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
    <div className="flex gap-6 p-6 h-[calc(100vh-4rem)] bg-slate-50 overflow-hidden">
      {/* Left Column - Categories & Items */}
      <div className="flex-1 flex flex-col min-w-0 bg-white rounded-xl shadow-sm border border-slate-200 p-5 overflow-hidden">
        {/* Store-wide Active Promotions Banner */}
        {activePromotions && activePromotions.length > 0 && (
          <div className="bg-slate-900 text-white py-2 px-3 mb-3 rounded-lg shadow-xs text-xs flex-shrink-0">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center flex-wrap gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded font-bold bg-amber-400 text-slate-900 text-[11px]">
                  🔥 KHUYẾN MÃI
                </span>
                {activePromotions.map((p) => {
                  if (p.type === "HAPPY_HOUR") {
                    return (
                      <span
                        key={p.id}
                        className="inline-flex items-center px-2 py-0.5 rounded bg-red-600 text-white font-medium text-xs shadow-xs"
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
                        className="inline-flex items-center px-2 py-0.5 rounded bg-blue-600 text-white font-medium text-xs shadow-xs"
                      >
                        🎁 BOGO: {p.name}
                      </span>
                    );
                  }
                  if (p.type === "COUPON" && p.code) {
                    return (
                      <span
                        key={p.id}
                        className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-600 text-white font-medium text-xs shadow-xs"
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
              <span className="text-slate-400 text-[11px]">
                * Áp dụng 1 ưu đãi cao nhất cho hóa đơn
              </span>
            </div>
          </div>
        )}

        {/* Categories Row */}
        <div className="flex-shrink-0 overflow-x-auto pb-2">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Spinner size={24} className="text-blue-600" />
            </div>
          ) : (
            <DisplayCategories
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={categories}
            />
          )}
        </div>

        <div className="border-t border-slate-200 my-3 flex-shrink-0"></div>

        {/* Items Grid Row */}
        <div className="flex-1 overflow-y-auto">
          <DisplayItems
            addToCart={addToCart}
            selectedCategory={selectedCategory}
          />
        </div>
      </div>

      {/* Right Column - Cart & Customer */}
      <div className="w-96 flex-shrink-0 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 p-5 overflow-hidden">
        {/* Customer Form */}
        <div className="flex-shrink-0 border-b border-slate-200 pb-3 mb-2">
          <CustomerForm
            customerName={customerName}
            setCustomerName={setCustomerName}
            mobileNumber={mobileNumber}
            setMobileNumber={setMobileNumber}
            setCustomerId={setCustomerId}
          />
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto min-h-0 py-1">
          <CartItems
            cartItems={cartItems}
            removeFromCart={removeFromCart}
            updateQuantity={updateQuantity}
          />
        </div>

        {/* Cart Summary */}
        <div className="flex-shrink-0 border-t border-slate-200 pt-3 overflow-y-auto max-h-[50%]">
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
