function SearchBox({ searchText, setSearchText }) {
  return (
    <div className="input-group mb-3">
      <input
        type="text"
        placeholder="Search items..."
        className="form-control"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
      <span className="input-group-text bg-warning">
        <i className="bi bi-search"></i>
      </span>
    </div>
  );
}
export default SearchBox;
