import { useState } from "react";
import { useDeleteCategory } from "./useDeleteCategory";
import { Trash2, Pencil } from "lucide-react";
import ConfirmDeleteModal from "../../ui/ConfirmDeleteModal";
import EditCategoryModal from "./EditCategoryModal";

function CategoryListItem({ category }) {
  const { isDeleting, deleteCategory } = useDeleteCategory();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
          onClick={() => setIsEditModalOpen(true)}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
          title="Chỉnh sửa danh mục"
        >
          <Pencil size={16} />
        </button>

        <button
          type="button"
          disabled={isDeleting}
          onClick={() => setIsDeleteModalOpen(true)}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
          title="Xóa danh mục"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          deleteCategory(category.categoryId, {
            onSettled: () => setIsDeleteModalOpen(false),
          });
        }}
        title="Xóa danh mục"
        entityName={category.name}
        message="Bạn có chắc muốn xóa danh mục này không? Các mặt hàng thuộc danh mục sẽ không còn được nhóm tại đây."
        isLoading={isDeleting}
      />

      {isEditModalOpen && (
        <EditCategoryModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          category={category}
        />
      )}
    </div>
  );
}

export default CategoryListItem;
