import Spinner from "../../ui/Spinner";
import { formatCurrency } from "../../utils/formatCurrency";
import { useDeleteItem } from "./useDeleteItem";

function Item({ item }) {
  const { isDeleting, deleteItem } = useDeleteItem();
  return (
    <div className="col-12">
      <div className="card p-3 bg-dark">
        <div className="d-flex align-items-center">
          <div style={{ marginRight: "15px" }}>
            <img src={item.imgUrl} alt={item.name} className="item-image" />
          </div>
          <div className="flex-grow-1">
            <h6 className="mb-1 text-white">{item.name}</h6>
            <p className="mb-0 text-white">Category: {item.categoryName}</p>
            <span className="mb-0 text-block badge rounded-pill text-bg-warning">
              {formatCurrency(item.price)}
            </span>
          </div>
          <div>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => deleteItem(item.itemId)}
              disabled={isDeleting}
            >
              {isDeleting ? <Spinner /> : <i className="bi bi-trash"></i>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Item;
