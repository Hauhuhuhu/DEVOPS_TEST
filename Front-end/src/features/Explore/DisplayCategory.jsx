function DisplayCategory({ category, isSelected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all cursor-pointer select-none ${
        isSelected
          ? "border-blue-600 bg-blue-50/80 shadow-xs"
          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white"
      }`}
    >
      <img
        src={category.imgUrl || "https://placehold.co/40x40?text=DM"}
        alt={category.name}
        className="w-10 h-10 rounded-lg object-cover border border-slate-200/80 flex-shrink-0"
      />
      <div className="min-w-0 pr-1">
        <h6 className={`text-xs font-semibold truncate ${isSelected ? "text-blue-900" : "text-slate-800"}`}>
          {category.name}
        </h6>
        <p className={`text-[11px] ${isSelected ? "text-blue-700" : "text-slate-500"}`}>
          {category.items || 0} mặt hàng
        </p>
      </div>
      {isSelected && (
        <div className="w-2 h-2 rounded-full bg-blue-600 ml-auto flex-shrink-0" />
      )}
    </div>
  );
}

export default DisplayCategory;
