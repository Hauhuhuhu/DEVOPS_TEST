import { useState } from "react";
import Spinner from "../../ui/Spinner";
import { useItems } from "../Items/useItems";
import DisplayItem from "./DisplayItem";
import SearchBox from "./SearchBox";
import { PackageOpen } from "lucide-react";

function DisplayItems({ addToCart, selectedCategory }) {
  const { items, isLoading } = useItems();
  const [searchText, setSearchText] = useState("");

  const filteredItems = items
    ?.filter((item) => {
      if (selectedCategory) {
        return item.categoryId == selectedCategory;
      }
      return true;
    })
    .filter((item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase()),
    );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Spinner size={32} className="text-blue-600" />
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Products ({filteredItems?.length || 0})
        </span>
        <SearchBox searchText={searchText} setSearchText={setSearchText} />
      </div>

      {filteredItems?.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <PackageOpen size={40} className="mx-auto mb-2 text-slate-300" />
          <p className="text-sm">No items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredItems?.map((item, index) => (
            <DisplayItem key={item.itemId || index} addToCart={addToCart} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default DisplayItems;
