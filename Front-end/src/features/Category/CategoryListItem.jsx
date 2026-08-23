import { useDeleteCategory } from "./useDeleteCategory";
function CategoryListItem({ category }) {
  const { isDeleting, deleteCategory } = useDeleteCategory();
  return (
    <div className="col-12">
      <div className="card p-3" style={{ backgroundColor: category.bgColor }}>
        <div className="d-flex align-items-center">
          <div style={{ marginRight: "15px" }}>
            <img
              src={category.imgUrl}
              alt={category.name}
              className="category-image"
            />
          </div>
          <div className="flex-grow-1">
            <h5 className="mb-1 text-white">{category.name}</h5>
            <p className="mb-0 text-white">{category.items} Item</p>
          </div>
          <div>
            {/* <button className="btn btn-sm btn-light me-2">Edit</button> */}
            <button
              className="btn btn-sm btn-danger"
              disabled={isDeleting}
              onClick={() => deleteCategory(category.categoryId)}
            >
              {isDeleting ? "Deleting..." : <i className="bi bi-trash"></i>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default CategoryListItem;
