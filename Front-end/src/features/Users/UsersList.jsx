import { useState } from "react";
import { useUsers } from "./useUsers";
import Spinner from "../../ui/Spinner";
import UserItem from "./UserItem";

function UsersList() {
  const { isLoading, users } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users?.filter((user) =>
    user?.name?.toLowerCase().trim().includes(searchTerm.toLowerCase()),
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
            placeholder="Search users..."
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
          filteredUsers?.map((user, index) => (
            <UserItem key={index} user={user} />
          ))
        )}
      </div>
    </div>
  );
}
export default UsersList;
