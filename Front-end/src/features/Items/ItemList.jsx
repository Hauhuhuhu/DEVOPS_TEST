import { useState, useMemo, useCallback } from "react";
import Spinner from "../../ui/Spinner";
import Item from "./Item";
import { useItems } from "./useItems";
import { useDeleteItem } from "./useDeleteItem";
import ConfirmDeleteModal from "../../ui/ConfirmDeleteModal";
import EditItemModal from "./EditItemModal";
import { Search, PackageOpen } from "lucide-react";

function ItemList() {
  const { items, isLoading } = useItems();
  const { isDeleting, deleteItem } = useDeleteItem();
  const [searchTerm, setSearchTerm] = useState("");
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToEdit, setItemToEdit] = useState(null);

  const filteredItems = useMemo(() => {
    if (!items) return [];
    const term = searchTerm.toLowerCase().trim();
    if (!term) return items;
    return items.filter((item) =>
      item.name.toLowerCase().trim().includes(term),
    );
  }, [items, searchTerm]);

  const handleEdit = useCallback((item) => {
    setItemToEdit(item);
  }, []);

  const handleDelete = useCallback((item) => {
    setItemToDelete(item);
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search Header */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm mặt hàng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Item List Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size={32} className="text-blue-600" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <PackageOpen size={36} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm">Không tìm thấy mặt hàng</p>
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <Item
              key={item.itemId || index}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {itemToEdit && (
        <EditItemModal
          isOpen={Boolean(itemToEdit)}
          onClose={() => setItemToEdit(null)}
          item={itemToEdit}
        />
      )}

      {itemToDelete && (
        <ConfirmDeleteModal
          isOpen={Boolean(itemToDelete)}
          onClose={() => setItemToDelete(null)}
          onConfirm={() => {
            deleteItem(itemToDelete.itemId, {
              onSettled: () => setItemToDelete(null),
            });
          }}
          title="Xóa mặt hàng"
          entityName={itemToDelete.name}
          message="Bạn có chắc muốn xóa mặt hàng này không? Tất cả biến thể, thuộc tính và liên kết tùy chọn đi kèm cũng sẽ bị xóa."
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}

export default ItemList;
