import CategoryForm from "../features/Category/CategoryForm";
import CategoryList from "../features/Category/CategoryList";
function ManageCategory() {
  return (
    <div className="item-container">
      <div className="left-column">
        <CategoryForm />
      </div>
      <div className="right-column">
        <CategoryList />
      </div>
    </div>
  );
}
export default ManageCategory;
