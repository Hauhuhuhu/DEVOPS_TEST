import { useState } from "react";
import Spinner from "../../ui/Spinner";
import Item from "./Item";
import { useItems } from "./useItems";

function ItemList() {
  const { items, isLoading } = useItems();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = items?.filter((item) =>
    item.name.toLowerCase().trim().includes(searchTerm.toLowerCase()),
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
          filteredItems?.map((item, index) => <Item key={index} item={item} />)
        )}
      </div>
    </div>
  );
}
export default ItemList;
