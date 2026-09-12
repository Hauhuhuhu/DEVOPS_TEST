import { useCallback, memo } from "react";
import DisplayCategory from "./DisplayCategory";

function DisplayCategories({
  selectedCategory,
  setSelectedCategory,
  categories,
}) {
  const handleCategoryClick = useCallback((categoryId) => {
    setSelectedCategory((prev) => (prev === categoryId ? "" : categoryId));
  }, [setSelectedCategory]);

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-1">
      {categories?.map((category, index) => (
        <div key={category.categoryId || index} className="flex-shrink-0">
          <DisplayCategory
            category={category}
            isSelected={selectedCategory === category.categoryId}
            onClick={() => handleCategoryClick(category.categoryId)}
          />
        </div>
      ))}
    </div>
  );
}

export default memo(DisplayCategories);

