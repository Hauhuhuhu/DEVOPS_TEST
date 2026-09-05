import { useState } from "react";
import { formatCurrency } from "../../utils/formatCurrency";

function POSItemModal({ item, isOpen, onClose, onAddToCart }) {
  const hasVariants = item?.variants && item.variants.length > 0;
  const hasModifiers = item?.modifierGroups && item.modifierGroups.length > 0;

  // Selected variant state (defaults to first variant if available)
  const [selectedVariantId, setSelectedVariantId] = useState(() => {
    return hasVariants ? item.variants[0]?.variantId : null;
  });

  // Selected modifiers state: Map of groupId -> Set of modifierIds
  const [selectedModifiersMap, setSelectedModifiersMap] = useState({});
  const [quantity, setQuantity] = useState(1);

  // Active selected variant object
  const activeVariant = hasVariants
    ? item.variants.find((v) => v.variantId === selectedVariantId) || item.variants[0]
    : null;

  // Calculate base price
  const basePrice = activeVariant
    ? Number(activeVariant.basePrice)
    : Number(item?.price || 0);

  // Selected modifiers list
  const selectedModifiersList = [];
  if (hasModifiers && item.modifierGroups) {
    item.modifierGroups.forEach((group) => {
      const selectedIds = selectedModifiersMap[group.groupId];
      if (selectedIds && group.modifiers) {
        group.modifiers.forEach((mod) => {
          if (selectedIds.has(mod.modifierId)) {
            selectedModifiersList.push({
              modifierId: mod.modifierId,
              name: mod.name,
              priceAdjustment: Number(mod.priceAdjustment || 0),
            });
          }
        });
      }
    });
  }

  // Dynamic unit price: basePrice + sum(selected modifiers price adjustments)
  const modifiersAdjustment = selectedModifiersList.reduce(
    (sum, m) => sum + m.priceAdjustment,
    0
  );
  const unitPrice = basePrice + modifiersAdjustment;
  const totalLinePrice = unitPrice * quantity;

  if (!isOpen || !item) return null;

  const handleModifierToggle = (group, modifier) => {
    setSelectedModifiersMap((prev) => {
      const currentSelected = new Set(prev[group.groupId] || []);
      const isSingleSelect = group.maxSelections === 1;

      if (isSingleSelect) {
        if (currentSelected.has(modifier.modifierId)) {
          // If already selected and minSelections is 0, allow deselecting
          if (group.minSelections === 0) {
            currentSelected.clear();
          }
        } else {
          currentSelected.clear();
          currentSelected.add(modifier.modifierId);
        }
      } else {
        // Multi-select
        if (currentSelected.has(modifier.modifierId)) {
          currentSelected.delete(modifier.modifierId);
        } else {
          const max = group.maxSelections || Infinity;
          if (currentSelected.size < max) {
            currentSelected.add(modifier.modifierId);
          }
        }
      }

      return {
        ...prev,
        [group.groupId]: currentSelected,
      };
    });
  };

  const handleAdd = () => {
    const variantLabel = activeVariant?.attributes
      ? Object.entries(activeVariant.attributes)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ")
      : activeVariant?.sku || null;

    const modKey = selectedModifiersList
      .map((m) => m.modifierId)
      .sort()
      .join("-");
    const cartItemId = `${item.itemId}_${activeVariant?.variantId || "default"}_${modKey}`;

    onAddToCart({
      cartItemId,
      itemId: item.itemId,
      variantId: activeVariant?.variantId || null,
      variantSku: activeVariant?.sku || null,
      variantLabel,
      name: item.name,
      basePrice,
      price: unitPrice,
      quantity,
      selectedModifiers: selectedModifiersList,
    });

    onClose();
  };

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content bg-dark text-light border border-secondary shadow-lg">
          {/* Header */}
          <div className="modal-header border-secondary">
            <div className="d-flex align-items-center gap-3">
              {item.imgUrl && (
                <img
                  src={item.imgUrl}
                  alt={item.name}
                  style={{
                    width: "48px",
                    height: "48px",
                    objectFit: "cover",
                    borderRadius: "6px",
                  }}
                />
              )}
              <div>
                <h5 className="modal-title text-warning fw-bold mb-0">
                  {item.name}
                </h5>
                <span className="text-muted small">
                  Category: {item.categoryName || "General"}
                </span>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>

          <div
            className="modal-body"
            style={{ maxHeight: "65vh", overflowY: "auto" }}
          >
            {/* 1. Variant Selection */}
            {hasVariants && (
              <div className="mb-4">
                <label className="form-label text-warning fw-semibold small text-uppercase">
                  Select Variant / Size:
                </label>
                <div className="row g-2">
                  {item.variants.map((variant) => {
                    const isSelected =
                      (activeVariant?.variantId || item.variants[0]?.variantId) ===
                      variant.variantId;
                    const attrSummary = variant.attributes
                      ? Object.entries(variant.attributes)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(" | ")
                      : variant.sku;

                    return (
                      <div key={variant.variantId} className="col-md-6">
                        <div
                          className={`p-3 rounded border cursor-pointer d-flex justify-content-between align-items-center ${
                            isSelected
                              ? "border-warning bg-black bg-opacity-50 text-warning"
                              : "border-secondary bg-black bg-opacity-25 text-light"
                          }`}
                          style={{ cursor: "pointer" }}
                          onClick={() => setSelectedVariantId(variant.variantId)}
                        >
                          <div>
                            <div className="fw-bold">
                              {attrSummary || variant.sku}
                            </div>
                            <div className="small text-muted">
                              SKU: {variant.sku}
                            </div>
                            <div className="mt-1">
                              <span
                                className={`badge ${
                                  (variant.cachedStockQuantity ?? 0) > 0
                                    ? "bg-success"
                                    : "bg-danger"
                                }`}
                                style={{ fontSize: "0.7rem" }}
                              >
                                Stock: {variant.cachedStockQuantity ?? 0}
                              </span>
                            </div>
                          </div>
                          <span className="fw-bold fs-6">
                            {formatCurrency(variant.basePrice)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Modifiers Selection */}
            {hasModifiers && (
              <div className="mb-3">
                <label className="form-label text-warning fw-semibold small text-uppercase mb-2">
                  Customize Options & Add-ons:
                </label>
                {item.modifierGroups.map((group) => {
                  const selectedSet =
                    selectedModifiersMap[group.groupId] || new Set();
                  const isSingleSelect = group.maxSelections === 1;

                  return (
                    <div
                      key={group.groupId}
                      className="p-3 mb-3 rounded bg-black bg-opacity-25 border border-secondary"
                    >
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-bold text-light">
                          {group.name}
                        </span>
                        <span className="badge bg-secondary text-light">
                          {isSingleSelect
                            ? "Choose 1"
                            : `Max ${group.maxSelections || "unlimited"}`}
                        </span>
                      </div>
                      {group.description && (
                        <div className="small text-muted mb-2">
                          {group.description}
                        </div>
                      )}

                      <div className="d-flex flex-wrap gap-2">
                        {group.modifiers?.map((mod) => {
                          const isModSelected = selectedSet.has(mod.modifierId);
                          return (
                            <button
                              key={mod.modifierId}
                              type="button"
                              className={`btn btn-sm ${
                                isModSelected
                                  ? "btn-warning text-dark fw-bold"
                                  : "btn-outline-secondary text-light"
                              }`}
                              onClick={() => handleModifierToggle(group, mod)}
                            >
                              {mod.name}
                              {mod.priceAdjustment > 0 && (
                                <span className="ms-1 small">
                                  (+{formatCurrency(mod.priceAdjustment)})
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 3. Quantity Selector */}
            <div className="d-flex align-items-center justify-content-between p-3 rounded bg-black bg-opacity-25 border border-secondary mb-3">
              <span className="fw-bold text-light">Quantity:</span>
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <i className="bi bi-dash"></i>
                </button>
                <span className="fw-bold px-3 fs-5 text-warning">
                  {quantity}
                </span>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  <i className="bi bi-plus"></i>
                </button>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="d-flex justify-content-between align-items-center text-muted small px-1">
              <span>
                Unit: {formatCurrency(unitPrice)}
                {selectedModifiersList.length > 0 && (
                  <span className="ms-1">
                    ({formatCurrency(basePrice)} + {selectedModifiersList.length}{" "}
                    modifiers)
                  </span>
                )}
              </span>
              <span className="fs-5 fw-bold text-warning">
                Total: {formatCurrency(totalLinePrice)}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer border-secondary">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-success fw-bold px-4"
              onClick={handleAdd}
            >
              <i className="bi bi-cart-plus me-1"></i> Add to Cart -{" "}
              {formatCurrency(totalLinePrice)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default POSItemModal;
