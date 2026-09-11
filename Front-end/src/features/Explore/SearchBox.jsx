import { Search } from "lucide-react";

function SearchBox({ searchText, setSearchText }) {
  return (
    <div className="relative w-64">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        placeholder="Tìm kiếm mặt hàng..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      />
    </div>
  );
}

export default SearchBox;
