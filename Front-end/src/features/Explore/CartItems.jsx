import { formatCurrency } from "../../utils/formatCurrency";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";

function CartItems({ cartItems, removeFromCart, updateQuantity }) {
  return (
    <div className="space-y-2">
      {cartItems.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <ShoppingCart size={32} className="mx-auto mb-2 text-slate-300" />
          <p className="text-xs">Giỏ hàng đang trống</p>
        </div>
      ) : (
        cartItems.map((item, index) => {
          const id = item.cartItemId || item.itemId;
          return (
            <div
              key={id || index}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl shadow-2xs hover:border-slate-300 transition-all"
            >
              <div className="flex justify-between items-start gap-2 mb-1">
                <div className="min-w-0">
                  <h6 className="text-xs font-semibold text-slate-900 truncate">
                    {item.name}
                  </h6>
                  {item.variantLabel && (
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-200 text-slate-700 mr-1 mt-0.5">
                      {item.variantLabel}
                    </span>
                  )}
                  {item.variantSku && !item.variantLabel && (
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-200 text-slate-700 mr-1 mt-0.5">
                      {item.variantSku}
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold text-slate-900 flex-shrink-0">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>

              {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                <div className="text-[11px] text-blue-600 mb-1.5 flex flex-wrap gap-1">
                  {item.selectedModifiers.map((m) => (
                    <span key={m.modifierId}>
                      +{m.name}
                      {m.priceAdjustment > 0 &&
                        ` (${formatCurrency(m.priceAdjustment)})`}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center mt-2 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    className="w-6 h-6 rounded-md border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 disabled:opacity-40 cursor-pointer"
                    disabled={item.quantity === 1}
                    onClick={() => updateQuantity(id, item.quantity - 1)}
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-xs font-bold text-slate-900 w-5 text-center">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    className="w-6 h-6 rounded-md border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
                    onClick={() => updateQuantity(id, item.quantity + 1)}
                  >
                    <Plus size={12} />
                  </button>
                  <span className="text-[11px] text-slate-400 ml-1.5">
                    @ {formatCurrency(item.price)}
                  </span>
                </div>

                <button
                  type="button"
                  className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                  onClick={() => removeFromCart(id)}
                  title="Xóa mặt hàng"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default CartItems;
