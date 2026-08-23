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
    <div className="row g-3" style={{ width: "100%", margin: 0 }}>
      {categories?.map((category, index) => (
        <div
          key={index}
          className="col-sm-6 col-md-3"
          style={{ padding: "0 10px" }}
        >
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
