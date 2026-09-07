import { useState } from "react";
import { useDeleteCategory } from "./useDeleteCategory";
import { Trash2 } from "lucide-react";
import ConfirmDeleteModal from "../../ui/ConfirmDeleteModal";

function CategoryListItem({ category }) {
  const { isDeleting, deleteCategory } = useDeleteCategory();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
          <p className="text-xs text-slate-500 mt-0.5">{category.items || 0} Items</p>
        </div>
      </div>

      <button
        type="button"
        disabled={isDeleting}
        onClick={() => setIsDeleteModalOpen(true)}
        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
        title="Delete category"
      >
        <Trash2 size={16} />
      </button>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          deleteCategory(category.categoryId, {
            onSettled: () => setIsDeleteModalOpen(false),
          });
        }}
        title="Delete Category"
        entityName={category.name}
        message="Are you sure you want to delete this category? Items under this category will no longer be grouped."
        isLoading={isDeleting}
      />
    </div>
  );
}

export default CategoryListItem;
