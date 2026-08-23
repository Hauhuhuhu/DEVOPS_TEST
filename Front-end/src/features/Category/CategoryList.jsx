import { useCategories } from "./useCategories";
import { useState } from "react";
import CategoryListItem from "./CategoryListItem";
import Spinner from "../../ui/Spinner";
function CategoryList() {
  const { categories, isLoading } = useCategories();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = categories?.filter((category) =>
    category.name.toLowerCase().trim().includes(searchTerm.toLowerCase()),
  );

  return (
    <div
      className="category-list-container"
      style={{ height: "100%", overflowY: "auto", overflowX: "hidden" }}
    >
      <div className="row pe-2">
        <div className="input-group mb-3 block">
          <input
            type="text"
            name="keyword"
            id="keyword"
            placeholder="Search categories..."
            className="form-control"
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
          />
          <span className="input-group-text bg-warning">
            <i className="bi bi-search"></i>
          </span>
        </div>
      </div>
      <div className="row g-3 pe-2">
        {isLoading ? (
          <Spinner />
        ) : (
          filteredCategories?.map((category, index) => (
            <CategoryListItem key={index} category={category} />
          ))
        )}
      </div>
    </div>
  );
}
export default CategoryList;
