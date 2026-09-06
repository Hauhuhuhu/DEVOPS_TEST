import DisplayCategory from "./DisplayCategory";

function DisplayCategories({
  selectedCategory,
  setSelectedCategory,
  categories,
}) {
  function handleCategoryClick(categoryId) {
    if (selectedCategory === categoryId) {
      setSelectedCategory("");
      return;
    }
    setSelectedCategory(categoryId);
  }

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

export default DisplayCategories;
