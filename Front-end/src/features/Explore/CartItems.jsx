import { formatCurrency } from "../../utils/formatCurrency";

function CartItems({ cartItems, removeFromCart, updateQuantity }) {
  return (
    <div className="p-3 overflow-y-auto">
      {cartItems.length === 0 ? (
        <p className="text-light">Your cart is empty</p>
      ) : (
        <div className="cart-items-list">
          {cartItems.map((item, index) => {
            const id = item.cartItemId || item.itemId;
            return (
              <div
                key={id || index}
                className="cart-item mb-3 p-3 bg-dark border border-secondary rounded shadow-sm"
              >
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <div>
                    <h6 className="mb-0 text-light fw-bold">{item.name}</h6>
                    {item.variantLabel && (
                      <span
                        className="badge bg-secondary me-1 mt-1"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {item.variantLabel}
                      </span>
                    )}
                    {item.variantSku && !item.variantLabel && (
                      <span
                        className="badge bg-secondary me-1 mt-1"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {item.variantSku}
                      </span>
                    )}
                  </div>
                  <p className="mb-0 text-warning fw-bold">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>

                {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                  <div className="small text-info mb-2" style={{ fontSize: "0.75rem" }}>
                    {item.selectedModifiers.map((m) => (
                      <span key={m.modifierId} className="me-2">
                        +{m.name}
                        {m.priceAdjustment > 0 &&
                          ` (${formatCurrency(m.priceAdjustment)})`}
                      </span>
                    ))}
                  </div>
                )}

                <div className="d-flex justify-content-between align-items-center mt-2">
                  <div className="d-flex align-items-center gap-2">
                    <button
                      className="btn btn-danger btn-sm py-0 px-2"
                      disabled={item.quantity === 1}
                      onClick={() => updateQuantity(id, item.quantity - 1)}
                    >
                      <i className="bi bi-dash"></i>
                    </button>
                    <span className="text-light fw-bold">{item.quantity}</span>
                    <button
                      className="btn btn-primary btn-sm py-0 px-2"
                      onClick={() => updateQuantity(id, item.quantity + 1)}
                    >
                      <i className="bi bi-plus"></i>
                    </button>
                    <span className="text-muted small ms-2">
                      @ {formatCurrency(item.price)}
                    </span>
                  </div>
                  <button
                    className="btn btn-outline-danger btn-sm py-0 px-2"
                    style={{ width: "auto" }}
                    onClick={() => removeFromCart(id)}
                    title="Remove item"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
export default CartItems;
