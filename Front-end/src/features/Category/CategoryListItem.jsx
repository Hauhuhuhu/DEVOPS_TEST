import { memo } from "react";
import { Trash2, Pencil } from "lucide-react";

function CategoryListItem({ category, onEdit, onDelete }) {
  return (
    <div
      className="p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 transition-all hover:shadow-sm"
      style={{
        backgroundColor: category.bgColor ? `${category.bgColor}15` : "#ffffff",
        borderLeftColor: category.bgColor || "#2563EB",
        borderLeftWidth: "4px",
      }}
    >
      <div className="flex items-center gap-3">
        <img
          src={category.imgUrl || "https://placehold.co/60x60?text=Cat"}
          alt={category.name}
          className="w-12 h-12 rounded-lg object-cover border border-slate-200/80 bg-white"
        />
        <div>
          <h4 className="text-sm font-semibold text-slate-900">{category.name}</h4>
          <p className="text-xs text-slate-500 mt-0.5">{category.items || 0} mặt hàng</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onEdit?.(category)}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
          title="Chỉnh sửa danh mục"
        >
          <Pencil size={16} />
        </button>

        <button
          type="button"
          onClick={() => onDelete?.(category)}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          title="Xóa danh mục"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export default memo(CategoryListItem);
