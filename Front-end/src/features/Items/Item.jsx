import { useState } from "react";
import ConfirmDeleteModal from "../../ui/ConfirmDeleteModal";
import { formatCurrency } from "../../utils/formatCurrency";
import { useDeleteItem } from "./useDeleteItem";
import StockOperationModal from "../Inventory/StockOperationModal";
import { ChevronDown, ChevronUp, Trash2, Package } from "lucide-react";

function Item({ item }) {
  const { isDeleting, deleteItem } = useDeleteItem();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedVariantForStock, setSelectedVariantForStock] = useState(null);

  const hasVariants = item.variants && item.variants.length > 0;
  const hasModifiers = item.modifierGroups && item.modifierGroups.length > 0;

  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs hover:shadow-sm transition-all">
      <div className="flex items-center gap-3">
        <img
          src={item.imgUrl || "https://placehold.co/60x60?text=MH"}
          alt={item.name}
          className="w-14 h-14 rounded-lg object-cover border border-slate-200 bg-slate-50 flex-shrink-0"
        />

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-slate-900 truncate">{item.name}</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Danh mục: <span className="font-medium text-slate-700">{item.categoryName}</span>
          </p>
          <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
              {formatCurrency(item.price)}
            </span>
            {hasVariants && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                {item.variants.length} {item.variants.length === 1 ? "biến thể" : "biến thể"}
              </span>
            )}
            {hasModifiers && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                {item.modifierGroups.length} tùy chọn
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {(hasVariants || hasModifiers) && (
            <button
              type="button"
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => setShowDetails(!showDetails)}
              title="Hiện/ẩn chi tiết"
            >
              {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
          <button
            type="button"
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={isDeleting}
            title="Xóa mặt hàng"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Detailed Breakdown for Variants & Modifiers */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
          {/* Variants Section */}
          {hasVariants && (
            <div>
              <span className="text-xs font-semibold text-slate-700 block mb-1.5">
                Biến thể vật lý (SKU):
              </span>
              <div className="space-y-1.5">
                {item.variants.map((v) => {
                  const attrEntries = Object.entries(v.attributes || {});
                  const inStock = (v.cachedStockQuantity ?? 0) > 0;

                  return (
                    <div
                      key={v.variantId || v.sku}
                      className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-800">
                          {v.sku}
                        </span>
                        {attrEntries.length > 0 ? (
                          attrEntries.map(([k, val]) => (
                            <span key={k} className="text-slate-600">
                              <span className="text-slate-400">{k}:</span> {val}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400">Tiêu chuẩn</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            inStock
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                          title="Tồn kho hiện tại"
                        >
                          Tồn kho: {v.cachedStockQuantity ?? 0}
                        </span>
                        <span className="font-bold text-slate-900">
                          {formatCurrency(v.basePrice)}
                        </span>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-300 hover:bg-white text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                          onClick={() => setSelectedVariantForStock(v)}
                          title="Quản lý tồn kho (nhập kho / xuất hủy / kiểm kê)"
                        >
                          <Package size={13} className="text-blue-600" />
                          <span>Kho hàng</span>
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
            <div>
              <span className="text-xs font-semibold text-slate-700 block mb-1.5">
                Nhóm tùy chọn đi kèm:
              </span>
              <div className="flex flex-wrap gap-2">
                {item.modifierGroups.map((g) => (
                  <div
                    key={g.groupId}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  >
                    <span className="font-semibold text-slate-800 mr-1.5">
                      {g.name}:
                    </span>
                    <div className="inline-flex flex-wrap gap-1 mt-0.5">
                      {g.modifiers?.map((m) => (
                        <span
                          key={m.modifierId}
                          className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 text-[11px]"
                        >
                          {m.name}
                          {m.priceAdjustment > 0 &&
                            ` (+${formatCurrency(m.priceAdjustment)})`}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedVariantForStock && (
        <StockOperationModal
          key={selectedVariantForStock.variantId}
          variant={selectedVariantForStock}
          itemName={item.name}
          isOpen={Boolean(selectedVariantForStock)}
          onClose={() => setSelectedVariantForStock(null)}
        />
      )}

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          deleteItem(item.itemId, {
            onSettled: () => setIsDeleteModalOpen(false),
          });
        }}
        title="Xóa mặt hàng"
        entityName={item.name}
        message="Bạn có chắc muốn xóa mặt hàng này không? Tất cả biến thể, thuộc tính và liên kết tùy chọn đi kèm cũng sẽ bị xóa."
        isLoading={isDeleting}
      />
    </div>
  );
}

export default Item;
