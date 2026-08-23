function DisplayCategory({ category, isSelected, onClick }) {
  // name, imgUrl, items, bgColor, description
  return (
    <div
      onClick={onClick}
      className="d-flex align-items-center p-3 rounded gap-1 position-relative category-hover"
      style={{ backgroundColor: category.bgColor, cursor: "pointer" }}
    >
      <div style={{ position: "relative", marginRight: "15px" }}>
        <img
          src={category.imgUrl}
          alt={category.name}
          className="category-image"
        />
      </div>
      <div>
        <h6 className="text-white mb-0">{category.name}</h6>
        <p className="text-white mb-0">{category.items} Items</p>
      </div>
      {isSelected && <div className="active-category"></div>}
    </div>
  );
}
export default DisplayCategory;
