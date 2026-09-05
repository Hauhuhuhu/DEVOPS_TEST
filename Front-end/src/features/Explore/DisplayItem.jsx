import { useState } from "react";
import { formatCurrency } from "../../utils/formatCurrency";
import POSItemModal from "./POSItemModal";

function DisplayItem({ addToCart, item }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasVariants = item.variants && item.variants.length > 0;
  const hasModifiers = item.modifierGroups && item.modifierGroups.length > 0;
  const needsCustomization = hasVariants || hasModifiers;

  const handleCardClick = () => {
    if (needsCustomization) {
      setIsModalOpen(true);
    } else {
      addToCart({
        cartItemId: `${item.itemId}_default`,
        name: item.name,
        basePrice: item.price,
        price: item.price,
        quantity: 1,
        itemId: item.itemId,
        variantId: item.variants?.[0]?.variantId || null,
        selectedModifiers: [],
      });
    }
  };

  return (
    <>
      <div
        className="p-3 bg-dark rounded shadow-sm h-100 d-flex align-items-center item-card category-hover"
        onClick={handleCardClick}
        style={{ cursor: "pointer" }}
      >
        <div style={{ position: "relative", marginRight: "15px" }}>
          <img
            src={item.imgUrl || "https://placehold.co/60x60?text=Item"}
            alt={item.name}
            className="item-image"
          />
        </div>
        <div className="flex-grow-1 ms-2">
          <h6 className="mb-1 text-light">{item.name}</h6>
          <p className="mb-0 fw-bold text-warning">{formatCurrency(item.price)}</p>
          {hasVariants && (
            <span className="badge bg-secondary me-1" style={{ fontSize: "0.65rem" }}>
              {item.variants.length} Variants
            </span>
          )}
          {hasModifiers && (
            <span className="badge bg-info text-dark" style={{ fontSize: "0.65rem" }}>
              Customizable
            </span>
          )}
        </div>
        <div
          className="d-flex flex-column justify-content-between align-items-center ms-3"
          style={{ height: "100%" }}
        >
          <i className="bi bi-cart-plus fs-4 text-warning"></i>
          <button
            className="btn btn-sm btn-success"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            title={needsCustomization ? "Customize item" : "Add to cart"}
          >
            <i className="bi bi-plus"></i>
          </button>
        </div>
      </div>

      <POSItemModal
        item={item}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={addToCart}
      />
    </>
  );
}
export default DisplayItem;
