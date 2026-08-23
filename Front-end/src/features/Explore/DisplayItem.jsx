import { formatCurrency } from "../../utils/formatCurrency";

function DisplayItem({ addToCart, item }) {
  //name, price, imgUrl, itemId
  const handleAddToCart = () => {
    addToCart({
      name: item.name,
      price: item.price,
      quantity: 1,
      itemId: item.itemId,
    });
  };
  return (
    <div className="p-3 bg-dark rounded shadow-sm h-100 d-flex align-items-center item-card category-hover">
      <div style={{ position: "relative", marginRight: "15px" }}>
        <img src={item.imgUrl} alt={item.name} className="item-image" />
      </div>
      <div className="flex-grow-1 ms-2">
        <h6 className="mb-1 text-light">{item.name}</h6>
        <p className="mb-0 fw-bold text-light">{formatCurrency(item.price)}</p>
      </div>
      <div
        className="d-flex flex-column justify-content-between align-items-center ms-3"
        style={{ height: "100%" }}
      >
        <i className="bi bi-cart-plus fs-4 text-warning"></i>
        <button className="btn btn-sm btn-success" onClick={handleAddToCart}>
          <i className="bi bi-plus"></i>
        </button>
      </div>
    </div>
  );
}
export default DisplayItem;
