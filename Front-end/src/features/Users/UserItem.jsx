import Spinner from "../../ui/Spinner";
import { useDeleteUser } from "./useDeleteUser";

function UserItem({ user }) {
  const { isDeleting, deleteUser } = useDeleteUser();
  return (
    <div className="col-12">
      <div className="card p-3 bg-dark">
        <div className="d-flex align-items-center">
          <div className="flex-grow-1">
            <h5 className="mb-1 text-white">{user.name}</h5>
            <p className="mb-0 text-white">{user.email}</p>
          </div>
          <div>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => deleteUser(user.userId)}
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
export default UserItem;
