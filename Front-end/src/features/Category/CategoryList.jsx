import { useState, useMemo, useCallback } from "react";
import { useCategories } from "./useCategories";
import { useDeleteCategory } from "./useDeleteCategory";
import CategoryListItem from "./CategoryListItem";
import ConfirmDeleteModal from "../../ui/ConfirmDeleteModal";
import EditCategoryModal from "./EditCategoryModal";
import Spinner from "../../ui/Spinner";
import { Search } from "lucide-react";

function CategoryList() {
  const { categories, isLoading } = useCategories();
  const { isDeleting, deleteCategory } = useDeleteCategory();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [categoryToEdit, setCategoryToEdit] = useState(null);

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    const term = searchTerm.toLowerCase().trim();
    if (!term) return categories;
    return categories.filter((category) =>
      category.name.toLowerCase().trim().includes(term),
    );
  }, [categories, searchTerm]);

  const handleEdit = useCallback((category) => {
    setCategoryToEdit(category);
  }, []);

  const handleDelete = useCallback((category) => {
    setCategoryToDelete(category);
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search Header */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm danh mục..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Category List Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size={32} className="text-blue-600" />
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-12 text-sm text-slate-400">
            Không tìm thấy danh mục
          </div>
        ) : (
          filteredCategories.map((category, index) => (
            <CategoryListItem
              key={category.categoryId || index}
              category={category}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {categoryToEdit && (
        <EditCategoryModal
          isOpen={Boolean(categoryToEdit)}
          onClose={() => setCategoryToEdit(null)}
          category={categoryToEdit}
        />
      )}

      {categoryToDelete && (
        <ConfirmDeleteModal
          isOpen={Boolean(categoryToDelete)}
          onClose={() => setCategoryToDelete(null)}
          onConfirm={() => {
            deleteCategory(categoryToDelete.categoryId, {
              onSettled: () => setCategoryToDelete(null),
            });
          }}
          title="Xóa danh mục"
          entityName={categoryToDelete.name}
          message="Bạn có chắc muốn xóa danh mục này không? Các mặt hàng thuộc danh mục sẽ không còn được nhóm tại đây."
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}

export default CategoryList;
