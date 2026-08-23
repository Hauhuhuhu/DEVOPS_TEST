import { useState } from "react";
import Spinner from "../../ui/Spinner";
import { useItems } from "../Items/useItems";
import DisplayItem from "./DisplayItem";
import SearchBox from "./SearchBox";

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
  if (isLoading) return <Spinner />;
  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div></div>
        <div>
          <SearchBox searchText={searchText} setSearchText={setSearchText} />
        </div>
      </div>
      <div className="row g-3">
        {filteredItems?.map((item, index) => (
          <div key={index} className="col-md-4 col-sm-6">
            <DisplayItem addToCart={addToCart} item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}
export default DisplayItems;
