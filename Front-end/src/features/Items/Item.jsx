import { useState } from "react";
import Spinner from "../../ui/Spinner";
import { formatCurrency } from "../../utils/formatCurrency";
import { useDeleteItem } from "./useDeleteItem";
import StockOperationModal from "../Inventory/StockOperationModal";

function Item({ item }) {
  const { isDeleting, deleteItem } = useDeleteItem();
  const [showDetails, setShowDetails] = useState(false);
  const [selectedVariantForStock, setSelectedVariantForStock] = useState(null);

  const hasVariants = item.variants && item.variants.length > 0;
  const hasModifiers = item.modifierGroups && item.modifierGroups.length > 0;

  return (
    <div className="col-12">
      <div className="card p-3 bg-dark text-white border-secondary shadow-sm">
        <div className="d-flex align-items-center">
          <div style={{ marginRight: "15px" }}>
            <img
              src={item.imgUrl || "https://placehold.co/60x60?text=Item"}
              alt={item.name}
              className="item-image"
            />
          </div>
          <div className="flex-grow-1">
            <h6 className="mb-1 text-white">{item.name}</h6>
            <p className="mb-1 text-secondary small">
              Category: <span className="text-light">{item.categoryName}</span>
            </p>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="badge rounded-pill text-bg-warning">
                {formatCurrency(item.price)}
              </span>
              {hasVariants && (
                <span className="badge bg-secondary">
                  {item.variants.length}{" "}
                  {item.variants.length === 1 ? "variant" : "variants"}
                </span>
              )}
              {hasModifiers && (
                <span className="badge bg-info text-dark">
                  {item.modifierGroups.length} modifier groups
                </span>
              )}
            </div>
          </div>
          <div className="d-flex gap-2">
            {(hasVariants || hasModifiers) && (
              <button
                className="btn btn-outline-warning btn-sm"
                onClick={() => setShowDetails(!showDetails)}
                title="Toggle details"
              >
                <i
                  className={`bi ${
                    showDetails ? "bi-chevron-up" : "bi-chevron-down"
                  }`}
                ></i>
              </button>
            )}
            <button
              className="btn btn-danger btn-sm"
              onClick={() => {
                if (window.confirm(`Delete item "${item.name}"?`)) {
                  deleteItem(item.itemId);
                }
              }}
              disabled={isDeleting}
              title="Delete item"
            >
              {isDeleting ? <Spinner /> : <i className="bi bi-trash"></i>}
            </button>
          </div>
        </div>

        {/* Detailed Breakdown for Variants & Modifiers */}
        {showDetails && (
          <div className="mt-3 pt-3 border-top border-secondary">
            {/* Variants Section */}
            {hasVariants && (
              <div className="mb-2">
                <div className="text-warning small fw-semibold mb-1">
                  Physical Variants (SKUs):
                </div>
                <div className="d-flex flex-column gap-1">
                  {item.variants.map((v) => {
                    const attrEntries = Object.entries(v.attributes || {});
                    return (
                      <div
                        key={v.variantId || v.sku}
                        className="d-flex justify-content-between align-items-center p-2 rounded bg-black bg-opacity-25 small"
                      >
                        <div>
                          <span className="badge bg-dark border border-secondary me-2">
                            {v.sku}
                          </span>
                          {attrEntries.length > 0 ? (
                            attrEntries.map(([k, val]) => (
                              <span key={k} className="text-light me-2">
                                <span className="text-secondary">{k}:</span>{" "}
                                {val}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted">Standard</span>
                          )}
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <span
                            className={`badge ${
                              (v.cachedStockQuantity ?? 0) > 0
                                ? "bg-success"
                                : "bg-danger"
                            }`}
                            title="Current Cached Stock"
                          >
                            Stock: {v.cachedStockQuantity ?? 0}
                          </span>
                          <span className="fw-bold text-warning">
                            {formatCurrency(v.basePrice)}
                          </span>
                          <button
                            type="button"
                            className="btn btn-outline-warning btn-sm py-0 px-2"
                            style={{ fontSize: "0.75rem" }}
                            onClick={() => setSelectedVariantForStock(v)}
                            title="Stock Operations (Nhập kho / Xuất huỷ)"
                          >
                            <i className="bi bi-box-seam me-1"></i> Stock Op
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Modifier Groups Section */}
            {hasModifiers && (
              <div className="mt-2">
                <div className="text-info small fw-semibold mb-1">
                  Attached Modifier Groups:
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {item.modifierGroups.map((g) => (
                    <div
                      key={g.groupId}
                      className="p-2 rounded bg-black bg-opacity-25 small border border-secondary"
                    >
                      <span className="fw-semibold text-light me-1">
                        {g.name}:
                      </span>
                      {g.modifiers?.map((m) => (
                        <span
                          key={m.modifierId}
                          className="badge bg-secondary me-1"
                        >
                          {m.name}
                          {m.priceAdjustment > 0 &&
                            ` (+${formatCurrency(m.priceAdjustment)})`}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <StockOperationModal
        variant={selectedVariantForStock}
        itemName={item.name}
        isOpen={Boolean(selectedVariantForStock)}
        onClose={() => setSelectedVariantForStock(null)}
      />
    </div>
  );
}

export default Item;
