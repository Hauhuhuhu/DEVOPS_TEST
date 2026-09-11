import { useState } from "react";
import Spinner from "../../ui/Spinner";
import Item from "./Item";
import { useItems } from "./useItems";
import { Search, PackageOpen } from "lucide-react";

function ItemList() {
  const { items, isLoading } = useItems();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = items?.filter((item) =>
    item.name.toLowerCase().trim().includes(searchTerm.toLowerCase()),
  );

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
        ) : filteredItems?.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <PackageOpen size={36} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm">Không tìm thấy mặt hàng</p>
          </div>
        ) : (
          filteredItems?.map((item, index) => (
            <Item key={item.itemId || index} item={item} />
          ))
        )}
      </div>
    </div>
  );
}

export default ItemList;
