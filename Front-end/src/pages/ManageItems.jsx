import ItemForm from "../features/Items/ItemForm";
import ItemList from "../features/Items/ItemList";

function ManageItems() {
  return (
    <div className="item-container">
      <div className="left-column">
        <ItemForm />
      </div>
      <div className="right-column">
        <ItemList />
      </div>
    </div>
  );
}
export default ManageItems;
