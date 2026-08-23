import UserForm from "../features/Users/UserForm";
import UsersList from "../features/Users/UsersList";

function ManageUsers() {
  return (
    <div className="item-container">
      <div className="left-column">
        <UserForm />
      </div>
      <div className="right-column">
        <UsersList />
      </div>
    </div>
  );
}
export default ManageUsers;
